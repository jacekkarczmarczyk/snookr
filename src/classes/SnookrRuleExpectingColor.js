class SnookrRuleExpectingColor extends SnookrRule {
    /**
     *
     * @param {number} player
     * @param {string} expectedColor
     */
    constructor(player, expectedColor) {
        super(player);
        this._expectedColor = expectedColor;
    }

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
        const ballsToUnpot = points < 0 ? shotData.getBallsPotted().not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = !(nextRule instanceof SnookrRuleFrameOver) && (nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() !== this._expectedColor);
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
     * @returns {Array}
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
     * @returns {SnookrRule|null}
     */
    getNextRule(points, ballsAfterUnpot) {
        if (points === 0) {
            return new SnookrRuleExpectingColor(1 - this.getPlayer(), this._expectedColor);
        }

        if (this._expectedColor === 'black') {
            return new SnookrRuleFrameOver(this.getPlayer());
        }

        if (points > 0) {
            return new SnookrRuleExpectingColor(this.getPlayer(), {
                yellow: 'green',
                green: 'brown',
                brown: 'blue',
                blue: 'pink',
                pink: 'black'
            }[this._expectedColor]);
        }

        return this.getFreeBallRule(ballsAfterUnpot, this._expectedColor);
    }
}
