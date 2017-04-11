class SnookrGameRegular extends SnookrGame {
    constructor() {
        super();
    }

    /**
     *
     * @returns {SnookrTable}
     */
    createTable() {
        return new SnookrTableRegular();
    }

    getPhysicsSettings() {
        return {
            slowdownBreaker: 200,
            forwardSpinLinearSlowdownRatio: 0.05,
            slowdownRatio: 0.987,
            sideSpinScale: 0.1,
            maxShotPower: 8.3,
            forwardSpinScale: 0.15
        };
    }

    getBallRadius() {
        return 1.5;
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

            new SnookrBall(radius, 'yellow', new Point(4 + 33.867 + 11.124, 4 + 107.886)),
            new SnookrBall(radius, 'green', new Point(4 + 33.867 - 11.124, 4 + 107.886)),
            new SnookrBall(radius, 'brown', new Point(4 + 33.867, 4 + 107.886)),
            new SnookrBall(radius, 'blue', new Point(4 + 33.867, 4 + 67.981)),
            new SnookrBall(radius, 'pink', new Point(4 + 33.867, 4 + 33.990)),
            new SnookrBall(radius, 'black', new Point(4 + 33.867, 4 + 12.343)),

            new SnookrBall(radius, 'red', new Point(4 + 33.867, 4 + 33.990 - 2 * maxRnd - 2 * radius)),

            new SnookrBall(radius, 'red', new Point(4 + 33.867 - stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - stepY)),

            new SnookrBall(radius, 'red', new Point(4 + 33.867 - 2 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867, 4 + 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + 2 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 2 * stepY)),

            new SnookrBall(radius, 'red', new Point(4 + 33.867 - 3 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 - stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + 3 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 3 * stepY)),

            new SnookrBall(radius, 'red', new Point(4 + 33.867 - 4 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 4 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 - 2 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 4 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867, 4 + 33.990 - 2 * maxRnd - 2 * radius - 4 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + 2 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 4 * stepY)),
            new SnookrBall(radius, 'red', new Point(4 + 33.867 + 4 * stepX, 4 + 33.990 - 2 * maxRnd - 2 * radius - 4 * stepY)),
        ]);

        ballSet.forEach(ball => ball.randomizePosition(this.getBallRandomness()));

        return ballSet;
    }
}
