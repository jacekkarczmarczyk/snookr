class SnookrBallSet {
    /**
     *
     * @param {Array<SnookrBall>} balls
     */
    constructor(balls = []) {
        this.balls = balls.filter(ball => ball instanceof SnookrBall);
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @returns {SnookrBallSet}
     */
    import(ballSet) {
        this.balls = ballSet.balls.slice(0);
        return this;
    }

    /**
     *
     * @returns {Number}
     */
    count() {
        return this.balls.length;
    }

    /**
     *
     * @param {SnookrBall|SnookrBallSet|Array} ballSet
     * @returns {SnookrBallSet}
     */
    add(ballSet) {
        if (ballSet instanceof SnookrBall) {
            ballSet = [ballSet];
        }

        const balls = this.balls;
        ballSet.forEach(function (newBall) {
            if (!balls.reduce(ball => ball === newBall, false)) {
                balls.push(newBall);
            }
        });

        return this;
    }

    /**
     *
     * @param callback
     * @returns {SnookrBallSet}
     */
    filter(callback) {
        return new SnookrBallSet(this.balls.filter(callback));
    }

    /**
     *
     * @param {SnookrBall|String} ballToRemove
     * @returns {SnookrBallSet}
     */
    not(ballToRemove) {
        if (ballToRemove instanceof SnookrBall) {
            return this.filter(ball => ball !== ballToRemove);
        } else {
            return this.filter(ball => ball.getBallType() !== ballToRemove);
        }
    }

    /**
     *
     * @param {SnookrBall|String} ballToLeave
     * @returns {SnookrBallSet}
     */
    only(ballToLeave) {
        if (ballToLeave instanceof SnookrBall) {
            return this.filter(ball => ball === ballToLeave);
        } else {
            return this.filter(ball => ball.getBallType() === ballToLeave);
        }
    }

    /**
     *
     * @returns {SnookrBall|null}
     */
    first(ballType = null) {
        return ballType ? this.only(ballType).first() : this.balls[0];
    }

    /**
     *
     * @param callback
     * @param initial
     * @returns {*}
     */
    reduce(callback, initial) {
        return this.balls.reduce(callback, initial);
    }

    /**
     *
     * @param callback
     * @returns {SnookrBallSet}
     */
    forEach(callback) {
        this.balls.forEach(callback);
        return this;
    }

    /**
     *
     * @param callback
     * @returns {Array}
     */
    map(callback) {
        return this.balls.map(callback);
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    unpotted() {
        return this.filter(ball => !ball.isPotted());
    }

    /**
     *
     * @returns {boolean}
     */
    allStopped() {
        return !this.reduce((ballsMoving, ball) => ballsMoving || ball.getSpeed().getX() || ball.getSpeed().getY(), false);
    }

    /**
     *
     * @param {Point} position
     * @param {SnookrBall} ball
     */
    isPositionFree(position, ball) {
        let free = true;

        this.forEach(function (ballOnTable) {
            if (ballOnTable.isPotted() || ball === ballOnTable) {
                return;
            }
            if (ballOnTable.getPosition().getDistance(position) < ballOnTable.getBallRadius() + ball.getBallRadius()) {
                free = false;
            }
        });

        return free;
    }
}

