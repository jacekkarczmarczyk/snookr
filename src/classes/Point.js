/**
 * Immutable data object
 */
class Point {
    /**
     *
     * @param x
     * @param y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @param x
     * @param y
     * @returns {Point}
     */
    static create(x = 0, y = 0) {
        if (isNaN(x) || isNaN(y)) {
            throw 'Invalid parameter';
        }
        return new Point(x, y);
    }

    /**
     *
     */
    getX() {
        return this.x;
    }

    /**
     *
     */
    getY() {
        return this.y;
    }

    /**
     *
     * @param {Point} point
     */
    getDistance(point) {
        const dx = this.x - point.getX();
        const dy = this.y - point.getY();
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     *
     * @param {Point} lineStart
     * @param {Point} lineEnd
     */
    getLineDistance(lineStart, lineEnd) {
        const x1 = lineStart.getX();
        const y1 = lineStart.getY();
        const x2 = lineEnd.getX();
        const y2 = lineEnd.getY();

        return Math.abs(((y1 - y2) * this.getX() + (x2 - x1) * this.getY() + (x1 * y2 - x2 * y1)) / Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
    }

    /**
     *
     * @param {Vector} vector
     * @param scale
     * @returns {Point}
     */
    translate(vector, scale = 1) {
        return Point.create(this.x + scale * vector.getX(), this.y + scale * vector.getY());
    }

    /**
     *
     * @param {Point} point
     * @returns {Vector}
     */
    vectorTo(point) {
        return Vector.create(point.getX() - this.getX(), point.getY() - this.getY());
    }
}

