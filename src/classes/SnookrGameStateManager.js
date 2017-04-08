// pushState();
// shotFired();
// if (ctrlz) {
//     popState();
//     shotFired();
// }
// if (shotCompleted) {
//     setShotResult(firstTouched, ballsPotted);
//     setRule(chooseRule(getNextRules));
// }
//
// setRule() {
//     if (repeat) {
//         popState()
//     }
// }
//
class SnookrGameStateManager {
    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param {SnookrRule} initialRule
     * @param {number} player
     */
    constructor(ballSet, initialRule, player) {
        this._ballSet = ballSet;
        this._history = new SnookrHistory();
        this._initialRule = initialRule;

        this.reset(player);
    }

    /**
     *
     * @param {number} player
     */
    reset(player) {
        this._history.clear();
        this._player = player;
        this._score = [0, 0];
        this._breakScore = [0, 0];
        this._rule = this._initialRule;
        this._canSetWhitePosition = true;
        this._nextRules = null;
        this._ballsToUnpot = null
    }

    /**
     *
     * @returns {number}
     */
    getPlayer() {
        return this._player;
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

    getBallsToUnpot() {
        return this._ballsToUnpot;
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
     * @returns {Array.<SnookrRule>}
     */
    getNextRules() {
        return this._nextRules;
    }

    /**
     *
     * @returns {Array}
     */
    getBallSetData() {
        return this._ballSet.map(ball => ({
            position: ball.getPosition(),
            movement: ball.getMovement(),
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
            ball.setMovement(ballSetData[index].movement);
            ball.setPotted(ballSetData[index].potted);
        });
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     */
    setResult(firstTouched, ballsPotted) {
        const lastShotResult = this._rule.getShotResult(firstTouched, ballsPotted, this._ballSet.unpotted());

        this._score[this._player] += lastShotResult.getPointsForCurrentPlayer();
        this._score[1 - this._player] += lastShotResult.getPointsForOpponent();

        if (lastShotResult.playerChanges()) {
            this._player = 1 - this._player;
            this._breakScore = [0, 0];
        } else {
            this._breakScore[this._player] += lastShotResult.getPointsForCurrentPlayer();
            this._breakScore[1 - this._player] += lastShotResult.getPointsForOpponent();
        }

        this._nextRules = lastShotResult.getNextRules();
        this._ballsToUnpot = lastShotResult.getBallsToUnpot();
    }

    /**
     *
     * @param {SnookrRule} rule
     */
    selectNextRule(rule) {
        this._rule = rule;

        if (this._rule instanceof SnookrRuleRepeat) {
            const score = this._score;
            if (this._rule.getRestoreBalls()) {
                this.popState();
            } else {
                this._rule = this._rule.getRuleToRepeat();
                this._player = 1 - this._player;
            }

            this._score = score;
        }
    }

    pushState() {
        const historyEntry = new SnookrHistoryEntry(this.getBallSetData(), this._rule, this._player, this._score);
        this._history.push(historyEntry);
    }

    /**
     * @todo Add canSetWhitePosition to historyEntry
     */
    popState() {
        const historyEntry = this._history.pop();

        this._player = historyEntry.getPlayer();
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

