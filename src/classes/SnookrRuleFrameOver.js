class SnookrRuleFrameOver extends SnookrRule {
    /**
     *
     * @param {number} player
     */
    constructor(player) {
        super(player);
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return this.constructor.name;
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     * @returns {Array.<SnookrRule>}
     */
    getNextRules(shotData, ballsLeft) {
        throw 'Cannot get next rules after frame over';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {SnookrBallSet}
     */
    getBallsToUnpot(shotData) {
        throw 'Cannot unpot balls after frame over';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     */
    getPointsArray(shotData) {
        return [];
    }
}
