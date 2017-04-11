class SnookrController {
    /**
     *
     * @param {[string, string]} playerNames
     */
    constructor(playerNames) {
        this.gameId = SnookrController.gameId = (SnookrController.gameId >>> 0) + 1;
        this.gameLoader = new SnookrGameLoader(new SnookrGameConfigResolver());
        this.tableRenderer = new SnookrRenderer();
        this.tableController = new SnookrTableController();
        this.tableController.onCueBallPositionChanged(this.setCueBallPosition.bind(this));
        this.tableController.onShotFired(this.shotFired.bind(this));

        this.audioPlayer = new SnookrAudioPlayer();
        this.$bus = (new Vue).$bus;
        this.gameState = {
            players: [{
                name: playerNames[0]
            }, {
                name: playerNames[1]
            }],
            spinPower: new SpinPower(),
            currentGameState: {
                playing: false,
                shooting: false,
                settingCueBall: false
            },
            isSnooker: false,
            currentRule: '',
            currentPlayer: -1
        };

        this.initListeners();
        this.resetTable();
    }

    initListeners() {
        const repaint = this.repaint.bind(this);

        window.addEventListener('mousedown', function () {
            this.snookr && !this.gameState.currentGameState.playing && this.tableController.handleMouseDown(this.tableRenderer, this.snookr.getCueBall(), this.gameState.currentGameState);
            window.requestAnimationFrame(repaint);
        }.bind(this));

        window.addEventListener('mouseup', function() {
            this.snookr && this.tableController.handleMouseUp(this.tableRenderer, this.snookr.getCueBall(), this.gameState.currentGameState);
            !this.gameState.currentGameState.playing && window.requestAnimationFrame(repaint);
        }.bind(this));

        window.addEventListener('mousemove', function (event) {
            this.snookr && this.tableController.handleMouseMove(event, this.tableRenderer, this.snookr.getCueBall(), this.gameState.currentGameState);
            !this.gameState.currentGameState.playing && window.requestAnimationFrame(repaint);
        }.bind(this));

        window.addEventListener('hashchange', () => this.resetTable());

        window.addEventListener('keydown', function ({which, ctrlKey}) {
            switch (which) {
                case 37:
                    !this.gameState.currentGameState.playing && this.gameState.spinPower.changeSideSpinPower(-1 / 12);
                    break;
                case 39:
                    !this.gameState.currentGameState.playing && this.gameState.spinPower.changeSideSpinPower(1 / 12);
                    break;
                case 40:
                    !this.gameState.currentGameState.playing && this.gameState.spinPower.changeForwardSpinPower(-1 / 12);
                    break;
                case 38:
                    !this.gameState.currentGameState.playing && this.gameState.spinPower.changeForwardSpinPower(1 / 12);
                    break;
                case 90:
                    if (ctrlKey && this.stateManager.canPopState() && confirm('Undo?')) {
                        this.gameState.currentGameState.playing = false;
                        this.stateManager.popState();
                        this.resetShot();
                        this.updateGameState({
                            shooting: true,
                            playing: false,
                            settingCueBall: false
                        });
                        this.repaint();
                    }
                    break;
            }
        }.bind(this));

        this.$bus.on('snookrEvent.tableViewMounted', function ({gameId, containerElement, canvasElement, backgroundImageElement, cueElement}) {
            gameId === this.getGameId() && this.tableRenderer.mount(containerElement, canvasElement, backgroundImageElement, cueElement);
        }.bind(this));
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
        const self = this;
        return this.gameLoader.load(window.location.hash.replace(/[^a-z]/g, '')).then(function (game) {
            self.snookr = game;
            self.stateManager = new SnookrGameStateManager(game.getBallSet());
            self.resetMatch();

            self.tableRenderer.setTable(game.getTable());
            self.tableRenderer.setResourceLoader(game.getResourceLoader());
            self.tableController.setPositionValidator(game.validateCueBallPosition.bind(game));
            self.repaint();
        });
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

    repaint() {
        this.snookr && this.tableController.repaint(this.tableRenderer, this.snookr.getBallSet(), this.snookr.getCueBall(), this.gameState.currentGameState);
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

    /**
     *
     * @param {SnookrShotData} shotData
     */
    nextTimeFrame(shotData) {
        this.repaint();

        if (!this.gameState.currentGameState.playing) {
            return;
        }

        const timeFrameData = this.getGame().getPhysics().recalculatePositions(this.getGame().getBallSet(), 1);
        shotData.update(timeFrameData);

        if (timeFrameData.getBallHitsBallPower()) {
            this.audioPlayer.playBallHitsBall(timeFrameData.getBallHitsBallPower());
        }

        if (timeFrameData.getBallsPotted().count()) {
            this.audioPlayer.playBallHitsPocket();
        }

        if (this.getGame().getBallSet().allStopped()) {
            this.shotCompleted(shotData);
        }

        window.requestAnimationFrame(() => this.nextTimeFrame(shotData));
    }

    /**
     *
     * @param {Point} position
     */
    setCueBallPosition({position}) {
        this.getGame().setCueBallPosition(position);
    }

    /**
     *
     * @param {Vector} speed
     */
    shotFired({speed}) {
        this.stateManager.pushState();

        const shotPower = Math.min(this.getGame().getPhysics().getSetting('maxShotPower'), speed.getLength());
        speed = speed.clone().normalize(shotPower);
        const forwardSpin = speed.clone().scale(this.gameState.spinPower.getForwardSpinPower() * Math.sqrt(shotPower) * this.getGame().getPhysics().getSetting('forwardSpinScale'));
        const sideSpin = -this.gameState.spinPower.getSideSpinPower() * shotPower * this.getGame().getPhysics().getSetting('sideSpinScale');

        this.audioPlayer.playCueHitsBall(shotPower / this.getGame().getPhysics().getSetting('maxShotPower'));

        const cueBall = this.getGame().getCueBall();
        cueBall.setSpeed(speed);
        cueBall.setForwardSpin(forwardSpin);
        cueBall.setSideSpin(sideSpin);
        this.gameState.currentGameState.playing = true;
        this.gameState.currentGameState.shooting = false;
        this.gameState.currentGameState.settingCueBall = false;
        this.nextTimeFrame(new SnookrShotData);
    }

    shotCompleted(shotData) {
        const ballsToUnpot = this.stateManager.getRule().getBallsToUnpot(shotData);
        const ballsUnpotted = this.getGame().getBallSet().unpotted();
        const nextRules = this.stateManager.getRule().getNextRules(shotData, ballsUnpotted);

        this.getGame().unpotBalls(ballsToUnpot);

        this.stateManager.setResult(shotData);

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
