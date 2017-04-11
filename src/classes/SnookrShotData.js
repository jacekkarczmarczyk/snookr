class SnookrShotData {
    constructor() {
        this._firstTouched = null;
        this._ballsPotted = new SnookrBallSet();
    }

    /**
     *
     * @param {SnookrTimeFrameData} timeFrameData
     */
    update(timeFrameData) {
        if (this._firstTouched === null) {
            this._firstTouched = timeFrameData.getFirstTouched();
        }

        this._ballsPotted.add(timeFrameData.getBallsPotted());
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
}