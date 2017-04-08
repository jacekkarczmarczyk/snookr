class Spin {
    /**
     *
     * @param {Vector} forwardSpin
     * @param {number} sideSpin
     */
    constructor(forwardSpin = null, sideSpin = 0) {
        this.forwardSpin = forwardSpin || Vector.create();
        this.sideSpin = sideSpin;
    }

    /**
     *
     * @param {Vector} forwardSpin
     * @param sideSpin
     */
    static create(forwardSpin = null, sideSpin = 0) {
        return new Spin(forwardSpin, sideSpin);
    }

    /**
     *
     * @returns {Spin}
     */
    clone() {
        return new Spin(this.forwardSpin, this.sideSpin);
    }

    /**
     *
     * @param {Vector} forwardSpin
     */
    setForwardSpin(forwardSpin) {
        this.forwardSpin.setX(forwardSpin.getX());
        this.forwardSpin.setY(forwardSpin.getY());
        return this;
    }

    /**
     *
     * @returns {Vector}
     */
    getForwardSpin() {
        return this.forwardSpin;
    }

    /**
     *
     * @param sideSpin
     * @returns Spin
     */
    setSideSpin(sideSpin) {
        this.sideSpin = sideSpin;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getSideSpin() {
        return this.sideSpin;
    }
}
