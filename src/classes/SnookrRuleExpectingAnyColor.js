class SnookrRuleExpectingAnyColor extends SnookrRule {
    /**
     *
     * @param {number} player
     */
    constructor(player) {
        super(player);
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     * @returns {Array.<SnookrRule>}
     */
    getNextRules(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = shotData.getBallsPotted().not('red');
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() === 'red';

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
        return shotData.getBallsPotted().not('red');
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {Array}
     */
    getPointsArray(shotData) {
        const points = [];

        if (!shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() === 'red') {
            points.push(-4);
        }

        shotData.getBallsPotted().forEach(function (pottedBall) {
            if (pottedBall === shotData.getFirstTouched()) {
                points.push(SnookrRule.getColorValue(pottedBall));
            } else {
                points.push(SnookrRule.getColorFaulValue(shotData.getFirstTouched()));
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
        if (points < 0) {
            return this.getFreeBallRule(ballsAfterUnpot, 'yellow');
        } else if (ballsAfterUnpot.only('red').count()) {
            return new SnookrRuleExpectingRed(points ? this.getPlayer() : (1 - this.getPlayer()));
        } else {
            return new SnookrRuleExpectingColor(points ? this.getPlayer() : (1 - this.getPlayer()), 'yellow');
        }
    }
}
