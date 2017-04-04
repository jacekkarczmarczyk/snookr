class SnookrPhysics {
    /**
     *
     * @param {SnookrTable} table
     * @param settings
     */
    constructor(table, settings) {
        this.table = table;
        this.settings = Object.assign({}, {
            ballCollisionRatio: 0,
            spinLinearSlowdownRatio: 0.1,
            slowdownBreaker: 200,
            slowdownRatio: 0.99
        }, settings);
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param frameLength
     * @param inFrame
     * @returns {{firstTouched: SnookrBall|null, ballsPotted: SnookrBallSet}}
     */
    recalcuatePositions(ballSet, frameLength, inFrame = false) {
        const table = this.table;
        const balls = ballSet.unpotted();

        let ballsPotted = new SnookrBallSet();
        let firstEvent = {
            eventTime: frameLength,
            eventType: 'end'
        };
        let firstTouched = null;
        let ballHitsBall = false;

        // Check whether any ball was pocketed
        //
        balls.forEach(function (ball) {
            table.getPots().forEach(function (pot) {
                const potTime = table.calculatePot(pot, ball, frameLength);
                if (potTime !== null && (firstEvent === null || potTime < firstEvent.eventTime)) {
                    firstEvent = {
                        eventTime: potTime,
                        eventType: 'pot',
                        ball: ball
                    };
                }
            });
        });

        // Check whether any ball hits the cushion
        //
        balls.forEach(function (ball) {
            const collision = table.calculateBoundaryTouch(ball, frameLength);
            if (collision !== null && (firstEvent === null || collision.getCollisionTime() < firstEvent.eventTime)) {
                firstEvent = {
                    eventTime: collision.getCollisionTime(),
                    eventType: 'cushion',
                    ball: ball,
                    collision: collision
                };
            }
        });

        // Check whether any two balls hit each other
        //
        balls.filter(ball => ball.getSpeed().getX() || ball.getSpeed().getY()).forEach(function (ball1) {
            balls.forEach(function (ball2) {
                const collision = ball1.calculateBallCollision(ball2, frameLength);
                if (collision !== null && (firstEvent === null || collision.getCollisionTime() < firstEvent.eventTime)) {
                    firstEvent = {
                        eventTime: collision.getCollisionTime(),
                        eventType: 'balls',
                        collision: collision,
                        balls: [ball1, ball2]
                    };
                }
            });
        });

        balls.forEach(ball => ball.setPosition(ball.getPosition().translate(ball.getSpeed(), firstEvent.eventTime)));

        if (firstEvent.eventType === 'pot') {
            firstEvent.ball.setPotted();
            ballsPotted.add(firstEvent.ball);
        } else if (firstEvent.eventType === 'cushion') {
            firstEvent.ball.setPosition(firstEvent.ball.getPosition().translate(firstEvent.ball.getSpeed(), -0.001 * firstEvent.collision.getCollisionTime()));
            firstEvent.ball.setSpeed(firstEvent.collision.getCollisionSpeed());
            firstEvent.ball.setForwardSpin(Vector.create());
            firstEvent.ball.setSideSpin(0);
        } else if (firstEvent.eventType === 'balls') {
            const ball1 = firstEvent.balls[0];
            const ball2 = firstEvent.balls[1];
            ball1.setSpeed(firstEvent.collision.getCollisionSpeed(ball1));
            ball2.setSpeed(firstEvent.collision.getCollisionSpeed(ball2));

            if (ball1.getBallType() === 'white') {
                firstTouched = ball2;
            } else if (ball2.getBallType() === 'white') {
                firstTouched = ball1;
            }

            ballHitsBall = true;
        } else if (!inFrame) { // end
            balls.forEach(ball => this.slowDown(ball, frameLength));
        }

        if (frameLength > firstEvent.eventTime) {
            const subFrameData = this.recalcuatePositions(ballSet, frameLength - firstEvent.eventTime, true);
            ballsPotted.add(subFrameData.ballsPotted);
            ballHitsBall = ballHitsBall || subFrameData.ballHitsBall;
        }

        return {
            firstTouched,
            ballsPotted,
            ballHitsBall
        };
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param timeDiff
     * @returns {SnookrBall}
     */
    slowDown(ball, timeDiff) {
        const movement = ball.getMovement();

        const forwardSpin = movement.getForwardSpin();
        const forwardSpinLength = forwardSpin.getLength();
        const forwardSpinToBall = forwardSpinLength > this.settings.spinLinearSlowdownRatio ? forwardSpin.scale(this.settings.spinLinearSlowdownRatio) : forwardSpin;
        const forwardSpinLeft = forwardSpin.add(forwardSpinToBall.scale(-1));

        const sideSpin = Math.sign(movement.getSideSpin()) * Math.max(0, Math.abs(movement.getSideSpin()) - 0.001);

        const speed = ball.getSpeed();
        const speedLength = speed.getLength();
        const scale = Math.pow(this.settings.slowdownRatio * (1 - Math.exp(-this.settings.slowdownBreaker * speedLength)), timeDiff);

        return ball.setSpeed(speed.scale(scale).add(forwardSpinToBall)).setForwardSpin(forwardSpinLeft).setSideSpin(sideSpin);
    }


    //noinspection JSUnusedGlobalSymbols
    static testCollisions1() {
        const centerBall = new SnookrBall(0.5, 'black', Point.create(), BallMovement.create(Vector.create(0.5, 0)));

        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 12; j++) {
                const position = Vector.create(1.001, 0).rotate(i * Math.PI / 6).toPoint();
                const speed = Vector.create(1.4, 0).rotate(j * Math.PI / 6);
                const sideBall = SnookrBall.create(0.5, 'white', position, BallMovement.create(speed));
                const collision = centerBall.calculateBallCollision(sideBall, 1);
            }
        }
    }

    //noinspection JSUnusedGlobalSymbols
    static testCollisions2() {
        const centerBall = new SnookrBall(0.5, 'black', Point.create());
        for (let i = 0; i < 3; i++) {
            const position = Vector.create(1.001, 0).rotate((i - 1) * 0.1).toPoint();
            const speed = Vector.create(-1, 0);
            const sideBall = SnookrBall.create(0.5, 'white', position, BallMovement.create(speed));
            const collision = centerBall.calculateBallCollision(sideBall, 1);
        }
    }

}

