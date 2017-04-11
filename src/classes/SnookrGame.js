class SnookrGame {
    constructor() {
        this._physicsSettings = {};
        this._ballRandomness = 0;
        this._tableWidth = 0;
        this._tableHeight = 0;
        this._dCenter = Point.create();
        this._dRadius = 0;
        this._tableBoundary = new SnookrTableBoundary();
        this._tablePots = new SnookrTablePots();
        this._ballSet = new SnookrBallSet();
        this._cueBall = null;
        this._resourceLoader = null;
        this._table = new SnookrTable(this.getTableWidth(), this.getTableLength(), this.getTableBoundary(), this.getTablePots(), this.getDCenter(), this.getDRadius());
        this._physics = new SnookrPhysics(this.getTableBoundary(), this.getTablePots(), this.getPhysicsSettings());
    }

    /**
     *
     * @param physicsSettings
     * @returns {SnookrGame}
     */
    setPhysicsSettings(physicsSettings) {
        this._physics.setSettings(physicsSettings);
        return this;
    }

    /**
     *
     * @returns {*}
     */
    getPhysicsSettings() {
        return this._physicsSettings;
    }

    /**
     *
     * @param {number} ballRandomness
     * @returns {SnookrGame}
     */
    setBallRandomness(ballRandomness) {
        this._ballRandomness = ballRandomness;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getBallRandomness() {
        return this._ballRandomness;
    }

    /**
     *
     * @param {number} width
     * @param {number} length
     * @returns {SnookrGame}
     */
    setTableSize(width, length) {
        this._tableWidth = width;
        this._tableLength = length;
        this._table.setTableWidth(width);
        this._table.setTableLength(length);
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getTableWidth() {
        return this._tableWidth;
    }

    /**
     *
     * @returns {number}
     */
    getTableLength() {
        return this._tableLength;
    }

    /**
     *
     * @param {Point} center
     * @returns {SnookrGame}
     */
    setDCenter(center) {
        this._dCenter = center;
        this._table.setDCenter(center);
        return this;
    }

    /**
     *
     * @returns {Point}
     */
    getDCenter() {
        return this._dCenter;
    }

    /**
     *
     * @param {number} radius
     * @returns {SnookrGame}
     */
    setDRadius(radius) {
        this._dRadius = radius;
        this._table.setDRadius(radius);
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getDRadius() {
        return this._dRadius;
    }

    /**
     *
     * @param {Array.<SnookrBoundaryPoint>} tableBoundaryPoints
     * @returns {SnookrGame}
     */
    setTableBoundaryPoints(tableBoundaryPoints) {
        this._tableBoundary.setBoundaryPoints(tableBoundaryPoints);
        return this;
    }

    /**
     *
     * @returns {SnookrTableBoundary}
     */
    getTableBoundary() {
        return this._tableBoundary;
    }

    /**
     *
     * @param {Array.<SnookrTablePot>} tablePots
     * @returns {SnookrGame}
     */
    setTablePots(tablePots) {
        this._tablePots.setPots(tablePots);
        return this;
    }

    /**
     *
     * @returns {SnookrTablePots}
     */
    getTablePots() {
        return this._tablePots;
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @returns {SnookrGame}
     */
    setBallSet(ballSet) {
        this._ballSet.import(ballSet);
        this._cueBall = ballSet.first('white');
        return this;
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
     * @returns {SnookrBall}
     */
    getCueBall() {
        return this._cueBall;
    }

    /**
     *
     * @param {ResourceLoader} resourceLoader
     * @returns {SnookrGame}
     */
    setResourceLoader(resourceLoader) {
        this._resourceLoader = resourceLoader;
        return this;
    }

    /**
     *
     * @returns {ResourceLoader}
     */
    getResourceLoader() {
        return this._resourceLoader;
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
     * @returns {SnookrTable}
     */
    getTable() {
        return this._table;
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
     * @returns {SnookrGame}
     */
    resetGame() {
        this._ballSet.resetBallSet().forEach(ball => ball.randomizePosition(this.getBallRandomness()));
        return this;
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
            } while (!this.getBallSet().isPositionFree(newPosition, ballToUnpot));
        } else {
            while (!newPosition && (nextBallType = ballTypes.shift())) {
                const nextColorPosition = this.getBallSet().only(nextBallType).first().getInitialPosition();
                if (this.getBallSet().isPositionFree(nextColorPosition, ballToUnpot)) {
                    newPosition = nextColorPosition;
                }
            }

            if (!newPosition) {
                newPosition = ballToUnpot.getInitialPosition();
                do {
                    newPosition = newPosition.translate(Vector.create(0, -0.1));
                } while (!this.getBallSet().isPositionFree(newPosition, ballToUnpot) && newPosition.getY() > ballToUnpot.getBallRadius());
                do {
                    newPosition = newPosition.translate(Vector.create(0, 0.1));
                } while (!this.getBallSet().isPositionFree(newPosition, ballToUnpot));
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

    /**
     *
     * @param {Point} position
     * @returns {*}
     */
    validateCueBallPosition(position) {
        return this.getTable().isInDArea(position) && this
            .getBallSet()
            .unpotted()
            .not(this.getCueBall())
            .map(ball => ball.getPosition().getDistance(position) >= ball.getBallRadius() + this.getCueBall().getBallRadius())
            .reduce((carry, item) => carry && item, true);
    }
}
