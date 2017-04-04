class SnookrRuleRepeat extends SnookrRule {
    /**
     *
     * @param {SnookrRule} ruleToRepeat
     * @param restoreBalls
     */
    constructor(ruleToRepeat, restoreBalls) {
        super();
        this.ruleToRepeat = ruleToRepeat;
        this.restoreBalls = restoreBalls;
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @returns {SnookrShotResult}
     */
    getPoints(firstTouched, ballsPotted) {
        throw new TypeError('Cannot call getPoints method on SnookrRulRepeat class');
    }

    /**
     *
     * @returns {SnookrRule}
     */
    getRuleToRepeat() {
        return this.ruleToRepeat;
    }

    getRestoreBalls() {
        return this.restoreBalls;
    }

    toString() {
        return 'Repeat "' + this.ruleToRepeat.toString() + '", ' + (this.restoreBalls ? 'previous position' : 'current position');
    }
}

