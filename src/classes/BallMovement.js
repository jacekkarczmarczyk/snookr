/**
 * Immutable data object
 */
class BallMovement {
    /**
     *
     * @param {Vector|null} speed
     * @param {Spin|null} spin
     */
    constructor(speed = null, spin = null) {
        this.speed = speed || new Vector(0, 0);
        this.spin = spin || new Spin();
    }

    /**
     *
     * @param {Vector|null} speed
     * @param {Spin|null} spin
     * @returns {BallMovement}
     */
    static create(speed = null, spin = null) {
        return new BallMovement(speed, spin);
    }

    /**
     *
     * @param {Vector} speed
     * @returns {BallMovement}
     */
    setSpeed(speed) {
        return BallMovement.create(speed, this.spin);
    }

    /**
     *
     * @returns {Vector}
     */
    getSpeed() {
        return this.speed;
    }

    /**
     *
     * @param {Vector} forwardSpin
     * @returns {BallMovement}
     */
    setForwardSpin(forwardSpin) {
        return new BallMovement(this.speed, this.spin.setForwardSpin(forwardSpin));
    }

    /**
     *
     * @returns {Vector}
     */
    getForwardSpin() {
        return this.spin.getForwardSpin();
    }

    /**
     *
     * @param sideSpin
     * @returns {BallMovement}
     */
    setSideSpin(sideSpin) {
        return new BallMovement(this.speed, this.spin.setSideSpin(sideSpin));
    }

    /**
     *
     * @returns {number}
     */
    getSideSpin() {
        return this.spin.getSideSpin();
    }

}

