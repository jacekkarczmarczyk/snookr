class SnookrTablePot {
    /**
     *
     * @param {number} x
     * @param {number} y
     * @param {number} r
     */
    constructor(x, y, r) {
        this._x = x;
        this._y = y;
        this._r = r;
    }

    /**
     *
     * @returns {Point}
     */
    getCenter() {
        return new Point(this._x, this._y);
    }

    /**
     *
     * @returns {number}
     */
    getRadius() {
        return this._r;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {number} tMax
     */
    calculatePot(ball, tMax) {
        const px = this._x;
        const py = this._y
        const pr = this._r;
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

}