class SnookrRuleExpectingRed extends SnookrRule {
    /**
     *
     * @param {number} player
     */
    constructor(player) {
        super(player);
        this._expectedColor = 'red';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     * @returns {Array.<SnookrRule>}
     */
    getNextRules(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = points < 0 ? shotData.getBallsPotted().not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() !== 'red';

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
        const points = this.getPoints(shotData);
        return points < 0 ? shotData.getBallsPotted().not('red') : new SnookrBallSet();
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @return {Array}
     */
    getPointsArray(shotData) {
        const expectedColor = this._expectedColor;
        const points = [];

        if (!shotData.getFirstTouched()) {
            points.push(SnookrRule.getColorFaulValue(expectedColor));
        } else {
            if (shotData.getFirstTouched().getBallType() !== expectedColor) {
                points.push(SnookrRule.getColorFaulValue(expectedColor));
                points.push(SnookrRule.getColorFaulValue(shotData.getFirstTouched()));
            }
        }

        shotData.getBallsPotted().forEach(function (pottedBall) {
            if (pottedBall.getBallType() === expectedColor) {
                points.push(SnookrRule.getColorValue(pottedBall));
            } else {
                points.push(SnookrRule.getColorFaulValue(expectedColor));
                points.push(SnookrRule.getColorFaulValue(pottedBall));
            }
        });

        return points;
    }

    /**
     *
     * @param points
     * @param {SnookrBallSet} ballsAfterUnpot
     * @returns {SnookrRule}
     */
    getNextRule(points, ballsAfterUnpot) {
        if (this._expectedColor !== 'red' && points >= 0) {
            return new SnookrRuleExpectingColor(this.getPlayer(), this._expectedColor);
        } else if (this._expectedColor === 'red' && points === 0) {
            return new SnookrRuleExpectingRed(1 - this.getPlayer());
        } else if (this._expectedColor === 'red' && points > 0) {
            return new SnookrRuleExpectingAnyColor(this.getPlayer());
        } else {
            return this.getFreeBallRule(ballsAfterUnpot, 'yellow');
        }
    }
}
