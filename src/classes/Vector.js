class Vector {
    /**
     *
     * @param x
     * @param y
     */
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.dirty();
    }

    dirty() {
        this.computedLength = null;
        this.computedAngle = null;
        this.computedSin = null;
        this.computedCos = null;
    }

    /**
     *
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y);
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
     * @param {number} x
     * @returns {Vector}
     */
    setX(x) {
        this.x = x;
        this.dirty();
        return this;
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
     * @param {number} y
     * @returns {Vector}
     */
    setY(y) {
        this.y = y;
        this.dirty();
        return this;
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
        if (this.computedLength === null) {
            this.computedLength = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.computedLength;
    }

    /**
     *
     * @returns {number}
     */
    getSin() {
        if (this.computedSin === null) {
            this.computedSin = this.y / this.getLength();
        }
        return this.computedSin;
    }

    /**
     *
     * @returns {number}
     */
    getCos() {
        if (this.computedCos === null) {
            this.computedCos = this.x / this.getLength();
        }
        return this.computedCos;
    }

    /**
     *
     * @returns {number}
     */
    getAngle() {
        if (this.computedAngle === null) {
            const length = this.getLength();
            const angle = length ? Math.acos(this.x / length) : 0;
            this.computedAngle = (angle && this.y < 0) ? (Math.PI * 2 - angle) : angle;
        }
        return this.computedAngle;
    }

    /**
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    add(vector) {
        this.x += vector.getX();
        this.y += vector.getY();
        this.dirty();
        return this;
    }

    /**
     *
     * @param {Vector} vector
     * @returns {Vector}
     */
    subtract(vector) {
        this.x -= vector.getX();
        this.y -= vector.getY();
        this.dirty();
        return this;
    }

    /**
     *
     * @param scale
     * @returns {Vector}
     */
    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        this.dirty();
        return this;
    }

    /**
     *
     * @param {number} normalizeTo
     * @returns {Vector}
     */
    normalize(normalizeTo = 1) {
        const length = this.getLength();
        if (!length) {
            this.x = normalizeTo;
            this.y = 0;
        } else {
            const scale = normalizeTo / length;
            this.x *= scale;
            this.y *= scale;
        }
        this.dirty();
        return this;
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
        this.x = x;
        this.y = y;
        this.dirty();
        return this;
    }

    /**
     *
     * @returns {Point}
     */
    toPoint() {
        return Point.create(this.x, this.y);
    }
}
