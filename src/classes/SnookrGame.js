class SnookrGame {
    constructor() {
        if (this.constructor === SnookrGame) {
            throw new TypeError('Cannot instantiate abstract class');
        }

        this.inAction = false;
        this.ghostPosition = null;
        this.table = this.createTable();
        this.cueDistance = this.getInitialCueDistance();
        this.eventListener = new SnookrEventListener();
        this.physics = new SnookrPhysics(this.table, this.getPhysicsSettings());

        this.firstTouched = null;
        this.ballsPotted = new SnookrBallSet();
        this.break = 0;

        this.resetGame();
    }

    getPhysicsSettings() {
        return {};
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
        return new SnookrGameState(this.inAction, this.ballSet, this.ghostPosition, this.cueDistance);
    }

    getInitialCueDistance() {
        return this.getBallRadius();
    }

    getBallRadius() {
        throw new TypeError('Abstract class method called');
    }

    shotAttempt({shotPower, forwardSpinValue, sideSpinValue}) {
        if (!this.inAction && shotPower > 0 && this.ghostPosition) {
            shotPower = Math.min(5, shotPower);
            const whiteBall = this.ballSet.only('white').first();
            const whitePosition = whiteBall.getPosition();
            const speed = whitePosition.vectorTo(this.ghostPosition).normalize().scale(shotPower);

            // TESTY
            // const speed = Vector.create(-2, -0.6);
            // this.ballSet.only('white').first().setPosition(this.ballSet.getBalls()[4].getPosition().translate(Vector.create(this.ballSet.getBalls()[4].getBallRadius() * 2 + 20, 0 + 6)));

            whiteBall.setSpeed(speed);
            whiteBall.setForwardSpin(speed.scale(forwardSpinValue * Math.sqrt(speed.getLength() / 60)));
            whiteBall.setSideSpin(-sideSpinValue * speed.getLength() / 3);
            this.eventListener.trigger(SnookrEvent.SHOOT_FIRED);
        }
    }

    loop() {
        this.eventListener.on(SnookrEvent.SHOT_ATTEMPT, ({shotPower, forwardSpinValue, sideSpinValue}) => this.shotAttempt({
            shotPower,
            forwardSpinValue,
            sideSpinValue
        }));
        this.eventListener.on(SnookrEvent.MOUSE_MOVED, ghostPosition => this.ghostPosition = ghostPosition);
        this.eventListener.on(SnookrEvent.SHOOT_FIRED, () => this.inAction = true);
        this.eventListener.on(SnookrEvent.CUE_DRAG, cueDistance => this.cueDistance = cueDistance);
        this.eventListener.on(SnookrEvent.CUE_DRAG_END, () => this.cueDistance = this.getInitialCueDistance());
        this.eventListener.on(SnookrEvent.BALLS_STOPPED, shotResult => this.ballsStopped(shotResult));
        this.eventListener.on(SnookrEvent.NEXT_RULE_CHOSEN, nextRule => this.nextRuleChosen(nextRule));

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
            this.currentPlayer = 1 - this.currentPlayer;
            this.eventListener.trigger(SnookrEvent.PLAYER_CHANGED, this.currentPlayer);

            this.currentRule = nextRule.getRuleToRepeat();
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

            const shotResult = this.currentRule.getShotResult(this.firstTouched, this.ballsPotted, this.ballSet.unpotted());

            if (recalculateResult.ballsPotted.count()) {
                this.eventListener.trigger(SnookrEvent.BALL_POTTED);
                if (!shotResult.isFaul()) {
                    this.eventListener.trigger(SnookrEvent.RIGHT_BALL_POTTED);
                } else {
                    this.eventListener.trigger(SnookrEvent.WRONG_BALL_POTTED);
                }
            }

            if (recalculateResult.ballHitsBall) {
                this.eventListener.trigger(SnookrEvent.BALL_HITS_BALL);
            }

            if (allStopped) {
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
            const tableBorderX = (this.table.getOuterWidth() - this.table.getInnerWidth()) / 2;
            const tableBorderY = (this.table.getOuterLength() - this.table.getInnerLength()) / 2;
            do {
                newPosition = Point.create(
                    tableBorderX + ballToUnpot.getBallRadius() + Math.random() * (this.table.getInnerWidth() - 2 * ballToUnpot.getBallRadius()),
                    tableBorderY + ballToUnpot.getBallRadius() + Math.random() * (this.table.getInnerLength() - 2 * ballToUnpot.getBallRadius())
                );
            } while (!this.isPositionFree(newPosition, ballToUnpot));
        }

        while (!newPosition && (nextBallType = ballTypes.shift())) {
            const nextColorPosition = this.ballSet.only(nextBallType).first().getInitialPosition();
            if (this.isPositionFree(nextColorPosition, ballToUnpot)) {
                newPosition = nextColorPosition;
            }
        }

        if (!newPosition) {
            newPosition = ballToUnpot.getInitialPosition();
            do {
                // todo wydajniejszy algorytm
                // todo sprawdzanie czy nowa pozycja jest w obrebie stolu
                //
                newPosition = newPosition.translate(Vector.create(0, -0.1));
            } while (!this.isPositionFree(newPosition, ballToUnpot));
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
