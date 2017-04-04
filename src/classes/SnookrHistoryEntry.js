class SnookrHistoryEntry {
    /**
     *
     * @param {Array} balls
     * @param {SnookrRule} rule
     * @param {number} player
     * @param {[number,number]} score
     */
    constructor(balls, rule, player, score) {
        this.balls = balls;
        this.rule = rule;
        this.player = player;
        this.score = [score[0], score[1]];
    }

    /**
     *
     * @returns {number}
     */
    getPlayer() {
        return this.player;
    }

    /**
     *
     * @returns {SnookrRule}
     */
    getRule() {
        return this.rule;
    }

    /**
     *
     * @returns {Array}
     */
    getBalls() {
        return this.balls;

    }

    /**
     *
     * @returns {[number,number]}
     */
    getScore() {
        return this.score;
    }
}