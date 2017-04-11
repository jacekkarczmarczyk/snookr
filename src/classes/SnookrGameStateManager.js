class SnookrGameStateManager {
    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param {number} player
     */
    constructor(ballSet) {
        this._ballSet = ballSet;
        this._history = new SnookrHistory();

        this.reset();
    }

    /**
     *
     * @param {SnookrRule|null} initialRule
     */
    reset(initialRule = null) {
        this._history.clear();
        this._score = [0, 0];
        this._breakScore = [0, 0];
        this._rule = initialRule;
        this._canSetWhitePosition = true;
    }

    /**
     *
     * @returns {number}
     */
    getPlayer() {
        return this._rule.getPlayer();
    }

    /**
     *
     * @returns {[number,number]}
     */
    getScore() {
        return this._score;
    }

    /**
     *
     * @returns {[number,number]}
     */
    getBreakScore() {
        return this._breakScore;
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
     * @returns {boolean}
     */
    canSetWhitePosition() {
        return this._canSetWhitePosition;
    }

    /**
     *
     * @returns {Array}
     */
    getBallSetData() {
        return this._ballSet.map(ball => ({
            position: ball.getPosition(),
            speed: ball.getSpeed(),
            forwardSpin: ball.getForwardSpin(),
            sideSpin: ball.getSideSpin(),
            potted: ball.isPotted()
        }));
    }

    /**
     *
     * @param {Array} ballSetData
     */
    setBallSetData(ballSetData) {
        this._ballSet.forEach(function (ball, index) {
            ball.setPosition(ballSetData[index].position);
            ball.setSpeed(ballSetData[index].speed);
            ball.setForwardSpin(ballSetData[index].forwardSpin);
            ball.setSideSpin(ballSetData[index].sideSpin);
            ball.setPotted(ballSetData[index].potted);
        });
    }

    /**
     *
     * @param {SnookrShotData} shotData
     */
    setResult(shotData) {
        this._score[this._rule.getPlayer()] += Math.max(0, this._rule.getPoints(shotData));
        this._score[1 - this._rule.getPlayer()] += Math.max(0, -this._rule.getPoints(shotData));

        if (this._rule.getPoints(shotData) <= 0) {
            this._breakScore = [0, 0];
        } else {
            this._breakScore[this._rule.getPlayer()] += Math.max(0, this._rule.getPoints(shotData));
            this._breakScore[1 - this._rule.getPlayer()] += Math.max(0, -this._rule.getPoints(shotData));
        }
    }

    /**
     *
     * @param {SnookrRule} rule
     * @return {SnookrGameStateManager}
     */
    setRule(rule) {
        this._rule = rule;
        return this;
    }

    pushState() {
        const historyEntry = new SnookrHistoryEntry(this.getBallSetData(), this._rule, this._score);
        this._history.push(historyEntry);
    }

    /**
     * @todo Add canSetWhitePosition to historyEntry
     */
    popState() {
        const historyEntry = this._history.pop();

        this._score = historyEntry.getScore();
        this._breakScore = [0, 0];
        this._rule = historyEntry.getRule();
        this.setBallSetData(historyEntry.getBalls());
    }

    /**
     *
     * @returns {boolean}
     */
    canPopState() {
        return this._history.count() > 0;
    }
}

