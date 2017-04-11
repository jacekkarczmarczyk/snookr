class SnookrTable {
    constructor() {
        this.initDimensions();
        this.boundaryElements = this.createBoundaryElements();
        this.boundaryArcBalls = this.boundaryElements.map(function (arc) {
            if (arc instanceof LineArc) {
                return new SnookrBall(arc.getRadius(), 'cushion', arc.getCenter());
            } else {
                return null;
            }
        });

        this.pots = this.createPots();
    }

    initDimensions() {
        this.outerWidth = 75.733;
        this.outerLength = 143.962;
    }

    /**
     *
     * @returns {Array}
     */
    createPots() {
        const potRadius = 2;
        return [
            {center: Point.create(4 + 33.867 + 35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + -35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567 - 1, 4 + -0.71 + 1), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567 + 1, 4 + -0.71 + 1), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567 - 1, 4 + 136.65 - 1), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567 + 1, 4 + 136.65 - 1), radius: potRadius},
        ];
    }

    /**
     *
     * @returns {Array}
     */
    createBoundaryPoints() {
        const cornerD = 2.5;
        const middleD = 1;
        return [
            /* 22 */ [Point.create(4 + 33.867 + -37.867, 4 + 66.43), 0],
            /* 23 */ [Point.create(4 + 33.867 + -35.6, 4 + 66.43), 0],
            /* 24 */ [Point.create(4 + 33.867 + -33.867, 4 + 64.867), middleD],
            /* 25 */ [Point.create(4 + 33.867 + -33.867, 4 + 3), cornerD],
            /* 26 */ [Point.create(4 + 33.867 + -35.867, 4 + 0), 0],
            /* 27 */ [Point.create(4 + 33.867 + -33.867, 4 + -2), 0],
            /* 28 */ [Point.create(4 + 33.867 + -30.867, 4 + 0), cornerD],
            /* 01 */ [Point.create(4 + 33.867 + 30.867, 4 + 0), cornerD],
            /* 02 */ [Point.create(4 + 33.867 + 33.867, 4 + -2), 0],
            /* 03 */ [Point.create(4 + 33.867 + 35.867, 4 + 0), 0],
            /* 04 */ [Point.create(4 + 33.867 + 33.867, 4 + 3), cornerD],
            /* 05 */ [Point.create(4 + 33.867 + 33.867, 4 + 64.867), middleD],
            /* 06 */ [Point.create(4 + 33.867 + 35.6, 4 + 66.43), 0],
            /* 07 */ [Point.create(4 + 33.867 + 37.867, 4 + 66.43), 0],
            /* 08 */ [Point.create(4 + 33.867 + 37.867, 4 + 69.53), 0],
            /* 09 */ [Point.create(4 + 33.867 + 35.6, 4 + 69.53), 0],
            /* 10 */ [Point.create(4 + 33.867 + 33.867, 4 + 71.1), middleD],
            /* 11 */ [Point.create(4 + 33.867 + 33.867, 4 + 132.967), cornerD],
            /* 12 */ [Point.create(4 + 33.867 + 35.93, 4 + 135.937), 0],
            /* 13 */ [Point.create(4 + 33.867 + 33.85, 4 + 138.05), 0],
            /* 14 */ [Point.create(4 + 33.867 + 30.867, 4 + 135.937), cornerD],
            /* 15 */ [Point.create(4 + 33.867 + -30.867, 4 + 135.937), cornerD],
            /* 16 */ [Point.create(4 + 33.867 + -33.85, 4 + 138.05), 0],
            /* 17 */ [Point.create(4 + 33.867 + -35.93, 4 + 135.937), 0],
            /* 18 */ [Point.create(4 + 33.867 + -33.867, 4 + 132.967), cornerD],
            /* 19 */ [Point.create(4 + 33.867 + -33.867, 4 + 71.1), middleD],
            /* 20 */ [Point.create(4 + 33.867 + -35.6, 4 + 69.53), 0],
            /* 21 */ [Point.create(4 + 33.867 + -37.867, 4 + 69.53), 0],
        ];
    }

    /**
     *
     * @returns {Array}
     */
    createBoundaryElements() {
        const boundaryElements = [];
        const points = this.createBoundaryPoints();

        for (let i = 0; i < points.length; i++) {
            const startOffset = points[i][1];
            const endOffset = points[(i + 1) % points.length][1];
            const p1 = points[(i + points.length - 1) % points.length][0];
            const p2 = points[i][0];
            const p3 = points[(i + 1) % points.length][0];
            const d = points[i][1];

            if (startOffset) {
                boundaryElements.push(SnookrTable.createLineArc(p1, p2, p3, d));
            }

            boundaryElements.push(SnookrTable.createLineSegment(p2, p3, startOffset, endOffset));
        }

        return boundaryElements;
    }

    getOuterWidth() {
        return this.outerWidth;
    }

    getOuterLength() {
        return this.outerLength;
    }

    getBoundaryElements() {
        return this.boundaryElements;
    }

    getPots() {
        return this.pots;
    }

    /**
     *
     * @param pot
     * @param {SnookrBall} ball
     * @param tMax
     */
    calculatePot(pot, ball, tMax) {
        const px = pot.center.getX();
        const py = pot.center.getY();
        const pr = pot.radius;
        const vx = ball.getSpeed().getX();
        const vy = ball.getSpeed().getY();
        const cx = ball.getPosition().getX();
        const cy = ball.getPosition().getY();

        // x = cx + vx * t
        // y = cy + vy * t
        // (x - px) ^ 2 + (y - py) ^ 2 = pr ^ 2

        // (cx + vx * t - px) ^ 2 + (cy + vy * t - py) ^ 2 = pr ^ 2

        const dx = cx - px;
        const dy = cy - py;

        // vx ^ 2 * t ^ 2 + 2 * dx * vx * t + dx ^ 2 + vy ^ 2 * t ^ 2 + 2 * dy ^ 2 * t + dy ^ 2 = pr ^ 2

        const a = vx * vx + vy * vy;
        const b = 2 * (dx * vx + dy * vy);
        const c = dx * dx + dy * dy - pr * pr;

        const delta = b * b - 4 * a * c;

        if (delta <= 0) {
            return null;
        }

        const t1 = (-b - Math.sqrt(delta)) / 2 / a;
        const t2 = (-b + Math.sqrt(delta)) / 2 / a;

        if (t1 >= 0 && t1 <= tMax) {
            return t1;
        }

        if (t2 >= 0 && t2 <= tMax) {
            return t2;
        }

        return null;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param tMax
     * @returns {{getCollisionTime, getCollisionSpeed} | null}
     */
    calculateBoundaryTouch(ball, tMax) {
        if (!ball.getSpeed().getX() && !ball.getSpeed().getY()) {
            return null;
        }

        let firstCollision = null;
        const boundaryArcBalls = this.boundaryArcBalls;

        this.getBoundaryElements().forEach(function (boundaryElement, index) {
            let collision;
            if (boundaryElement instanceof LineSegment) {
                collision = ball.calculateLineSegmentCollision(boundaryElement, tMax);
            } else if (boundaryElement instanceof LineArc) {
                collision = ball.calculateLineArcCollision(boundaryArcBalls[index], tMax);
            }

            if (collision && (firstCollision === null || collision.getCollisionTime() < firstCollision.getCollisionTime())) {
                firstCollision = collision;
            }
        });

        return firstCollision;
    }

    /**
     *
     * @param {Point} p1
     * @param {Point} p2
     * @param {number} startOffset
     * @param {number} endOffset
     * @returns {LineSegment}
     */
    static createLineSegment(p1, p2, startOffset = 0, endOffset = 0) {
        const w1 = p1.createVectorTo(p2).normalize(startOffset);
        const w2 = p2.createVectorTo(p1).normalize(endOffset);
        return new LineSegment(p1.translate(w1), p2.translate(w2));
    }

    /**
     *
     * @param {Point} p1
     * @param {Point} p2
     * @param {Point} p3
     * @param {number} d
     * @returns {LineArc}
     */
    static createLineArc(p1, p2, p3, d) {
        const w1 = p2.createVectorTo(p1);
        const w2 = p2.createVectorTo(p3);
        const alpha = w1.getAngle();

        // Translate: (-p2.x, -p2.y)
        // Rotate: -alpha
        //
        const beta = w2.getAngle() - alpha;
        const gamma = beta - Math.sign(w2.clone().rotate(-alpha).getY()) * Math.PI / 2;

        // Calculating center and radius of the circle
        //
        let x0 = d;
        let y0 = d * (1 + Math.sin(gamma)) / Math.cos(gamma);
        const r = Math.abs(y0);

        let angle1, angle2;
        if (y0 > 0) {
            angle1 = beta + Math.PI / 2;
            angle2 = 3 * Math.PI / 2;
        } else {
            angle2 = Math.PI / 2;
            angle1 = beta - Math.PI / 2;
        }

        // Restore coordinates
        // Rotate: alpha
        // Translate: (p2.x, p2.y)
        //
        angle1 = (angle1 + 2 * Math.PI) % (2 * Math.PI) + alpha;
        angle2 = (angle2 + 2 * Math.PI) % (2 * Math.PI) + alpha;

        const s = Vector.create(x0, y0).rotate(alpha);
        x0 = s.getX() + p2.getX();
        y0 = s.getY() + p2.getY();

        return new LineArc(Point.create(x0, y0), r, angle1, angle2);
    }

    /**
     *
     * @param {Point} position
     * @returns {boolean}
     */
    isInCueBallArea(position) {
        return position.getY() >= this.getDCenter().getY() && (position.getDistance(this.getDCenter())) <= this.getDRadius();
    }

    getDCenter() {
        return Point.create(4 + 33.867, 4 + 107.886);
    }

    getDRadius() {
        return 11;
    }
}
