class SnookrRuleExpectingColor extends SnookrRule {
    constructor(expectedColor) {
        super();
        this.expectedColor = expectedColor;
    }

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
        const ballsToUnpot = points < 0 ? ballsPotted.not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule && (nextRule instanceof SnookrRuleFreeBall || ballsPotted.first('white') || !firstTouched || firstTouched.getBallType() !== this.expectedColor);

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : (nextRule ? [nextRule] : null),
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
     * @returns {SnookrRule|null}
     */
    getNextRule(points, ballsAfterUnpot) {
        if (points === 0) {
            return new SnookrRuleExpectingColor(this.expectedColor);
        }

        if (this.expectedColor === 'black') {
            return null;
        }

        if (points > 0) {
            return new SnookrRuleExpectingColor({
                yellow: 'green',
                green: 'brown',
                brown: 'blue',
                blue: 'pink',
                pink: 'black'
            }[this.expectedColor]);
        }

        return SnookrRule.getFreeBallRule(ballsAfterUnpot, this.expectedColor);
    }
}
