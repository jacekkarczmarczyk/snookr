class SnookrController {
    /**
     *
     * @param {[string, string]} playerNames
     */
    constructor(playerNames) {
        this.gameState = {
            players: [{
                name: playerNames[0]
            }, {
                name: playerNames[1]
            }],
            spinPower: new SpinPower()
        };
        this.resetTable();

        this.$bus = (new Vue).$bus;
        this.$bus.on('snookrEvent.shotFired', ({speed}) => this.shotFired(speed));
        this.$bus.on('snookrEvent.cueBallPositionChanged', ({position}) => this.snookr.getCueBall().setPosition(position));

        const self = this;
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
                        self.stateManager.popState();
                        self.gameState.spinPower.clear();
                        self.updateGameState({
                            shooting: true,
                            playing: false,
                            settingCueBall: false
                        });
                    }
                    break;
            }
        });

//        this.audioPlayer = new SnookrAudioPlayer(snookr.getEventListener());
//         this.getData().snookr.getEventListener().on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.selectNextRule(nextRules));
//         this.getData().snookr.getEventListener().on(SnookrEvent.BALLS_STOPPED, () => this.ballsStopped(false));
//         this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.endGame(score));
//         this.getData().snookr.getEventListener().on(SnookrEvent.SNOOKER_CREATED, () => this.ballsStopped(true));
    }

    /**
     *
     * @returns {*}
     */
    getGameState() {
        return this.gameState;
    }

    resetGame() {
        this.stateManager = this.snookr.getGameStateManager();

        this.updateGameState({
            playing: false,
            shooting: true,
            settingCueBall: true
        });
    }

    resetMatch() {
        this.gameState.numberOfFrames = 7;
        this.gameState.players[0].framesWon = 0;
        this.gameState.players[1].framesWon = 0;

        this.resetGame();
    }

    resetTable() {
        this.snookr = (function () {
            switch (window.location.hash) {
                case '#test':
                    return new SnookrGameTest();
                case '#regular':
                    return new SnookrGameRegular();
                case '#real':
                    return new SnookrGameReal();
                default:
                    return new SnookrGameArcade();
            }
        }());

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

    tick() {
        this.$bus.emit('snookrEvent.repaintTable', {
            snookr: this.snookr
        });

        const result = this.gameState.currentGameState.playing ? this.snookr.tick() : null;
        if (result) {
            this.shotCompleted(result.firstTouched, result.ballsPotted);
        }

        window.requestAnimationFrame(() => this.tick());
    }

    /**
     *
     * @param {Vector} speed
     */
    shotFired(speed) {
        this.stateManager.pushState();

        const shotPower = Math.min(this.snookr.getPhysics().getSetting('maxShotPower'), speed.getLength());
        speed = speed.scale(shotPower / speed.getLength());
        const forwardSpin = speed.scale(this.gameState.spinPower.getForwardSpinPower() * Math.sqrt(shotPower / 5) * this.snookr.getPhysics().getSetting('forwardSpinScale'));
        const sideSpin = -this.gameState.spinPower.getSideSpinPower() * shotPower * this.snookr.getPhysics().getSetting('sideSpinScale');

        this.snookr.getCueBall().setMovement(new BallMovement(speed, new Spin(forwardSpin, sideSpin)));
        this.gameState.currentGameState.playing = true;
        this.gameState.currentGameState.shooting = false;
        this.gameState.currentGameState.settingCueBall = false;
    }

    shotCompleted(firstTouched, ballsPotted) {
        this.stateManager.setResult(firstTouched, ballsPotted);

        const ballsToUnpot = this.stateManager.getBallsToUnpot();
        this.snookr.unpotBalls(ballsToUnpot);
        this.gameState.spinPower.clear();

        const nextRules = this.snookr.getGameStateManager().getNextRules();
        if (!nextRules) {
            this.gameCompleted();
            return;
        }

        this.snookr.getGameStateManager().selectNextRule(this.selectNextRule(nextRules));

        this.updateGameState({
            playing: false,
            shooting: true,
            settingCueBall: ballsToUnpot.first('white') ? true : false
        });
    }

    gameCompleted() {
        this.gameState.players[0].framesWon += 1 * (this.stateManager.getScore()[0] > this.stateManager.getScore()[1]);
        this.gameState.players[1].framesWon += 1 * (this.stateManager.getScore()[1] > this.stateManager.getScore()[0]);

        if (this.gameState.players[0].framesWon + this.gameState.players[1].framesWon === this.gameState.numberOfFrames) {
            alert('Game over!');
            this.resetMatch();
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
