class SnookrRuleExpectingAnyColor extends SnookrRule {
    constructor() {
        super();
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @return {SnookrBallSet}
     */
    getBallsToPot(ballSet) {
        return ballSet.unpotted().not('red').not('white');
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @param {SnookrBallSet} ballsLeft
     */
    getShotResult(firstTouched, ballsPotted, ballsLeft) {
        const points = this.getPoints(firstTouched, ballsPotted);
        const ballsToUnpot = ballsPotted.not('red');
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const isMiss = !firstTouched || firstTouched.getBallType() === 'red';

        return new SnookrShotResult(
            points,
            isMiss ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @returns {Array}
     */
    getPointsArray(firstTouched, ballsPotted) {
        const points = [];

        if (!firstTouched || firstTouched.getBallType() === 'red') {
            points.push(-4);
        }

        ballsPotted.forEach(function (pottedBall) {
            if (pottedBall === firstTouched) {
                points.push(SnookrRule.getColorValue(pottedBall));
            } else {
                points.push(SnookrRule.getColorFaulValue(firstTouched));
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
