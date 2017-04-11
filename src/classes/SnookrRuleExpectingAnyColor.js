class SnookrRuleExpectingAnyColor extends SnookrRule {
    constructor() {
        super();
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     */
    getShotResult(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = shotData.getBallsPotted().not('red');
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() === 'red';

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
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
            return SnookrRule.getFreeBallRule(ballsAfterUnpot, 'yellow');
        } else if (ballsAfterUnpot.only('red').count()) {
            return new SnookrRuleExpectingRed();
        } else {
            return new SnookrRuleExpectingColor('yellow');
        }
    }
}
