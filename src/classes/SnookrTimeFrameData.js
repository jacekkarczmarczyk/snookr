class SnookrTimeFrameData {
    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @param {number} ballHitsBallPower
     */
    constructor(firstTouched, ballsPotted, ballHitsBallPower) {
        this._firstTouched = firstTouched;
        this._ballsPotted = ballsPotted;
        this._ballHitsBallPower = ballHitsBallPower;
    }

    /**
     *
     * @returns {SnookrBall}
     */
    getFirstTouched() {
        return this._firstTouched;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    getBallsPotted() {
        return this._ballsPotted;

    }

    /**
     *
     * @returns {number}
     */
    getBallHitsBallPower() {
        return this._ballHitsBallPower;
    }
}