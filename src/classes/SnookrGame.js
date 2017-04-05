class SnookrGame {
    constructor() {
        if (this.constructor === SnookrGame) {
            throw new TypeError('Cannot instantiate abstract class');
        }

        this.inAction = false;
        this.table = this.createTable();
        this.cueDistance = this.getInitialCueDistance();
        this.eventListener = new SnookrEventListener();
        this.physics = new SnookrPhysics(this.table, this.getPhysicsSettings());

        this.firstTouched = null;
        this.ballsPotted = new SnookrBallSet();
        this.break = 0;

        this.resetGame();
    }

    /**
     *
     * @returns {boolean}
     */
    isInAction() {
        return this.inAction;
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
        this.history = new SnookrHistory();

        this.currentScore = [0, 0];
        this.eventListener.trigger(SnookrEvent.SCORE_CHANGED, this.currentScore);

        this.currentPlayer = 0;
        this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);

        this.currentRule = new SnookrRuleExpectingRed();
        this.eventListener.trigger(SnookrEvent.RULE_CHANGED, this.currentRule);
    }

    /**
     *
     * @returns {SnookrEventListener}
     */
    getEventListener() {
        return this.eventListener;
    }

    getGameState() {
        return new SnookrGameState(this.inAction, this.ballSet, this.cueDistance);
    }

    getInitialCueDistance() {
        return this.getBallRadius();
    }

    getBallRadius() {
        throw new TypeError('Abstract class method called');
    }

    rollback() {
        const historyEntry = this.history.pop();
        if (!historyEntry) {
            return;
        }

        this.inAction = false;

        this.ballSet.restore(historyEntry.getBalls());

        this.currentScore = historyEntry.getScore();
        this.eventListener.trigger(SnookrEvent.SCORE_CHANGED, this.currentScore);

        this.currentPlayer = historyEntry.getPlayer();
        this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);

        this.currentRule = historyEntry.getRule();
        this.eventListener.trigger(SnookrEvent.RULE_CHANGED, this.currentRule);
    }

    shotAttempt(initialMovement) {
        //{shotPower, forwardSpinValue, sideSpinValue}
        if (!this.inAction) {
            this.history.push(new SnookrHistoryEntry(this.ballSet.save(), this.currentRule, this.currentPlayer, this.currentScore));

            this.getBallSet().first('white').setMovement(initialMovement);
            this.eventListener.trigger(SnookrEvent.SHOOT_FIRED);
        }
    }

    loop() {
        this.eventListener.on(SnookrEvent.SHOT_ATTEMPT, (movement) => this.shotAttempt(movement));
        this.eventListener.on(SnookrEvent.SHOOT_FIRED, () => this.inAction = true);
        this.eventListener.on(SnookrEvent.BALLS_STOPPED, shotResult => this.ballsStopped(shotResult));
        this.eventListener.on(SnookrEvent.NEXT_RULE_CHOSEN, nextRule => this.nextRuleChosen(nextRule));
        this.eventListener.on(SnookrEvent.ROLLBACK_REQUESTED, () => this.rollback());

        this.eventListener.trigger(SnookrEvent.SCORE_CHANGED, this.currentScore);
        this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);
        this.eventListener.trigger(SnookrEvent.RULE_CHANGED, this.currentRule);

        this.loopFrame();
    }

    /**
     *
     * @param {SnookrRule} nextRule
     */
    nextRuleChosen(nextRule) {
        if (nextRule instanceof SnookrRuleRepeat) {
            const historyEntry = this.history.pop();

            this.currentPlayer = 1 - this.currentPlayer;
            this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);

            if (nextRule.getRestoreBalls()) {
                this.ballSet.restore(historyEntry.getBalls());
            }

            this.currentRule = historyEntry.getRule();
        } else {
            this.currentRule = nextRule;
        }

        this.eventListener.trigger(SnookrEvent.RULE_CHANGED, this.currentRule);
    }

    /**
     *
     * @param {SnookrShotResult} shotResult
     */
    ballsStopped(shotResult) {
        this.inAction = false;

        this.firstTouched = null;
        this.ballsPotted = new SnookrBallSet();

        this.currentScore = this.currentScore.map((score, playerId) => score + ((this.currentPlayer === playerId) ? shotResult.getPointsForCurrentPlayer() : shotResult.getPointsForOpponent()));
        this.eventListener.trigger(SnookrEvent.SCORE_CHANGED, this.currentScore);

        this.currentPlayer = shotResult.playerChanges() ? (1 - this.currentPlayer) : this.currentPlayer;
        this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);

        this.currentRule = null;
        this.eventListener.trigger(SnookrEvent.RULE_CHANGED, this.currentRule);

        if (shotResult.getPointsForCurrentPlayer()) {
            this.break = this.break + shotResult.getPointsForCurrentPlayer();
            this.eventListener.trigger(SnookrEvent.BREAK_CHANGED, this.break);
        } else if (this.break) {
            this.break = 0;
            this.eventListener.trigger(SnookrEvent.BREAK_CHANGED, this.break);
        }

        this.unpotBalls(shotResult.getBallsToUnpot());

        const nextRules = shotResult.getNextRules();
        if (!nextRules) {
            this.eventListener.trigger(SnookrEvent.GAME_OVER, this.currentScore);
        } else {
            if (SnookrRule.isSnooker(this.ballSet, nextRules[0].getBallsToPot(this.ballSet))) {
                this.eventListener.trigger(SnookrEvent.SNOOKER_CREATED);
            }

            this.eventListener.trigger(SnookrEvent.NEXT_RULE_CHOICE, shotResult.getNextRules());
        }
    }

    getFrameLength() {
        return 1;
    }

    loopFrame() {
        this.eventListener.trigger(SnookrEvent.REPAINT, this.getGameState());

        if (this.inAction) {
            const recalculateResult = this.physics.recalcuatePositions(this.ballSet, this.getFrameLength());
            const allStopped = this.ballSet.allStopped();

            this.firstTouched = this.firstTouched || recalculateResult.firstTouched;
            this.ballsPotted.add(recalculateResult.ballsPotted);

            if (recalculateResult.ballsPotted.count()) {
                this.eventListener.trigger(SnookrEvent.BALL_POTTED);
                if (this.currentRule.getPoints(this.firstTouched, this.ballsPotted) >= 0) {
                    this.eventListener.trigger(SnookrEvent.RIGHT_BALL_POTTED);
                } else {
                    this.eventListener.trigger(SnookrEvent.WRONG_BALL_POTTED);
                }
            }

            if (recalculateResult.ballHitsBallPower) {
                this.eventListener.trigger(SnookrEvent.BALL_HITS_BALL, recalculateResult.ballHitsBallPower);
            }

            if (allStopped) {
                const shotResult = this.currentRule.getShotResult(this.firstTouched, this.ballsPotted, this.ballSet.unpotted());
                this.eventListener.trigger(SnookrEvent.BALLS_STOPPED, shotResult);
            }
        }

        window.requestAnimationFrame(() => this.loopFrame());
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
            } while (!this.isPositionFree(newPosition, ballToUnpot));
        } else {
            while (!newPosition && (nextBallType = ballTypes.shift())) {
                const nextColorPosition = this.ballSet.only(nextBallType).first().getInitialPosition();
                if (this.isPositionFree(nextColorPosition, ballToUnpot)) {
                    newPosition = nextColorPosition;
                }
            }

            if (!newPosition) {
                newPosition = ballToUnpot.getInitialPosition();
                do {
                    newPosition = newPosition.translate(Vector.create(0, -0.1));
                } while (!this.isPositionFree(newPosition, ballToUnpot) && newPosition.getY() > ballToUnpot.getBallRadius());
                do {
                    newPosition = newPosition.translate(Vector.create(0, 0.1));
                } while (!this.isPositionFree(newPosition, ballToUnpot));
            }
        }


        ballToUnpot.setPotted(false).setPosition(newPosition);
    }

    /**
     *
     * @param {Point} position
     * @param {SnookrBall} ball
     */
    isPositionFree(position, ball) {
        let free = true;

        this.ballSet.forEach(function (ballOnTable) {
            if (ballOnTable.isPotted()) {
                return;
            }
            if (ballOnTable.getPosition().getDistance(position) < ballOnTable.getBallRadius() + ball.getBallRadius()) {
                free = false;
            }
        });

        return free;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    createBallSet() {
        throw 'Abstract class method called';
    }
}
