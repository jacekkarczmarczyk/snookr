class SnookrTable {
    /**
     *
     * @param {number} width
     * @param {number} length
     * @param {SnookrTableBoundary} boundary
     * @param {SnookrTablePots} pots
     * @param {Point} dCenter
     * @param {number} dRadius
     */
    constructor(width, length, boundary, pots, dCenter, dRadius) {
        this.outerWidth = width;
        this.outerLength = length;
        this.boundary = boundary;
        this.pots = pots;
        this.dCenter = dCenter;
        this.dRadius = dRadius;
    }

    /**
     *
     * @returns {SnookrTableBoundary}
     */
    getTableBoundary() {
        return this.boundary;
    }

    /**
     *
     * @returns {SnookrTablePots}
     */
    getTablePots() {
        return this.pots;
    }

    /**
     *
     * @param {number} length
     * @returns {SnookrTable}
     */
    setTableWidth(width) {
        this.outerWidth = width;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getTableWidth() {
        return this.outerWidth;
    }

    /**
     *
     * @param {number} length
     * @returns {SnookrTable}
     */
    setTableLength(length) {
        this.outerLength = length;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getTableLength() {
        return this.outerLength;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {number} tMax
     * @returns {{getCollisionTime, getCollisionSpeed} | null}
     */
    calculateBoundaryTouch(ball, tMax) {
        if (!ball.getSpeed().getX() && !ball.getSpeed().getY()) {
            return null;
        }

        const x = ball.getPosition().getX() + ball.getSpeed().getX() * tMax;
        const y = ball.getPosition().getY() + ball.getSpeed().getY() * tMax;
        const r = ball.getBallRadius();
        const border = 8.5;
        if (x - r > border && x + r < this.outerWidth - border && y - r > border && y + r < this.outerLength - border) {
            return null;
        }

        return this.boundary.calculateBoundaryTouch(ball, tMax);
    }

    /**
     *
     * @param {Point} position
     * @returns {boolean}
     */
    isInDArea(position) {
        return position.getY() >= this.getDCenter().getY() && (position.getDistance(this.getDCenter())) <= this.getDRadius();
    }

    /**
     *
     * @param {Point} center
     * @returns {SnookrTable}
     */
    setDCenter(center) {
        this.dCenter = center;
        return this;
    }

    /**
     *
     * @returns {Point}
     */
    getDCenter() {
        return this.dCenter;
    }

    /**
     *
     * @param {number} radius
     * @returns {SnookrTable}
     */
    setDRadius(radius) {
        this.dRadius = radius;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getDRadius() {
        return this.dRadius;
    }
}
