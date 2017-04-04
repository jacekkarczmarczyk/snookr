class SnookrBall {
    /**
     *
     * @param ballRadius
     * @param {string} ballType
     * @param {Point} position
     * @param {BallMovement|null} movement
     * @param potted
     */
    constructor(ballRadius, ballType, position, movement = null, potted = false) {
        this.ballRadius = ballRadius;
        this.ballType = ballType;
        this.position = position;
        this.initialPosition = position;
        this.movement = movement || new BallMovement();
        this.potted = potted;
    }

    /**
     *
     * @param ballRadius
     * @param {string} ballType
     * @param {Point} position
     * @param {BallMovement|null} movement
     * @param potted
     * @returns {SnookrBall}
     */
    static create(ballRadius, ballType, position, movement = null, potted = false) {
        return new SnookrBall(ballRadius, ballType, position, movement, potted);
    }

    isPotted() {
        return this.potted;
    }

    /**
     *
     * @param potted
     * @returns {SnookrBall}
     */
    setPotted(potted = true) {
        this.potted = potted;
        this.movement = new BallMovement();
        return this;
    }

    getBallRadius() {
        return this.ballRadius;
    }

    getBallType() {
        return this.ballType;
    }

    /**
     *
     * @param {Point} position
     * @returns {SnookrBall}
     */
    setPosition(position) {
        this.position = position;
        return this;
    }

    /**
     *
     * @returns {Point}
     */
    getPosition() {
        return this.position;
    }

    /**
     *
     * @returns {Point}
     */
    getInitialPosition() {
        return this.initialPosition;
    }

    /**
     *
     * @param randomness
     * @returns {SnookrBall}
     */
    randomizePosition(randomness) {
        const maxRnd = randomness * this.getBallRadius();
        const rnd = () => Math.random() * 2 * maxRnd - maxRnd;
        this.position = this.position.translate(Vector.create(rnd(), rnd()));
        return this;
    }

    /**
     *
     * @returns {BallMovement}
     */
    getMovement() {
        return this.movement;
    }

    /**
     *
     * @param {Vector} speed
     * @returns {SnookrBall}
     */
    setSpeed(speed) {
        this.movement = this.movement.setSpeed(speed);
        return this;
    }

    /**
     *
     * @returns {Vector}
     */
    getSpeed() {
        return this.movement.getSpeed();
    }

    /**
     *
     * @param {Vector} forwardSpin
     * @returns {SnookrBall}
     */
    setForwardSpin(forwardSpin) {
        this.movement = this.movement.setForwardSpin(forwardSpin);
        return this;
    }

    /**
     *
     * @param sideSpin
     * @returns {SnookrBall}
     */
    setSideSpin(sideSpin) {
        this.movement = this.movement.setSideSpin(sideSpin);
        return this;
    }

    getSideSpin() {
        return this.movement.getSideSpin();
    }

    /**
     *
     * @param {SnookrBall} cueBall
     * @param {SnookrBall} hidingBall
     */
    isPartiallyHiddenBehind(cueBall, hidingBall) {
        const cx = cueBall.getPosition().getX();
        const cy = cueBall.getPosition().getY();
        const cr = cueBall.getBallRadius();
        const or = this.getBallRadius();
        const bx = hidingBall.getPosition().getX();
        const by = hidingBall.getPosition().getY();
        const br = hidingBall.getBallRadius();

        // S - punkt przeciecia stycznych krzyzowych do cueBall i hidingBall
        const sx = cx + (bx - cx) * cr / (cr + br);
        const sy = cy + (by - cy) * cr / (cr + br);

        const SB = Point.create(sx, sy).vectorTo(hidingBall.getPosition());
        const SO = Point.create(sx, sy).vectorTo(this.getPosition());

        // beta - kat miedzy linia SO a styczna do hidingBall przechodzaca przez S
        const alpha = Math.asin(br / SB.getLength());
        const sbAngle = SB.getAngle();
        const sAngleRange = [sbAngle - alpha, sbAngle + alpha];

        // beta - kat miedzy linia SO a styczna do this przechodzaca przez S
        const beta = Math.asin(or / SO.getLength());
        const soAngle = SO.getAngle();
        const mAngleRange = [soAngle - beta, soAngle + beta];

        const between = (range1, range2) => (range1[0] >= range2[0] && range1[0] <= range2[1]) || (range1[1] >= range2[0] && range1[1] <= range2[1]);
        const add = (range, angle) => [range[0] + angle, range[1] + angle];
        return between(mAngleRange, sAngleRange)
            || between(add(mAngleRange, Math.PI * 2), sAngleRange)
            || between(add(mAngleRange, -Math.PI * 2), sAngleRange);
    }

    /**
     *
     * @param {SnookrBall} cueBall
     * @param {SnookrBall} hidingBall
     */
    isHiddenBehind(cueBall, hidingBall) {
        const cx = cueBall.getPosition().getX();
        const cy = cueBall.getPosition().getY();
        const cr = cueBall.getBallRadius();
        const or = this.getBallRadius();
        const bx = hidingBall.getPosition().getX();
        const by = hidingBall.getPosition().getY();
        const br = hidingBall.getBallRadius();

        // S - punkt przeciecia stycznych krzyzowych do cueBall i hidingBall
        const sx = cx + (bx - cx) * cr / (cr + br);
        const sy = cy + (by - cy) * cr / (cr + br);

        const SB = Point.create(sx, sy).vectorTo(hidingBall.getPosition());
        const SO = Point.create(sx, sy).vectorTo(this.getPosition());

        // beta - kat miedzy linia SO a styczna do hidingBall przechodzaca przez S
        const alpha = Math.asin(br / SB.getLength());
        const sbAngle = SB.getAngle();
        const sAngleRange = [sbAngle - alpha, sbAngle + alpha];

        // beta - kat miedzy linia SO a styczna do this przechodzaca przez S
        const beta = Math.asin(or / SO.getLength());
        const soAngle = SO.getAngle();
        const mAngleRange = [soAngle - beta, soAngle + beta];

        const between = (range1, range2) => range1[0] >= range2[0] && range1[0] <= range2[1] && range1[1] >= range2[0] && range1[1] <= range2[1];
        const add = (range, angle) => [range[0] + angle, range[1] + angle];
        return between(mAngleRange, sAngleRange)
            || between(add(mAngleRange, Math.PI * 2), sAngleRange)
            || between(add(mAngleRange, -Math.PI * 2), sAngleRange);
    }

    /**
     *
     * @param {SnookrBall} ball2
     * @param tMax
     * @return {{getCollisionTime, getCollisionSpeed}|null}
     */
    calculateBallCollision(ball2, tMax) {
        const ball1 = this;
        const speed1 = ball1.getSpeed();
        const speed2 = ball2.getSpeed();
        const position1 = ball1.getPosition();
        const position2 = ball2.getPosition();

        const dx = position2.getX() - position1.getX();
        const dy = position2.getY() - position1.getY();
        const v1x = speed1.getX();
        const v1y = speed1.getY();
        const v2x = speed2.getX();
        const v2y = speed2.getY();
        const dvx = v2x - v1x;
        const dvy = v2y - v1y;

        // Wersja 1
        //
        // ((x1 + vX1 * t) - (x2 + vX2 * t)) ^ 2 + ((y1 + vY1 * t) - (y2 + vY2 * t)) ^ 2 = (r1 + r2) ^ 2
        // (dX + dvX * t) ^ 2 + (dY + dvY * t) ^ 2 = (r1 + r2) ^ 2;
        // dX^2 + 2 * dX*dvX * t + dvX^2 * t^2 + dY^2 + 2 * dY*dvY * t + dvY^2 * t^2 = rSumSquared;
        // dX^2 + 2 * dX*dvX * t + dY^2 + 2 * dY*dvY * t + = rSumSquared;
        // (dvX^2 + dvY^2) * t^2 + 2*(dX*dvX+dY*dvY) * t + (dX^2+dY^2)-rSumSquared = 0;
        // a * t^2 + b * t + c  = 0
        // delta = b^2 - 4*a*c
        // t1 = (-b - sqrt(delta)) / 2 a
        // t2 = (-b + sqrt(delta)) / 2 a
        //
        const rSum = ball1.getBallRadius() + ball2.getBallRadius();
        const aDoubled = 2 * (dvx * dvx + dvy * dvy);
        const b = 2 * (dx * dvx + dy * dvy);
        const c = dx * dx + dy * dy - rSum * rSum;
        const delta = b * b - 2 * aDoubled * c;
        const sqrtDelta = delta <= 0 ? -1 : Math.sqrt(delta);

        let t = aDoubled ? ((-b - sqrtDelta) / aDoubled) : -1;
        t = (sqrtDelta > 0 && aDoubled && t > 0 && t < tMax) ? t : null;

        // Wersja 2
        //
        //
        // const x0 = position2.getX() - position1.getX();
        // const y0 = position2.getY() - position1.getY();
        // const vx0 = speed2.getX() - speed1.getX();
        // const vy0 = speed2.getY() - speed1.getY();
        // const v_2 = vx0 ** 2 + vy0 ** 2;
        //
        // const x_v = (x0 * vx0 + y0 * vy0) / v_2;
        // const y_2 = (x0 * vy0 - y0 * vx0) ** 2 / v_2;
        // const r_2 = (ball1.getBallRadius() + ball2.getBallRadius()) ** 2;
        //
        // if (y_2 >= r_2) {
        //     return null;
        // }
        //
        // const sx_v = Math.sqrt((r_2 - y_2) / v_2);
        // let t = sx_v + x_v;
        // t = (t < 0 || t >= tMax) ? null : t;

        if (!t) {
            return null;
        }

        return {
            getCollisionTime: () => t,
            getCollisionSpeed(ball) {
                const dtx = dx + t * dvx;
                const dty = dy + t * dvy;
                const d2 = dtx ** 2 + dty ** 2;
                const sin2 = dty ** 2;
                const cos2 = dtx ** 2;
                const sincos = dtx * dty;
                const mx = (v2x - v1x) * sincos;
                const my = (v2y - v1y) * sincos;

                if (ball === ball1) {
                    return Vector.create((v2x * cos2 + v1x * sin2 + my) / d2, (v2y * sin2 + v1y * cos2 + mx) / d2)
                } else if (ball === ball2) {
                    return Vector.create((v1x * cos2 + v2x * sin2 - my) / d2, (v1y * sin2 + v2y * cos2 - mx) / d2);
                }
            },
            // getCollisionSpeed(ball) {
            //     Wersja 1 - najwolniejsza, ale opisjaca o co chodzi
            //
            //     const alpha = position1.translate(speed1, t).vectorTo(position2.translate(speed2, t)).getAngle();
            //     const v1rotated = speed1.rotate(-alpha);
            //     const v2rotated = speed2.rotate(-alpha);
            //     const v1prim = Vector.create(v2rotated.getX(), v1rotated.getY());
            //     const v2prim = Vector.create(v1rotated.getX(), v2rotated.getY());
            //     const v1 = v1prim.rotate(alpha);
            //     const v2 = v2prim.rotate(alpha);
            //     return ball === ball1 ? v1 : (ball === ball2 ? v2 : null);
            // }
        };
    }

    /**
     *
     * @param {LineSegment} l
     * @param {number} tMax
     * @returns {{getCollisionTime, getSpeed}|null}
     */
    calculateLineSegmentCollision(l, tMax) {
        const p = l.getP1();
        const W = l.getVector();
        // Obracamy wektor W ta aby byl ronolegly do osi X
        // Obracamy predkosc bili o ten sam kat
        // Liczymy skladowa y wektora predkosci
        // Pozycja Y + skladowa Y predkosci musi byc rowna pozycji y obrocenego punktu p o ten sam kat
        //
        const speed = this.getSpeed();
        const sin = -W.getSin();
        const cos = W.getCos();

        // Predkosc pozioma bili w obroconym ukladzie odniesienia
        //
        let vy = speed.getX() * sin + speed.getY() * cos;
        if (!vy) {
            return null;
        }

        // Pozycja bili w normalnym ukladzie odniesienia
        //
        const x = this.getPosition().getX();
        const y = this.getPosition().getY();

        // Pozycje koncow odcinka w obroconym ukladzie odniesienia
        //
        const p1x = p.getX() * cos - p.getY() * sin;
        const p2x = (p.getX() + W.getX()) * cos - (p.getY() + W.getY()) * sin;
        const p1y = p.getX() * sin + p.getY() * cos;

        // Pozycja bili w obroconym ukladzie odniesienia
        //
        const x0 = x * cos - y * sin;
        const y0 = x * sin + y * cos;

        // Moment styku bili z odcinkiem lub jego przedluzeniem
        //
        const t = (p1y - y0 - Math.sign(p1y - y0) * this.getBallRadius()) / vy;
        if (t < 0 || t >= tMax) {
            return null;
        }

        // Predkosc pozioma bili w obroconym ukladzie odniesienia
        //
        let vx = speed.getX() * cos - speed.getY() * sin;

        // Pozycja x styku bili z odcinkiem lub jego przeduzeniem
        const xt = x0 + vx * t;
        if (xt <= Math.min(p1x, p2x) || xt >= Math.max(p1x, p2x)) {
            return null;
        }

        const sideSpin = this.getSideSpin();
        return {
            getCollisionTime() {
                return t;
            },
            getCollisionSpeed() {
                [vx, vy] = [vx - sideSpin * speed.getLength() / 5, -vy];
                [vx, vy] = [vx * cos + vy * sin, vy * cos - vx * sin];
                return Vector.create(vx, vy);
            }
        };
    }

    /**
     *
     * @param {LineArc} arc
     * @param {number} tMax
     */
    calculateLineArcCollision(arc, tMax) {
        const ball = new SnookrBall(arc.getRadius(), 'cushion', arc.getCenter());
        const p = ball.getPosition();
        const ballCollision = this.calculateBallCollision(ball, tMax);

        if (!ballCollision) {
            return null;
        }

        const ballPositionOnCollision = this.getPosition().translate(this.getSpeed().scale(0.999 * ballCollision.getCollisionTime()));
        const centerVector = ballPositionOnCollision.vectorTo(arc.getCenter());
        const touchPoint = ballPositionOnCollision.translate(centerVector.normalize().scale(1.001 * this.getBallRadius()));
        const p1 = touchPoint.translate(centerVector.rotate(Math.PI / 2));
        const p2 = touchPoint.translate(centerVector.rotate(-Math.PI / 2));
        const lineCollision = this.calculateLineSegmentCollision(new LineSegment(p1, p2), tMax);

        return lineCollision;
    }

}
