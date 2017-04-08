class BallMovement {
    /**
     *
     * @param {Vector|null} speed
     * @param {Spin|null} spin
     */
    constructor(speed = null, spin = null) {
        this.speed = speed ? speed.clone() : Vector.create();
        this.spin = spin ? spin.clone() : Spin.create();
    }

    /**
     *
     * @returns {BallMovement}
     */
    clone() {
        return new BallMovement(this.speed, this.spin);
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
        this.speed.setX(speed.getX());
        this.speed.setY(speed.getY());
        return this;
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
        this.spin.setForwardSpin(forwardSpin);
        return this;
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
        this.spin.setSideSpin(sideSpin);
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getSideSpin() {
        return this.spin.getSideSpin();
    }

}

