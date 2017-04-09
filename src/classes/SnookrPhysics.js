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
            forwardSpinLinearSlowdownRatio: 0.03,
            sideSpinLinearSlowdownRatio: 0.001,
            slowdownBreaker: 200,
            slowdownRatio: 0.99,
            maxShotPower: 5,
            forwardSpinScale: 0.5,
            sideSpinScale: 1/15
        }, settings);
    }

    /**
     *
     * @param {string} name
     * @returns {*}
     */
    getSetting(name) {
        return this.settings[name];
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param {number} frameLength
     * @returns {{eventTime: *, eventType: string}}
     */
    getFirstEvent(ballSet, frameLength) {
        const table = this.table;
        let firstEvent = {
            eventTime: frameLength,
            eventType: 'end'
        };

        // Check whether any ball was pocketed
        //
        ballSet.forEach(function (ball) {
            table.getPots().forEach(function (pot) {
                const potTime = table.calculatePot(pot, ball, frameLength);
                if (potTime !== null && (firstEvent === null || potTime < firstEvent.eventTime)) {
                    firstEvent = {
                        eventTime: potTime,
                        eventType: 'pot',
                        ball
                    };
                }
            });
        });

        // Check whether any ball hits the cushion
        //
        ballSet.forEach(function (ball) {
            const collision = table.calculateBoundaryTouch(ball, frameLength);
            if (collision !== null && (firstEvent === null || collision.getCollisionTime() < firstEvent.eventTime)) {
                firstEvent = {
                    eventTime: collision.getCollisionTime(),
                    eventType: 'cushion',
                    ball,
                    collision
                };
            }
        });

        // Check whether any two balls hit each other
        //
        ballSet.filter(ball => ball.getSpeed().getX() || ball.getSpeed().getY()).forEach(function (ball1) {
            ballSet.forEach(function (ball2) {
                const collision = ball1.calculateBallCollision(ball2, frameLength);
                if (collision !== null && (firstEvent === null || collision.getCollisionTime() < firstEvent.eventTime)) {
                    firstEvent = {
                        eventTime: collision.getCollisionTime(),
                        eventType: 'balls',
                        collision,
                        ball1,
                        ball2
                    };
                }
            });
        });

        return firstEvent;
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param frameLength
     * @returns {{firstTouched: SnookrBall|null, ballsPotted: SnookrBallSet, ballHitsBallPower: number}}
     */
    recalculatePositions(ballSet, frameLength) {
        let ballHitsBallPower = 0.0;
        let firstTouched = null;
        let ballsPotted = [];
        let ballsUnpotted = ballSet.unpotted();
        let timeLeft = frameLength;

        do {
            const firstEvent = this.getFirstEvent(ballsUnpotted, timeLeft);

            ballsUnpotted.forEach(ball => ball.setPosition(ball.getPosition().translate(ball.getSpeed(), firstEvent.eventTime)));

            if (firstEvent.eventType === 'pot') {
                firstEvent.ball.setPotted();
                ballsPotted.push(firstEvent.ball);
                ballsUnpotted = ballSet.unpotted();
            } else if (firstEvent.eventType === 'cushion') {
                firstEvent.ball.setPosition(firstEvent.ball.getPosition().translate(firstEvent.ball.getSpeed(), -0.001 * firstEvent.collision.getCollisionTime()));
                firstEvent.ball.setSpeed(firstEvent.collision.getCollisionSpeed());
                firstEvent.ball.setForwardSpin(Vector.create());
                firstEvent.ball.setSideSpin(0);
            } else if (firstEvent.eventType === 'balls') {
                firstEvent.ball1.setSpeed(firstEvent.collision.getCollisionSpeed(firstEvent.ball1));
                firstEvent.ball2.setSpeed(firstEvent.collision.getCollisionSpeed(firstEvent.ball2));

                if (!firstTouched) {
                    if (firstEvent.ball1.getBallType() === 'white') {
                        firstTouched = firstEvent.ball2;
                    } else if (firstEvent.ball2.getBallType() === 'white') {
                        firstTouched = firstEvent.ball1;
                    }
                }

                ballHitsBallPower = ballHitsBallPower + firstEvent.collision.getCollisionPower();
            }

            timeLeft -= firstEvent.eventTime;
        } while (timeLeft > 0);

        ballsUnpotted.forEach(ball => this.slowDown(ball, frameLength));

        return {
            firstTouched,
            ballsPotted: new SnookrBallSet(ballsPotted),
            ballHitsBallPower
        };
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param timeDiff
     * @returns {SnookrBall}
     */
    slowDown(ball, timeDiff) {
        const forwardSpin = ball.getForwardSpin();
        const forwardSpinLength = forwardSpin.getLength();
        const forwardSpinToBall = forwardSpinLength > this.getSetting('forwardSpinLinearSlowdownRatio') ? forwardSpin.clone().scale(this.getSetting('forwardSpinLinearSlowdownRatio')) : forwardSpin;
        const forwardSpinLeft = forwardSpin.subtract(forwardSpinToBall);

        const sideSpin = Math.sign(ball.getSideSpin()) * Math.max(0, Math.abs(ball.getSideSpin()) - this.getSetting('sideSpinLinearSlowdownRatio'));

        const speedLength = ball.getSpeed().getLength();
        const scale = Math.pow(this.getSetting('slowdownRatio') * (1 - Math.exp(-this.getSetting('slowdownBreaker') * speedLength)), timeDiff);

        ball.getSpeed().scale(scale).add(forwardSpinToBall);
        ball.setForwardSpin(forwardSpinLeft);
        ball.setSideSpin(sideSpin);
        return ball;
    }


    //noinspection JSUnusedGlobalSymbols
    static testCollisions1() {
        const centerBall = new SnookrBall(0.5, 'black', Point.create(), Vector.create(0.5, 0));

        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 12; j++) {
                const position = Vector.create(1.001, 0).rotate(i * Math.PI / 6).toPoint();
                const speed = Vector.create(1.4, 0).rotate(j * Math.PI / 6);
                const sideBall = SnookrBall.create(0.5, 'white', position);
                sideBall.setSpeed(speed);
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
            const sideBall = SnookrBall.create(0.5, 'white', position);
            sideBall.setSpeed(speed);
            const collision = centerBall.calculateBallCollision(sideBall, 1);
        }
    }

}

