class SnookrController {
    constructor() {
        this.$bus = (new Vue).$bus;
    }

    /**
     *
     * @returns {SnookrGame}
     */
    createGame() {
        switch (window.location.hash) {
            case '#test':
                return new SnookrGameTest();
            case '#arcade':
                return new SnookrGameArcade();
            case '#regular':
                return new SnookrGameRegular();
            case '#real':
                return new SnookrGameReal();
            default:
                return new SnookrGameArcade();
        }
    }

    run(gameState) {
//        this.audioPlayer = new SnookrAudioPlayer(snookr.getEventListener());
//         this.getData().snookr.getEventListener().on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.selectNextRule(nextRules));
//         this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.getData().snookr.resetGame());
//         this.getData().snookr.getEventListener().on(SnookrEvent.BALLS_STOPPED, () => this.ballsStopped(false));
//         this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.endGame(score));
//         this.getData().snookr.getEventListener().on(SnookrEvent.SNOOKER_CREATED, () => this.ballsStopped(true));

        window.addEventListener('hashchange', () => data.snookr = createGame());
        window.addEventListener('keydown', function ({which, ctrlKey}) {
            switch (which) {
                case 37:
                    gameState.spinPower.changeSideSpinPower(-1 / 12);
                    break;
                case 39:
                    gameState.spinPower.changeSideSpinPower(1 / 12);
                    break;
                case 40:
                    gameState.spinPower.changeForwardSpinPower(-1 / 12);
                    break;
                case 38:
                    gameState.spinPower.changeForwardSpinPower(1 / 12);
                    break;
                case 90:
                    // if (ctrlKey && data.snookr.getGameStateManager().canRollback() && confirm('Undo?')) {
                    //     data.snookr.getGameStateManager().rollback();
                    //     gameState.spinPower.clear();
                    // }
                    break;
            }
        });

        this.snookr = this.createGame();

        this.$bus.on('snookrEvent.shotFired', ({shotPower, dragSpeedVector}) => this.shotFired(gameState, shotPower, dragSpeedVector));

        this.tick();
    }

    shotFired(gameState, shotPower, dragSpeedVector) {
        shotPower = Math.min(this.snookr.getPhysics().getSetting('maxShotPower'), gameState.shotPower);
        const speed = dragSpeedVector.normalize().scale(shotPower);
        const forwardSpin = speed.scale(gameState.spinPower.getForwardSpinPower() * Math.sqrt(speed.getLength() / 5) * this.snookr.getPhysics().getSetting('forwardSpinScale'));
        const sideSpin = -gameState.spinPower.getSideSpinPower() * speed.getLength() * this.snookr.getPhysics().getSetting('sideSpinScale');
        const movement = new BallMovement(speed, new Spin(forwardSpin, sideSpin));

        this.snookr.shotAttempt(movement);
        gameState.currentGameState = SnookrGameStateManager.GAME_STATE_PLAYING;
    }

    tick() {
        this.$bus.emit('snookrEvent.repaintTable', {
            snookr: this.snookr
        });

        if (this.snookr.tick()) {
            window.requestAnimationFrame(() => this.tick());
            return;
        }

        const nextRules = this.snookr.getGameStateManager().getNextRules();
        if (!nextRules) {
            this.endGame(this.snookr.getGameStateManager().getScore());
        } else if (nextRules.length === 1) {
            this.snookr.getGameStateManager().selectNextRule(nextRules[0]);
        } else {
            this.snookr.getGameStateManager().selectNextRule(this.selectNextRule(nextRules));
        }
    }

    /**
     *
     * @param {Array.<SnookrRule>} nextRules
     * @returns {SnookrRule}
     */
    selectNextRule(nextRules) {
        let nextRuleIndex = 0;

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

        return nextRules[nextRuleIndex];
    }

    endGame(score) {
        // this.getData().frameWins[0] += 1 * (score[0] > score[1]);
        // this.getData().frameWins[1] += 1 * (score[1] > score[0]);
        //
        // this.getData().snookr.resetGame();
        //
        // this.getData().frameNumber = this.getData().frameNumber + 1;
        // if (this.getData().frameNumber === this.getData().numberOfFrames + 1) {
        //     alert('Match over!');
        //     this.getData().frameNumber = 1;
        //     this.getData().frameWins = [0, 0];
        // }
    }
}
