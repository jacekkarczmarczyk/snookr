class SnookrRuleExpectingRed extends SnookrRule {
    constructor() {
        super();
        this.expectedColor = 'red';
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @return {SnookrBallSet}
     */
    getBallsToPot(ballSet) {
        return ballSet.unpotted().only('red');
    }


    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @param {SnookrBallSet} ballsLeft
     * @returns {SnookrShotResult}
     */
    getShotResult(firstTouched, ballsPotted, ballsLeft) {
        const points = this.getPoints(firstTouched, ballsPotted);
        const ballsToUnpot = points < 0 ? ballsPotted.not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));

        return new SnookrShotResult(
            points,
            points < 0 ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @return {Array}
     */
    getPointsArray(firstTouched, ballsPotted) {
        const expectedColor = this.expectedColor;
        const points = [];

        if (!firstTouched) {
            points.push(SnookrRule.getColorFaulValue(expectedColor));
        } else {
            if (firstTouched.getBallType() !== expectedColor) {
                points.push(SnookrRule.getColorFaulValue(expectedColor));
                points.push(SnookrRule.getColorFaulValue(firstTouched));
            }
        }

        ballsPotted.forEach(function (pottedBall) {
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
