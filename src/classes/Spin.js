/**
 * Immutable data object
 */
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
     * @param {Vector} forwardSpin
     */
    setForwardSpin(forwardSpin) {
        return Spin.create(forwardSpin, this.sideSpin);
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
        return Spin.create(this.forwardSpin, sideSpin);
    }

    /**
     *
     * @returns {number}
     */
    getSideSpin() {
        return this.sideSpin;
    }
}
