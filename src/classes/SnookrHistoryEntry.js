class SnookrHistoryEntry {
    /**
     *
     * @param {Array} balls
     * @param {SnookrRule} rule
     * @param {[number,number]} score
     */
    constructor(balls, rule, score) {
        this._balls = balls;
        this._rule = rule;
        this._score = [score[0], score[1]];
    }

    /**
     *
     * @returns {SnookrRule}
     */
    getRule() {
        return this._rule;
    }

    /**
     *
     * @returns {Array}
     */
    getBalls() {
        return this._balls;

    }

    /**
     *
     * @returns {[number,number]}
     */
    getScore() {
        return this._score;
    }
}