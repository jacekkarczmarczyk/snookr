class SnookrTableBoundaryPoint {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} d
     */
    constructor(x, y, d) {
        this._x = x;
        this._y = y;
        this._d = d;
    }

    /**
     *
     * @returns {Point}
     */
    getPoint() {
        return Point.create(this._x, this._y);
    }

    /**
     *
     * @returns {number}
     */
    getX() {
        return this._x;
    }

    /**
     *
     * @returns {number}
     */
    getY() {
        return this._y;
    }

    /**
     *
     * @returns {number}
     */
    getD() {
        return this._d;
    }
}