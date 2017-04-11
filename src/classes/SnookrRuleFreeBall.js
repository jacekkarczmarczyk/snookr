class SnookrRuleFreeBall extends SnookrRule {
    constructor(expectedColor) {
        super();
        this.expectedColor = expectedColor;
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
     * @param {SnookrShotData} shotData
     * @param {SnookrBallSet} ballsLeft
     */
    getShotResult(shotData, ballsLeft) {
        const points = this.getPoints(shotData);
        const ballsToUnpot = shotData.getBallsPotted().not(this.expectedColor);
        const nextRule = this.getNextRule(points, (new SnookrBallSet).add(ballsLeft).add(ballsToUnpot));
        const canRepeat = nextRule instanceof SnookrRuleFreeBall || shotData.getBallsPotted().first('white') || !shotData.getFirstTouched();

        return new SnookrShotResult(
            points,
            canRepeat ? [nextRule, new SnookrRuleRepeat(this, false), new SnookrRuleRepeat(this, true)] : [nextRule],
            ballsToUnpot
        );
    }

    /**
     *
     * @param {SnookrShotData} shotData
     */
    getPointsArray(shotData) {
        const expectedColor = this.expectedColor;
        const points = shotData.getFirstTouched() ? [] : [SnookrRule.getColorFaulValue(expectedColor)];

        shotData.getBallsPotted().forEach(function (pottedBall) {
            if (pottedBall.getBallType() !== expectedColor && pottedBall !== shotData.getFirstTouched()) {
                points.push(SnookrRule.getColorFaulValue(pottedBall));
                points.push(SnookrRule.getColorFaulValue(expectedColor))
            } else if (expectedColor === 'red' || pottedBall === shotData.getFirstTouched()) {
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
