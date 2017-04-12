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
        const scale = Math.max(1, Math.sqrt(forwardSpinPower ** 2 + sideSpinPower ** 2));

        this._forwardSpinPower = forwardSpinPower / scale;
        this._sideSpinPower = sideSpinPower / scale;
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