/*
const stateManager = new SnookrGameStateManager(ballSet);
if (ballStopped) {
    stateManager.pushShotResult(shotResult);
}
if (ctrlz) {
    if (stateManager.canRollback()) {
        stateManager.rollback();
    }
}
nextRules = stateManager.getNextRules();
stateManager.selectNextRule(0);
*/

class SnookrGameStateManager {
    /**
     *
     * @param {SnookrBallSet} ballSet
     */
    constructor(ballSet) {
        this.ballSet = ballSet;
        this.reset();
    }

    reset() {
        this.history = new SnookrHistory();
        this.player = 0;
        this.score = [0, 0];
        this.breakScore = [0, 0];
        this.rule = new SnookrRuleExpectingRed();
        this.canSetWhitePosition = true;
        this.nextRules = null;
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     */
    pushResult(firstTouched, ballsPotted) {
        const lastShotResult = this.rule.getShotResult(firstTouched, ballsPotted, this.ballSet.unpotted());

        this.score[this.player] += lastShotResult.getPointsForCurrentPlayer();
        this.score[1 - this.player] += lastShotResult.getPointsForOpponent();

        if (lastShotResult.playerChanges()) {
            this.player = 1 - this.player;
            this.breakScore = [0, 0];
        } else {
            this.breakScore[this.player] += this.score[this.player];
            this.breakScore[1 - this.player] += this.score[1 - this.player];
        }

        this.nextRules = lastShotResult.getNextRules();
    }

    /**
     *
     * @returns {Array.<SnookrRule>}
     */
    getNextRules() {
        return this.nextRules.slice(0);
    }

    /**
     *
     * @param {number} ruleId
     */
    selectNextRule(ruleId) {
        if (typeof this.nextRules[ruleId] === 'undefined') {
            throw 'Invalid rule';
        }

        this.rule = this.nextRules[ruleId];
        if (this.rule instanceof SnookrRuleRepeat) {
            this.rule = this.rule.getRuleToRepeat();
            this.player = 1 - this.player();
        }
    }

    /**
     *
     * @returns {boolean}
     */
    canRollback() {
        return this.history.count() > 0;
    }

    /**
     * @todo Add canSetWhitePosition to historyEntry
     */
    rollback() {
        const historyEntry = this.history.pop();

        this.player = historyEntry.getPlayer();
        this.score = historyEntry.getScore();
        this.breakScore = [0, 0];
        this.rule = historyEntry.getRule();
        this.ballSet.restore(historyEntry.getBalls());
    }
}