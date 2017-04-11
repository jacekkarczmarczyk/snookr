class SnookrTablePots {
    /**
     *
     * @param {Array.<SnookrTablePot>} pots
     */
    constructor(pots) {
        this._pots = pots;
    }

    /**
     *
     * @returns {Array.<SnookrTablePot>}
     */
    getPots() {
        return this._pots;
    }
}