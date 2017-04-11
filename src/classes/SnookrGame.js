class SnookrGame {
    constructor() {
        if (this.constructor === SnookrGame) {
            throw new TypeError('Cannot instantiate abstract class');
        }

        this._ballSet = new SnookrBallSet();
        this._cueBall = null;
        this._table = new SnookrTable(this.getTableWidth(), this.getTableLength(), this.createTableBoundary(), this.createTablePots(), this.getDCenter(), this.getDRadius());
        this._physics = new SnookrPhysics(this.createTableBoundary(), this.createTablePots(), this.getPhysicsSettings());
        this.resetGame();
    }

    /**
     *
     * @returns {number}
     */
    getTableWidth() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {number}
     */
    getTableLength() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {Point}
     */
    getDCenter() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {number}
     */
    getDRadius() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {number}
     */
    getBallRadius() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    createBallSet() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {SnookrTableBoundary}
     */
    createTableBoundary() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {SnookrTablePots}
     */
    createTablePots() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {number}
     */
    getBallRandomness() {
        throw new TypeError('Abstract method called');
    }

    /**
     *
     * @returns {SnookrGame}
     */
    resetGame() {
        this._ballSet.import(this.createBallSet());
        this._cueBall = this._ballSet.first('white');
        return this;
    }

    /**
     *
     * @param {number} player
     * @returns {SnookrRule}
     */
    getInitialRule(player) {
        return new SnookrRuleExpectingRed(player);
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
        return this._physics;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    getBallSet() {
        return this._ballSet;
    }

    /**
     *
     * @returns {SnookrTable}
     */
    getTable() {
        return this._table;
    }

    /**
     *
     * @returns {SnookrBall}
     */
    getCueBall() {
        return this._cueBall;
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
            const bulkCenter = this.getTable().getDCenter();
            const bulkR = this.getTable().getDRadius();
            do {
                const alpha = Math.random() * Math.PI;
                newPosition = bulkCenter.translate(Vector.create(Math.random() * bulkR).rotate(alpha));
            } while (!this._ballSet.isPositionFree(newPosition, ballToUnpot));
        } else {
            while (!newPosition && (nextBallType = ballTypes.shift())) {
                const nextColorPosition = this._ballSet.only(nextBallType).first().getInitialPosition();
                if (this._ballSet.isPositionFree(nextColorPosition, ballToUnpot)) {
                    newPosition = nextColorPosition;
                }
            }

            if (!newPosition) {
                newPosition = ballToUnpot.getInitialPosition();
                do {
                    newPosition = newPosition.translate(Vector.create(0, -0.1));
                } while (!this._ballSet.isPositionFree(newPosition, ballToUnpot) && newPosition.getY() > ballToUnpot.getBallRadius());
                do {
                    newPosition = newPosition.translate(Vector.create(0, 0.1));
                } while (!this._ballSet.isPositionFree(newPosition, ballToUnpot));
            }
        }

        ballToUnpot.setPotted(false).setPosition(newPosition);
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
        if (!this.getTable().isInDArea(position)) {
            return false;
        }
        this.getCueBall().setPosition(position);
        return true;
    }
}
