/**
 * Immutable data object
 */
class Vector {
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
     * @param {number} x
     * @param {number} y
     * @returns {Vector}
     */
    static create(x = 0, y = 0) {
        return new Vector(x, y);
    }

    /**
     *
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     *
     * @returns {number}
     */
    getY() {
        return this.y;
    }

    /**
     *
     * @returns {number}
     */
    getLength() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        this.getLength = () => length;
        return length;
    }

    /**
     *
     * @returns {number}
     */
    getSin() {
        const sin = this.y / this.getLength();
        this.getSin = () => sin;
        return sin;
    }

    /**
     *
     * @returns {number}
     */
    getCos() {
        const cos = this.x / this.getLength();
        this.getCos = () => cos;
        return cos;
    }

    /**
     *
     * @returns {number}
     */
    getAngle() {
        const length = this.getLength();
        const angle = length ? Math.acos(this.x / length) : 0;
        const angleNormalized = (angle && this.y < 0) ? (Math.PI * 2 - angle) : angle;
        this.getAngle = () => angleNormalized;
        return angleNormalized;
    }

    /**
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    add(vector) {
        return Vector.create(this.x + vector.getX(), this.y + vector.getY());
    }

    /**
     *
     * @param scale
     * @returns {Vector}
     */
    scale(scale) {
        return Vector.create(this.x * scale, this.y * scale);
    }

    /**
     *
     * @returns {Vector}
     */
    normalize() {
        const length = this.getLength();
        return this.scale(length ? (1 / length) : 1);
    }

    /**
     *
     * @returns {Vector}
     */
    rotate(angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;
        return Vector.create(x, y);
    }

    /**
     *
     * @returns {Point}
     */
    toPoint() {
        return Point.create(this.x, this.y);
    }
}
