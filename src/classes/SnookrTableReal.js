class SnookrTableReal extends SnookrTable {
    constructor() {
        super();
    }

    createPots() {
        const potRadius = 1.555;
        return [
            {center: Point.create(4 + 33.867 + 35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + -35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567, 4 + -0.71), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567, 4 + -0.71), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567, 4 + 136.65), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567, 4 + 136.65), radius: potRadius},
        ];
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {number} tMax
     */
    calculateBoundaryTouch(ball, tMax) {
        const x = ball.getPosition().getX() + ball.getSpeed().getX() * tMax;
        const y = ball.getPosition().getY() + ball.getSpeed().getY() * tMax;
        const border =  4;
        const r = ball.getBallRadius();

        if (x - r > border && x + r < this.outerWidth - border && y - r > border && y + r < this.outerLength - border) {
            return null;
        }

        return super.calculateBoundaryTouch(ball, tMax);
    }
}
