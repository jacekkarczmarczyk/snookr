class SnookrTableBoundary {
    /**
     *
     * @param {Array.<SnookrTableBoundaryPoint>} points
     */
    constructor(points) {
        this._boundaryElements = [];

        for (let i = 0; i < points.length; i++) {
            const startOffset = points[i].getD();
            const endOffset = points[(i + 1) % points.length].getD();
            const p1 = points[(i + points.length - 1) % points.length].getPoint();
            const p2 = points[i].getPoint();
            const p3 = points[(i + 1) % points.length].getPoint();
            const d = points[i].getD();

            if (startOffset) {
                this._boundaryElements.push(SnookrTableBoundary.createLineArc(p1, p2, p3, d));
            }

            this._boundaryElements.push(SnookrTableBoundary.createLineSegment(p2, p3, startOffset, endOffset));
        }

        this._boundaryArcBalls = this._boundaryElements.map(function (arc) {
            if (arc instanceof LineArc) {
                return new SnookrBall(arc.getRadius(), 'cushion', arc.getCenter());
            } else {
                return null;
            }
        });
    }

    /**
     *
     * @returns {Array}
     */
    getBoundaryElements() {
        return this._boundaryElements;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {number} tMax
     * @returns {{getCollisionTime, getCollisionSpeed} | null}
     */
    calculateBoundaryTouch(ball, tMax) {
        let firstCollision = null;
        const boundaryArcBalls = this._boundaryArcBalls;

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
}