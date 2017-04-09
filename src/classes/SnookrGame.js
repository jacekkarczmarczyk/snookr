class SnookrGame {
    constructor() {
        if (this.constructor === SnookrGame) {
            throw new TypeError('Cannot instantiate abstract class');
        }

        this.ballSet = new SnookrBallSet();
        this.cueBall = null;
        this.table = this.createTable();
        this.physics = new SnookrPhysics(this.table, this.getPhysicsSettings());
        this.resetGame();
    }

    /**
     *
     * @returns {SnookrGame}
     */
    resetGame() {
        this.ballSet.import(this.createBallSet());
        this.cueBall = this.ballSet.first('white');
        return this;
    }

    /**
     *
     * @returns {SnookrRule}
     */
    getInitialRule() {
        return new SnookrRuleExpectingRed();
    }

    /**
     *
     * @returns {*}
     */

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

    /**
     *
     * @returns {number}
     */
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

    /**
     *
     * @returns {number}
     */
    getBallRadius() {
        return 1;
    }

    /**
     *
     * @returns {SnookrBall}
     */
    getCueBall() {
        return this.cueBall;
    }

    /**
     *
     * @returns {number}
     */
    getFrameLength() {
        return 1;
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
        return new SnookrBallSet();
    }

    /**
     *
     * @param {Point} position
     * @returns {boolean}
     */
    setCueBallPosition(position) {
        if (!this.getBallSet().isPositionFree(position, this.getCueBall())) {
            return false;
        }
        if (!this.getTable().isInCueBallArea(position)) {
            return false;
        }
        this.getCueBall().setPosition(position);
        return true;
    }
}
