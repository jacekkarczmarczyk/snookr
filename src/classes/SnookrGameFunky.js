class SnookrGameFunky extends SnookrGame {
    constructor() {
        super();
    }

    /**
     *
     * @returns {number}
     */
    getTableWidth() {
        return 76.0;
    }

    /**
     *
     * @returns {number}
     */
    getTableLength() {
        return 140.2;
    }

    /**
     *
     * @returns {SnookrTablePots}
     */
    createTablePots() {
        const cornerR = 7.8;
        const cornerCenter = 4.2;
        const midR = 3.5;
        return new SnookrTablePots([
            new SnookrTablePot(cornerCenter, cornerCenter, cornerR),
            new SnookrTablePot(cornerCenter, this.getTableLength() - cornerCenter, cornerR),
            new SnookrTablePot(this.getTableWidth() - cornerCenter - 0.8, cornerCenter, cornerR),
            new SnookrTablePot(this.getTableWidth() - cornerCenter - 0.8, this.getTableLength() - cornerCenter, cornerR),
            new SnookrTablePot(this.getTableWidth() - 4, this.getTableLength() / 2, midR),
            new SnookrTablePot(3.9, this.getTableLength() / 2, midR),
        ]);
    }

    /**
     *
     * @returns {SnookrTableBoundary}
     */
    createTableBoundary() {
        const l = this.getTableLength() * 10;
        const w = this.getTableWidth() * 10;

        const top = 87;
        const bottom = 86;
        const left = 87;
        const right = 86;

        const boundaryPoints = [
            [71, 0],
            [122, bottom, 50],

            [657, bottom, 45],
            [684, 0],
            [l - 684, 0],
            [l - 657, bottom, 45],

            [l - 122, bottom, 50],
            [l - 71, 0],
            [l - 0, 0],

            [l - 0, 71],
            [l - right, 122, 50],
            [l - right, w - 122, 50],
            [l - 0, w - 71],
            [l - 0, w - 0],

            [l - 71, w - 0],
            [l - 122, w - top, 50],

            [l - 657, w - top, 45],
            [l - 684, w - 0],
            [684, w - 0],
            [657, w - top, 45],

            [122, w - top, 50],
            [71, w - 0],
            [0, w - 0],

            [0, w - 71],
            [left, w - 122, 50],
            [left, 122, 50],
            [0, 71],
            [0, 0],
        ].reverse().map(array => new SnookrTableBoundaryPoint(array[1] / 10, array[0] / 10, (array[2] >>> 0) / 10));

        return new SnookrTableBoundary(boundaryPoints);
    }

	getPhysicsSettings() {
        return {
            slowdownBreaker: 200,
            forwardSpinLinearSlowdownRatio: 0.05,
            slowdownRatio: 0.987,
            sideSpinScale: 0.1,
            maxShotPower: 5,
            forwardSpinScale: 0.2
        };
	}

    /**
     *
     * @returns {number}
     */
    getBallRandomness() {
        return 0.003;
    }

    /**
     *
     * @returns {Point}
     */
    getDCenter() {
        return Point.create(38.4, 108.8);
    }

    /**
     *
     * @returns {number}
     */
    getDRadius() {
        return 11.1;
    }

    /**
     *
     * @returns {number}
     */
    getBallRadius() {
        return 2;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    createBallSet() {
        const radius = this.getBallRadius();
        const maxRnd = this.getBallRandomness() * radius;
        const stepX = radius + maxRnd;
        const stepY = radius * Math.sqrt(3) + 2 * maxRnd;
        const ballSet = new SnookrBallSet([
            new SnookrBall(radius, 'white', new Point(44.0, 108.8)),

            new SnookrBall(radius, 'yellow', new Point(49.6, 108.8)),
            new SnookrBall(radius, 'green', new Point(27.2, 108.8)),
            new SnookrBall(radius, 'brown', new Point(38.4, 108.8)),
            new SnookrBall(radius, 'blue', new Point(38.4, 69.9)),
            new SnookrBall(radius, 'pink', new Point(38.4, 39.3)),
            new SnookrBall(radius, 'black', new Point(38.4, 17.5)),

            new SnookrBall(radius, 'red', new Point(38.4, 39.3 - 2 * maxRnd - 2 * radius)),

            new SnookrBall(radius, 'red', new Point(38.4 - stepX, 39.3 - 2 * maxRnd - 2 * radius - stepY)),
            new SnookrBall(radius, 'red', new Point(38.4 + stepX, 39.3 - 2 * maxRnd - 2 * radius - stepY)),

            new SnookrBall(radius, 'red', new Point(38.4 - 2 * stepX, 39.3 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(38.4, 39.3 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(38.4 + 2 * stepX, 39.3 - 2 * maxRnd - 2 * radius - 2 * stepY)),

            new SnookrBall(radius, 'red', new Point(38.4 - 3 * stepX, 39.3 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(38.4 - stepX, 39.3 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(38.4 + stepX, 39.3 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(38.4 + 3 * stepX, 39.3 - 2 * maxRnd - 2 * radius - 3 * stepY)),
        ]);

        ballSet.forEach(ball => ball.randomizePosition(this.getBallRandomness()));

        return ballSet;
    }
}
