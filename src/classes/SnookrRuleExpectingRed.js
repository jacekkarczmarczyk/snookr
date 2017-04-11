class SnookrRuleExpectingRed extends SnookrRule {
    constructor() {
        super();
        this.expectedColor = 'red';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     * @returns {SnookrShotResult}
     */
    getShotResult(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = points < 0 ? shotData.getBallsPotted().not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() !== 'red';

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @return {Array}
     */
    getPointsArray(shotData) {
        const expectedColor = this.expectedColor;
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
        if (this.expectedColor !== 'red' && points >= 0) {
            return new SnookrRuleExpectingColor(this.expectedColor);
        } else if (this.expectedColor === 'red' && points === 0) {
            return new SnookrRuleExpectingRed();
        } else if (this.expectedColor === 'red' && points > 0) {
            return new SnookrRuleExpectingAnyColor();
        } else if (this.expectedColor === 'black') {
            return null;
        } else {
            return SnookrRule.getFreeBallRule(ballsAfterUnpot, 'yellow');
        }
    }
}
