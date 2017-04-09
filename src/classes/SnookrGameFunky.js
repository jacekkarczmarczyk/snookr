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
            maxShotPower: 4
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
            new SnookrBall(radius, 'white', new Point(4 + 33.867 + 11.124 / 2, 4 + 107.886)),

            new SnookrBall(radius, 'yellow', new Point(33.867 + 11.124, 107.886)),
            new SnookrBall(radius, 'green', new Point(33.867 - 11.124, 107.886)),
            new SnookrBall(radius, 'brown', new Point(33.867, 107.886)),
            new SnookrBall(radius, 'blue', new Point(33.867, 67.981)),
            new SnookrBall(radius, 'pink', new Point(33.867, 33.990)),
            new SnookrBall(radius, 'black', new Point(33.867, 12.343)),

            new SnookrBall(radius, 'red', new Point(33.867, 33.990 - 2 * maxRnd - 2 * radius)),

            new SnookrBall(radius, 'red', new Point(33.867 - stepX, 33.990 - 2 * maxRnd - 2 * radius - stepY)),
            new SnookrBall(radius, 'red', new Point(33.867 + stepX, 33.990 - 2 * maxRnd - 2 * radius - stepY)),

            new SnookrBall(radius, 'red', new Point(33.867 - 2 * stepX, 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(33.867, 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(33.867 + 2 * stepX, 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),

            new SnookrBall(radius, 'red', new Point(33.867 - 3 * stepX, 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(33.867 - stepX, 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(33.867 + stepX, 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(33.867 + 3 * stepX, 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
        ]);

        ballSet.forEach(ball => ball.randomizePosition(this.getBallRandomness()));

        return ballSet;
    }

}
