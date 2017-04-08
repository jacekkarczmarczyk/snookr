class SnookrRuleFreeBall extends SnookrRule {
    constructor(expectedColor) {
        super();
        this.expectedColor = expectedColor;
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @return {SnookrBallSet}
     */
    getBallsToPot(ballSet) {
        return ballSet.unpotted();
    }

    /**
     *
     * @returns {string}
     */
    toString() {
        return this.constructor.name + ': ' + this.expectedColor;
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     * @param {SnookrBallSet} ballsLeft
     */
    getShotResult(firstTouched, ballsPotted, ballsLeft) {
        const points = this.getPoints(firstTouched, ballsPotted);
        const ballsToUnpot = ballsPotted.not(this.expectedColor);
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || ballsPotted.first('white') || !firstTouched;

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrBall} firstTouched
     * @param {SnookrBallSet} ballsPotted
     */
    getPointsArray(firstTouched, ballsPotted) {
        const expectedColor = this.expectedColor;
        const points = firstTouched ? [] : [SnookrRule.getColorFaulValue(expectedColor)];

        ballsPotted.forEach(function (pottedBall) {
            if (pottedBall.getBallType() !== expectedColor && pottedBall !== firstTouched) {
                points.push(SnookrRule.getColorFaulValue(pottedBall));
                points.push(SnookrRule.getColorFaulValue(expectedColor))
            } else if (expectedColor === 'red' || pottedBall === firstTouched) {
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
