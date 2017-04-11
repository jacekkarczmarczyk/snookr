class SnookrController {
    /**
     *
     * @param {[string, string]} playerNames
     * @param {ResourceLoader} resourceLoader
     */
    constructor(playerNames, resourceLoader) {
        this.gameId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        this.gameState = {
            players: [{
                name: playerNames[0]
            }, {
                name: playerNames[1]
            }],
            spinPower: new SpinPower()
        };
        this.tableRenderer = new SnookrRenderer(resourceLoader);
        this.tableController = new SnookrTableController(this.tableRenderer, {
            cueBallPositionChangedCallback: ({position}) => this.setCueBallPosition(position),
            shotFiredCallback: ({speed}) => this.shotFired(speed)
        });
        this.resetTable();

        this.$bus = (new Vue).$bus;
        this.$bus.on('snookrEvent.tableViewMounted', function ({gameId, containerElement, canvasElement, backgroundImageElement, cueElement}) {
            gameId === this.getGameId() && this.tableRenderer.mount(containerElement, canvasElement, backgroundImageElement, cueElement);
        }.bind(this));

        const self = this;
        window.addEventListener('mousedown', function () {
            self.snookr && !self.gameState.currentGameState.playing && self.tableController.handleMouseDown(self.snookr.getCueBall(), self.gameState.currentGameState);
            window.requestAnimationFrame(() => self.tableController.repaint(self.snookr.getBallSet(), self.snookr.getCueBall(), self.gameState.currentGameState))
        });
        window.addEventListener('mouseup', function() {
            self.snookr && !self.gameState.currentGameState.playing && self.tableController.handleMouseUp(self.snookr.getCueBall(), self.gameState.currentGameState);
            window.requestAnimationFrame(() => self.tableController.repaint(self.snookr.getBallSet(), self.snookr.getCueBall(), self.gameState.currentGameState))
        });
        window.addEventListener('mousemove', function (event) {
            self.snookr && !self.gameState.currentGameState.playing && self.tableController.handleMouseMove(event, self.snookr.getCueBall(), self.snookr.getBallSet(), self.gameState.currentGameState);
            window.requestAnimationFrame(() => self.tableController.repaint(self.snookr.getBallSet(), self.snookr.getCueBall(), self.gameState.currentGameState))
        });
        window.addEventListener('hashchange', () => this.resetTable());
        window.addEventListener('keydown', function ({which, ctrlKey}) {
            switch (which) {
                case 37:
                    self.gameState.spinPower.changeSideSpinPower(-1 / 12);
                    break;
                case 39:
                    self.gameState.spinPower.changeSideSpinPower(1 / 12);
                    break;
                case 40:
                    self.gameState.spinPower.changeForwardSpinPower(-1 / 12);
                    break;
                case 38:
                    self.gameState.spinPower.changeForwardSpinPower(1 / 12);
                    break;
                case 90:
                    if (ctrlKey && self.stateManager.canPopState() && confirm('Undo?')) {
                        self.gameState.currentGameState.playing = false;
                        self.stateManager.popState();
                        self.resetShot();
                        self.updateGameState({
                            shooting: true,
                            playing: false,
                            settingCueBall: false
                        });
                    }
                    break;
            }
        });

        this.nextTimeFrameBinded = this.nextTimeFrame.bind(this);
        this.audioPlayer = new SnookrAudioPlayer();
    }

    /**
     *
     * @returns {string}
     */
    getGameId() {
        return this.gameId;
    }

    /**
     *
     * @param {string} name
     * @returns {*}
     */
    static getGameConstructor(name) {
        return {
            regular: SnookrGameRegular,
            funky: SnookrGameFunky,
            real: SnookrGameReal,
            black: SnookrGameBlack,
            'default': SnookrGameArcade,
        }[name];
    }

    /**
     *
     * @returns {SnookrGame}
     */
    getGame() {
        return this.snookr;
    }

    /**
     *
     * @returns {*}
     */
    getGameState() {
        return this.gameState;
    }

    resetShot() {
        this.shotData = new SnookrShotData();
        this.gameState.spinPower.clear();
    }

    resetGame() {
        this.getGame().resetGame();
        this.breakingPlayer = 1 - this.breakingPlayer;
        this.stateManager.reset();
        this.nextShot([this.getGame().getInitialRule(this.breakingPlayer)], true);
    }

    resetMatch() {
        this.gameState.numberOfFrames = 7;
        this.gameState.players[0].framesWon = 0;
        this.gameState.players[1].framesWon = 0;

        this.breakingPlayer = Math.floor(Math.random() * 2);
        this.resetGame();
    }

    resetTable() {
        const gameConstructor = SnookrController.getGameConstructor(window.location.hash.replace('#', '')) || SnookrController.getGameConstructor('default');
        this.snookr = new gameConstructor;
        this.stateManager = new SnookrGameStateManager(this.getGame().getBallSet());
        this.tableRenderer.setTable(this.snookr.getTable());
        this.resetMatch();
    }

    updateGameState(currentGameState) {
        this.gameState.players[0].score = this.stateManager.getScore()[0];
        this.gameState.players[1].score = this.stateManager.getScore()[1];

        this.gameState.players[0].breakValue = this.stateManager.getBreakScore()[0];
        this.gameState.players[1].breakValue = this.stateManager.getBreakScore()[1];

        this.gameState.currentPlayer = this.stateManager.getPlayer();
        this.gameState.currentRule = this.stateManager.getRule() ? this.stateManager.getRule().toString() : '';

        // todo
        this.gameState.isSnooker = false;

        this.gameState.currentGameState = currentGameState;
    }

    /**
     *
     * @param {Array.<SnookrRule>} nextRules
     * @param {boolean} settingCueBall
     */
    nextShot(nextRules, settingCueBall) {
        const nextRule = this.selectNextRule(nextRules);

        if (nextRule instanceof SnookrRuleFrameOver) {
            this.gameCompleted();
            return;
        }

        this.stateManager.setRule(nextRule);
        this.updateGameState({
            playing: false,
            shooting: true,
            settingCueBall
        });
        this.resetShot();
    }

    nextTimeFrame() {
        this.tableController.repaint(this.snookr.getBallSet(), this.snookr.getCueBall(), this.gameState.currentGameState);

        if (!this.gameState.currentGameState.playing) {
            return;
        }

        const timeFrameData = this.getGame().getPhysics().recalculatePositions(this.getGame().getBallSet(), this.getGame().getFrameLength());
        this.shotData.update(timeFrameData);

        if (timeFrameData.getBallHitsBallPower()) {
            this.audioPlayer.playBallHitsBall(timeFrameData.getBallHitsBallPower());
        }

        if (timeFrameData.getBallsPotted().count()) {
            this.audioPlayer.playBallHitsPocket();
        }

        if (this.getGame().getBallSet().allStopped()) {
            this.shotCompleted();
        }

        window.requestAnimationFrame(this.nextTimeFrameBinded);
    }

    /**
     *
     * @param {Point} position
     */
    setCueBallPosition(position) {
        this.getGame().setCueBallPosition(position);
    }

    /**
     *
     * @param {Vector} speed
     */
    shotFired(speed) {
        this.stateManager.pushState();

        const shotPower = Math.min(this.getGame().getPhysics().getSetting('maxShotPower'), speed.getLength());
        speed = speed.clone().normalize(shotPower);
        const forwardSpin = speed.clone().scale(this.gameState.spinPower.getForwardSpinPower() * Math.sqrt(shotPower / 5) * this.getGame().getPhysics().getSetting('forwardSpinScale'));
        const sideSpin = -this.gameState.spinPower.getSideSpinPower() * shotPower * this.getGame().getPhysics().getSetting('sideSpinScale');

        this.audioPlayer.playCueHitsBall(shotPower / this.getGame().getPhysics().getSetting('maxShotPower'));

        const cueBall = this.getGame().getCueBall();
        cueBall.setSpeed(speed);
        cueBall.setForwardSpin(forwardSpin);
        cueBall.setSideSpin(sideSpin);
        this.gameState.currentGameState.playing = true;
        this.gameState.currentGameState.shooting = false;
        this.gameState.currentGameState.settingCueBall = false;
        this.nextTimeFrame();
    }

    shotCompleted() {
        const ballsToUnpot = this.stateManager.getRule().getBallsToUnpot(this.shotData);
        const ballsUnpotted = this.getGame().getBallSet().unpotted();
        const nextRules = this.stateManager.getRule().getNextRules(this.shotData, ballsUnpotted);

        this.getGame().unpotBalls(ballsToUnpot);

        this.stateManager.setResult(this.shotData);

        this.nextShot(nextRules, !!ballsToUnpot.first('white'));
    }

    gameCompleted() {
        this.gameState.players[0].framesWon += 1 * (this.stateManager.getScore()[0] > this.stateManager.getScore()[1]);
        this.gameState.players[1].framesWon += 1 * (this.stateManager.getScore()[1] > this.stateManager.getScore()[0]);

        if (this.gameState.players[0].framesWon + this.gameState.players[1].framesWon === this.gameState.numberOfFrames) {
            const self = this;
            window.setTimeout(function () {
                alert('Game over!');
                self.resetMatch();
            });
        } else {
            this.resetGame();
        }
    }

    /**
     *
     * @param {Array.<SnookrRule>} nextRules
     * @returns {SnookrRule}
     */
    selectNextRule(nextRules) {
        let nextRuleIndex = 0;

        if (nextRules.length > 1) {
            let text = "What next?";
            nextRules.forEach(function (rule, index) {
                text += "\n" + (index + 1) + ': ' + rule.toString();
            });

            do {
                try {
                    nextRuleIndex = Math.max(0, (window.prompt(text) >>> 0) - 1);
                } catch (e) {
                }
            } while (nextRuleIndex < 0 || nextRuleIndex >= nextRules.length);
        }

        return nextRules[nextRuleIndex];
    }

}
