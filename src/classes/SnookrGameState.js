class SnookrGameState {
    /**
     *
     * @param inAction
     * @param {SnookrBallSet} ballSet
     * @param {Point|null} ghostPosition
     * @param cueDistance
     */
    constructor(inAction, ballSet, ghostPosition, cueDistance) {
        this.inAction = inAction;
        this.ballSet = ballSet;
        this.ghostPosition = ghostPosition;
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

    /**
     *
     * @returns {Point|null}
     */
    getGhostPosition() {
        return this.inAction ? null : this.ghostPosition;
    }

    getCueDistance() {
        return this.cueDistance;
    }
}

