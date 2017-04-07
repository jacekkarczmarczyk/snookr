class SnookrGame {
    constructor() {
        if (this.constructor === SnookrGame) {
            throw new TypeError('Cannot instantiate abstract class');
        }

        this.inAction = false;
        this.table = this.createTable();
        this.eventListener = new SnookrEventListener();
        this.physics = new SnookrPhysics(this.table, this.getPhysicsSettings());
        this.history = new SnookrHistory();

        this.firstTouched = null;
        this.ballsPotted = new SnookrBallSet();
        this.break = 0;

        this.resetGame();
    }

    /**
     *
     * @returns {SnookrGameStateManager}
     */
    getGameStateManager() {
        return this.gameStateManager;
    }

    getPhysicsSettings() {
        return {};
    }

    /**
     *
     * @returns {SnookrPhysics}
     */
    getPhysics() {
        return this.physics;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    getBallSet() {
        return this.ballSet;
    }

    /**
     *
     * @returns {SnookrTable}
     */
    createTable() {
        throw new TypeError('Abstract class method called');
    }

    getBallRandomness() {
        return 0.003;
    }

    /**
     *
     * @returns {SnookrTable}
     */
    getTable() {
        return this.table;
    }

    resetGame() {
        this.ballSet = this.createBallSet();
        this.gameStateManager = new SnookrGameStateManager(this.ballSet, new SnookrRuleExpectingRed());
    }

    getBallRadius() {
        throw new TypeError('Abstract class method called');
    }

    shotAttempt(initialMovement) {
        //{shotPower, forwardSpinValue, sideSpinValue}
        if (!this.inAction) {
            if (!this.gameStateManager) {
                this.gameStateManager = new SnookrGameStateManager(this.ballSet, this.rule);
            }

            this.getBallSet().first('white').setMovement(initialMovement);
            this.inAction = true;
        }
    }

    getFrameLength() {
        return 1;
    }

    tick() {
        if (!this.inAction) {
            return true;
        }

        const recalculateResult = this.physics.recalculatePositions(this.ballSet, this.getFrameLength());
        const allStopped = this.ballSet.allStopped();

        this.firstTouched = this.firstTouched || recalculateResult.firstTouched;
        this.ballsPotted.add(recalculateResult.ballsPotted);

        if (recalculateResult.ballsPotted.count()) {
            this.eventListener.trigger(SnookrEvent.BALL_POTTED);
            if (this.gameStateManager.getRule().getPoints(this.firstTouched, this.ballsPotted) >= 0) {
                this.eventListener.trigger(SnookrEvent.RIGHT_BALL_POTTED);
            } else {
                this.eventListener.trigger(SnookrEvent.WRONG_BALL_POTTED);
            }
        }

        if (recalculateResult.ballHitsBallPower) {
            this.eventListener.trigger(SnookrEvent.BALL_HITS_BALL, recalculateResult.ballHitsBallPower);
        }

        if (!allStopped) {
            return true;
        }

        if (this.inAction) {
            this.gameStateManager.pushResult(this.firstTouched, this.ballsPotted);
            this.inAction = false;
            this.unpotBalls(this.gameStateManager.getBallsToUnpot());
        }
        return false;

        // if (nextRules) {
        //     if (SnookrRule.isSnooker(this.ballSet, nextRules[0].getBallsToPot(this.ballSet))) {
        //         this.eventListener.trigger(SnookrEvent.SNOOKER_CREATED);
        //     }
        //
        //     this.eventListener.trigger(SnookrEvent.NEXT_RULE_CHOICE, shotResult.getNextRules());
        // }
    }

    /**
     *
     * @param {SnookrRule} nextRule
     */
    nextRuleChosen(nextRule) {
        this.gameStateManager.selectNextRule(nextRule);
    }

    /**
     *
     * @param {SnookrBallSet} ballsToUnpot
     */
    unpotBalls(ballsToUnpot) {
        ballsToUnpot.forEach(ballToUnpot => this.unpotBall(ballToUnpot));
    }

    /**
     *
     * @param {SnookrBall} ballToUnpot
     */
    unpotBall(ballToUnpot) {
        const ballTypes = [ballToUnpot.getBallType(), 'black', 'pink', 'blue', 'brown', 'green', 'yellow'];
        let newPosition;
        let nextBallType;

        if (ballToUnpot.getBallType() === 'white') {
            const bulkCenter = Point.create(33.867, 107.986);
            const bulkR = 11;
            do {
                const alpha = Math.random() * Math.PI;
                newPosition = bulkCenter.translate(Vector.create(Math.random() * bulkR).rotate(alpha));
            } while (!this.ballSet.isPositionFree(newPosition, ballToUnpot));
        } else {
            while (!newPosition && (nextBallType = ballTypes.shift())) {
                const nextColorPosition = this.ballSet.only(nextBallType).first().getInitialPosition();
                if (this.ballSet.isPositionFree(nextColorPosition, ballToUnpot)) {
                    newPosition = nextColorPosition;
                }
            }

            if (!newPosition) {
                newPosition = ballToUnpot.getInitialPosition();
                do {
                    newPosition = newPosition.translate(Vector.create(0, -0.1));
                } while (!this.ballSet.isPositionFree(newPosition, ballToUnpot) && newPosition.getY() > ballToUnpot.getBallRadius());
                do {
                    newPosition = newPosition.translate(Vector.create(0, 0.1));
                } while (!this.ballSet.isPositionFree(newPosition, ballToUnpot));
            }
        }

        ballToUnpot.setPotted(false).setPosition(newPosition);
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    createBallSet() {
        throw 'Abstract class method called';
    }
}
