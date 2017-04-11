class SnookrRuleFreeBall extends SnookrRule {
    /**
     *
     * @param {number} player
     * @param {string} expectedColor
     */
    constructor(player, expectedColor) {
        super(player);
        this._expectedColor = expectedColor;
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return this.constructor.name + ': ' + this._expectedColor;
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     * @returns {Array.<SnookrRule>}
     */
    getNextRules(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = shotData.getBallsPotted().not(this._expectedColor);
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched();

        const nextRules = [nextRule];
        if (canRepeat) {
            nextRules.push(new SnookrRuleExpectingAnyColor(this.getPlayer()), new SnookrRuleExpectingAnyColor(this.getPlayer()));
        }
        return nextRules;
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {SnookrBallSet}
     */
    getBallsToUnpot(shotData) {
        return shotData.getBallsPotted().not(this._expectedColor);
    }

    /**
     *
     * @param {SnookrShotData} shotData
     */
    getPointsArray(shotData) {
        const expectedColor = this._expectedColor;
        const points = shotData.getFirstTouched() ? [] : [SnookrRule.getColorFaulValue(expectedColor)];

        shotData.getBallsPotted().forEach(function (pottedBall) {
            if (pottedBall.getBallType() !== expectedColor && pottedBall !== shotData.getFirstTouched()) {
                points.push(SnookrRule.getColorFaulValue(pottedBall));
                points.push(SnookrRule.getColorFaulValue(expectedColor))
            } else if (expectedColor === 'red' || pottedBall === shotData.getFirstTouched()) {
                points.push(SnookrRule.getColorValue(expectedColor));
            }
        });

        return points;
    }

    /**
     *
     * @param points
     * @param {SnookrBallSet} ballsAfterUnpot
     * @returns {SnookrRule|null}
     */
    getNextRule(points, ballsAfterUnpot) {
        if (this._expectedColor !== 'red' && points >= 0) {
            return new SnookrRuleExpectingColor(points ? this.getPlayer() : (1 - this.getPlayer()), this._expectedColor);
        } else if (this._expectedColor === 'red' && points === 0) {
            return new SnookrRuleExpectingRed(1 - this.getPlayer());
        } else if (this._expectedColor === 'red' && points > 0) {
            return new SnookrRuleExpectingAnyColor(this.getPlayer());
        } else if (this._expectedColor === 'black') {
            return new SnookrRuleFrameOver(this.getPlayer());
        } else {
            return this.getFreeBallRule(ballsAfterUnpot, 'yellow');
        }
    }
}
