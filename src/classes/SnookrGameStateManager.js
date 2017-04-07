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
     * @param {SnookrRule} initialRule
     */
    constructor(ballSet, initialRule) {
        this._ballSet = ballSet;
        this._ballSetPositions = this.getBallSetData();
        this._history = new SnookrHistory();
        this._player = 0;
        this._score = [0, 0];
        this._breakScore = [0, 0];
        this._rule = initialRule;
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
    pushResult(firstTouched, ballsPotted) {
        const historyEntry = new SnookrHistoryEntry(this._ballSetPositions, this._rule, this._player, this._score);
        this._history.push(historyEntry);
        this._ballSetPositions = this.getBallSetData();

        const lastShotResult = this._rule.getShotResult(firstTouched, ballsPotted, this._ballSet.unpotted());

        this._score[this._player] += lastShotResult.getPointsForCurrentPlayer();
        this._score[1 - this._player] += lastShotResult.getPointsForOpponent();

        if (lastShotResult.playerChanges()) {
            this._player = 1 - this._player;
            this._breakScore = [0, 0];
        } else {
            this._breakScore[this._player] += this._score[this._player];
            this._breakScore[1 - this._player] += this._score[1 - this._player];
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
            this.rollback();
            this._score = score;
        }
    }

    /**
     *
     * @returns {boolean}
     */
    canRollback() {
        return this._history.count() > 0;
    }

    /**
     * @todo Add canSetWhitePosition to historyEntry
     */
    rollback() {
        const historyEntry = this._history.pop();

        this._player = historyEntry.getPlayer();
        this._score = historyEntry.getScore();
        this._breakScore = [0, 0];
        this._rule = historyEntry.getRule();
        this.setBallSetData(historyEntry.getBalls());
    }
}

Object.defineProperty(SnookrGameStateManager, 'GAME_STATE_CUEBALL_POSITIONING', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'GAME_STATE_CUEBALL_POSITIONING'
});

Object.defineProperty(SnookrGameStateManager, 'GAME_STATE_SHOOTING', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'GAME_STATE_SHOOTING'
});

Object.defineProperty(SnookrGameStateManager, 'GAME_STATE_PLAYING', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: 'GAME_STATE_PLAYING'
});
