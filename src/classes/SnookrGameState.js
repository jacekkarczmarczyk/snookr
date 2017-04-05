class SnookrGameState {
    /**
     *
     * @param inAction
     * @param {SnookrBallSet} ballSet
     * @param cueDistance
     */
    constructor(inAction, ballSet, cueDistance) {
        this.inAction = inAction;
        this.ballSet = ballSet;
        this.cueDistance = cueDistance;
    }

    /**
     *
     * @returns {*}
     */
    getCueBall() {
        return this.ballSet.only('white').first();
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    getBallSet() {
        return this.ballSet;
    }

    getCueDistance() {
        return this.cueDistance;
    }
}

