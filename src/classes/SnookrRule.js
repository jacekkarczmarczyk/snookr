class SnookrRule {
    /**
     *
     * @param {number} player
     */
    constructor(player) {
        this._player = player;
    }

    /**
     *
     * @returns {number}
     */
    getPlayer() {
        return this._player;
    }

    //noinspection JSUnusedLocalSymbols
    getNextRules(shotData, ballsLeft) {
        throw 'Abstract method called';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {SnookrBallSet}
     */
    //noinspection JSUnusedLocalSymbols
    getBallsToUnpot(shotData) {
        throw 'Abstract method called';
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {number}
     */
    getPoints(shotData) {
        const pointsArray = this.getPointsArray(shotData);
        return Math.min(0, ...pointsArray.filter(x => x < 0)) || pointsArray.reduce((carry, item) => carry + item, 0);
    }

    /**
     *
     * @param {SnookrShotData} shotData
     * @returns {Array}
     */
    getPointsArray(shotData) {
        throw 'Abstract method called';
    }

    toString() {
        return this.constructor.name;
    }

    static getColorValues() {
        return {
            red: 1,
            yellow: 2,
            green: 3,
            brown: 4,
            blue: 5,
            pink: 6,
            black: 7
        };
    }

    /**
     *
     * @param {SnookrBall|string} ball
     */
    static getColorValue(ball) {
        const ballType = ball instanceof SnookrBall ? ball.getBallType() : ball;
        const colorValue = SnookrRule.getColorValues()[ballType];

        if (colorValue !== void 0) {
            return colorValue;
        }

        throw 'Invalid ball type';
    }

    /**
     *
     * @param {SnookrBall|string} ball
     */
    static getColorFaulValue(ball) {
        const ballType = ball instanceof SnookrBall ? ball.getBallType() : ball;
        if (ballType === 'white') {
            return -4;
        }

        return Math.min(-4, -SnookrRule.getColorValue(ballType));
    }

    /**
     *
     * @param {SnookrBallSet} ballsAfterUnpot
     * @param color
     * @returns {SnookrRule}
     */
    getFreeBallRule(ballsAfterUnpot, color) {
        const nextBallType = ballsAfterUnpot.only('red').count() ? 'red' : color;

        if (SnookrRule.isFreeBall(ballsAfterUnpot, nextBallType)) {
            return new SnookrRuleFreeBall(1 - this.getPlayer(), nextBallType);
        }

        return nextBallType === 'red' ? new SnookrRuleExpectingRed(1 - this.getPlayer()) : new SnookrRuleExpectingColor(1 - this.getPlayer(), nextBallType);
    }

    /**
     *
     * @param {SnookrBallSet} unpottedBalls
     * @param expectedColor
     * @returns {boolean}
     */
    static isFreeBall(unpottedBalls, expectedColor) {
        const cueBall = unpottedBalls.only('white').first();
        return unpottedBalls.only(expectedColor).reduce(function (isFreeBall, objectBall) {
            if (!isFreeBall) {
                return false;
            }

            const hidingBalls = unpottedBalls.not(cueBall).not(objectBall).not(objectBall.getBallType());
            const fullyTouchable = hidingBalls.reduce(function (fullyTouchable, hidingBall) {
                return fullyTouchable && !objectBall.isPartiallyHiddenBehind(cueBall, hidingBall);
            }, true);

            return isFreeBall && !fullyTouchable;
        }, true);
    }

    /**
     *
     * @param {SnookrBallSet} unpottedBalls
     * @param {SnookrBallSet} playableBalls
     * @returns {boolean}
     */
    static isSnooker(unpottedBalls, playableBalls) {
        const cueBall = unpottedBalls.only('white').first();
        return playableBalls.reduce(function (isSnooker, objectBall) {
            if (!isSnooker) {
                return false;
            }

            const hidingBalls = unpottedBalls.not(cueBall).not(objectBall);
            const partiallyTouchable = hidingBalls.reduce(function (touchable, hidingBall) {
                return touchable && !objectBall.isHiddenBehind(cueBall, hidingBall);
            }, true);

            return isSnooker && !partiallyTouchable;
        }, true);
    }
}

