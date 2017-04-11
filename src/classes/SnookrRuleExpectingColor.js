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
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     */
    getShotResult(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = points < 0 ? shotData.getBallsPotted().not('red') : new SnookrBallSet();
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule && (nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched() || shotData.getFirstTouched().getBallType() !== this.expectedColor);

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : (nextRule ? [nextRule] : null),
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {Array}
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
