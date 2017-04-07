class SpinPower {
    /**
     *
     * @param {number} forwardSpinPower
     * @param {number} sideSpinPower
     */
    constructor(forwardSpinPower = 0, sideSpinPower = 0) {
        this.setPower(forwardSpinPower, sideSpinPower);
    }

    /**
     *
     * @param {number} forwardSpinPower
     * @param {number} sideSpinPower
     */
    setPower(forwardSpinPower, sideSpinPower) {
        if (forwardSpinPower ** 2 + sideSpinPower ** 2 > 1) {
            throw new TypeError('Invalid value');
        }

        this._forwardSpinPower = forwardSpinPower;
        this._sideSpinPower = sideSpinPower;
    }

    /**
     *
     * @returns {number}
     */
    getForwardSpinPower() {
        return this._forwardSpinPower;
    }

    /**
     *
     * @param {number} value
     */
    setForwardSpinPower(value) {
        this.setPower(value, this._sideSpinPower);
    }

    /**
     *
     * @param {number} delta
     */
    changeForwardSpinPower(delta) {
        let newForwardSpinPower = this._forwardSpinPower + delta;
        if (this._sideSpinPower ** 2 + newForwardSpinPower ** 2 > 1) {
            newForwardSpinPower = Math.sign(delta) * Math.sqrt(1 - this._sideSpinPower ** 2);
        }
        this.setPower(newForwardSpinPower, this._sideSpinPower);
    }

    /**
     *
     * @returns {number}
     */
    getSideSpinPower() {
        return this._sideSpinPower;
    }

    /**
     *
     * @param {number} value
     */
    setSideSpinPower(value) {
        this.setPower(this._forwardSpinPower, value);
    }

    /**
     *
     * @param {number} delta
     */
    changeSideSpinPower(delta) {
        let newSideSpinPower = this._sideSpinPower + delta;
        if (this._forwardSpinPower ** 2 + newSideSpinPower ** 2 > 1) {
            newSideSpinPower = Math.sign(delta) * Math.sqrt(1 - this._forwardSpinPower ** 2);
        }
        this.setPower(this._forwardSpinPower, newSideSpinPower);
    }

    clear() {
        this.setPower(0, 0);
    }
}