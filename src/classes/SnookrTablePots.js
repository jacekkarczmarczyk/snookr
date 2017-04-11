class SnookrTablePots {
    /**
     *
     * @param {Array.<SnookrTablePot>} pots
     */
    constructor(pots = []) {
        this.setPots(pots);
    }

    /**
     *
     * @param {Array.<SnookrTablePot>} pots
     */
    setPots(pots) {
        this._pots = pots;
        return this;
    }

    /**
     *
     * @returns {Array.<SnookrTablePot>}
     */
    getPots() {
        return this._pots;
    }
}