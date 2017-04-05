class SpinPower {
    constructor(forwardSpinPower = 0, sideSpinPower = 0) {
        this._forwardSpinPower = forwardSpinPower;
        this._sideSpinPower = sideSpinPower;
    }


    getForwardSpinPower() {
        return this._forwardSpinPower;
    }

    setForwardSpinPower(value) {
        this._forwardSpinPower = value;
    }

    getSideSpinPower() {
        return this._sideSpinPower;
    }

    setSideSpinPower(value) {
        this._sideSpinPower = value;
    }

    clear() {
        this.setForwardSpinPower(0);
        this.setSideSpinPower(0);
    }
}