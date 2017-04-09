class SnookrGameFunky extends SnookrGame {
    constructor() {
        super();
    }

	getPhysicsSettings() {
        return {
            slowdownBreaker: 200,
            forwardSpinLinearSlowdownRatio: 0.05,
            slowdownRatio: 0.987,
            sideSpinScale: 0.1,
            maxShotPower: 5
        };
	}
	
    /**
     *
     * @returns {SnookrTable}
     */
    createTable() {
        return new SnookrTableFunky();
    }

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
