class SnookrShotResult {
    /**
     *
     * @param points
     * @param {Array|null} nextRules
     * @param {SnookrBallSet} ballsToUnpot
     */
    constructor(points, nextRules, ballsToUnpot) {
        this.points = points;
        this.nextRules = nextRules;
        this.ballsToUnpot = ballsToUnpot;
    }

    isFaul() {
        return this.points < 0;
    }

    playerChanges() {
        return this.points <= 0;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    getBallsToUnpot() {
        return this.ballsToUnpot;
    }

    /**
     *
     * @returns {Array|null}
     */
    getNextRules() {
        return this.nextRules;
    }

    getPointsForCurrentPlayer() {
        return this.isFaul() ? 0 : this.points;
    }

    getPointsForOpponent() {
        return this.isFaul() ? -this.points : 0;
    }

}
