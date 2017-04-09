class SnookrBall {
    /**
     *
     * @param ballRadius
     * @param {string} ballType
     * @param {Point} position
     * @returns {SnookrBall}
     */
    constructor(ballRadius, ballType, position) {
        this.ballRadius = ballRadius;
        this.ballType = ballType;
        this.position = position;
        this.initialPosition = position;
        this.speed = Vector.create();
        this.forwardSpin = Vector.create();
        this.sideSpin = 0;
        this.potted = false;
    }

    /**
     *
     * @param ballRadius
     * @param {string} ballType
     * @param {Point} position
     * @returns {SnookrBall}
     */
    static create(ballRadius, ballType, position) {
        return new SnookrBall(ballRadius, ballType, position);
    }

    /**
     *
     * @returns {boolean}
     */
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
        this.setSpeed(Vector.create());
        this.setForwardSpin(Vector.create());
        this.setSideSpin(0);
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getBallRadius() {
        return this.ballRadius;
    }

    /**
     *
     * @returns {string}
     */
    getBallType() {
        return this.ballType;
    }

    /**
     *
     * @param {Point} position
     * @returns {SnookrBall}
     */
    setPosition(position) {
        this.position = Point.create(position.getX(), position.getY());
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
        this.position = new Point(this.position.getX() + rnd(), this.position.getY() + rnd());
        return this;
    }

    /**
     *
     * @param {Vector} speed
     * @returns {SnookrBall}
     */
    setSpeed(speed) {
        this.speed.setX(speed.getX());
        this.speed.setY(speed.getY());
        return this;
    }

    /**
     *
     * @returns {Vector}
     */
    getSpeed() {
        return this.speed;
    }

    /**
     *
     * @param {Vector} forwardSpin
     * @returns {SnookrBall}
     */
    setForwardSpin(forwardSpin) {
        this.forwardSpin.setX(forwardSpin.getX());
        this.forwardSpin.setY(forwardSpin.getY());
        return this;
    }

    /**
     *
     * @returns {Vector}
     */
    getForwardSpin() {
        return this.forwardSpin;
    }

    /**
     *
     * @param sideSpin
     * @returns {SnookrBall}
     */
    setSideSpin(sideSpin) {
        this.sideSpin = sideSpin;
        return this;
    }

    /**
     *
     * @returns {number}
     */
    getSideSpin() {
        return this.sideSpin;
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

        const SB = Point.create(sx, sy).createVectorTo(hidingBall.getPosition());
        const SO = Point.create(sx, sy).createVectorTo(this.getPosition());

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

        const SB = Point.create(sx, sy).createVectorTo(hidingBall.getPosition());
        const SO = Point.create(sx, sy).createVectorTo(this.getPosition());

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
     * @param {number} tMax
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

        let data = null;

        const getCollisionSpeed = function (ball) {
            if (data === null) {
                data = {};
                data.dtx = dx + t * dvx;
                data.dty = dy + t * dvy;
                data.sin2 = data.dty ** 2;
                data.cos2 = data.dtx ** 2;
                data.d2 = data.sin2 + data.cos2;
                data.sincos = data.dtx * data.dty;
                data.mx = (v2x - v1x) * data.sincos;
                data.my = (v2y - v1y) * data.sincos;
                data.ball1Speed = Vector.create(
                    (v2x * data.cos2 + v1x * data.sin2 + data.my) / data.d2,
                    (v2y * data.sin2 + v1y * data.cos2 + data.mx) / data.d2
                );
                data.ball2Speed = Vector.create(
                    (v1x * data.cos2 + v2x * data.sin2 - data.my) / data.d2,
                    (v1y * data.sin2 + v2y * data.cos2 - data.mx) / data.d2
                );
                data.collisionPower = data.ball1Speed.clone().subtract(speed1).getLength() + data.ball2Speed.clone().subtract(speed2).getLength();
            }

            if (ball === ball1) {
                return data.ball1Speed;
            } else if (ball === ball2) {
                return data.ball2Speed;
            }
        };

        const getCollisionPower = function () {
            if (data === null) {
                getCollisionSpeed(ball1);
            }
            return data.collisionPower;
        };

        const getCollisionTime = () => t;

        return {
            getCollisionTime,
            getCollisionPower,
            getCollisionSpeed,
            // getCollisionSpeed(ball) {
            //     Version 2 - slow, but more descriptive
            //
            //     const alpha = position1.translate(speed1, t).vectorTo(position2.translate(speed2, t)).getAngle();
            //     const v1rotated = speed1.clone().rotate(-alpha);
            //     const v2rotated = speed2.clone().rotate(-alpha);
            //     const v1prim = Vector.create(v2rotated.getX(), v1rotated.getY());
            //     const v2prim = Vector.create(v1rotated.getX(), v2rotated.getY());
            //     const v1 = v1prim.clone().rotate(alpha);
            //     const v2 = v2prim.clone().rotate(alpha);
            //     return ball === ball1 ? v1 : (ball === ball2 ? v2 : null);
            // }
        };
    }

    /**
     *
     * @param {SnookrBall} ball2
     * @param {number} tMax
     * @return {{getCollisionTime, getCollisionSpeed}|null}
     */
    calculateStaticBallCollision(ball2, tMax) {
        const ball1 = this;
        const speed1 = ball1.getSpeed();
        const position1 = ball1.getPosition();
        const position2 = ball2.getPosition();

        const dx = position2.getX() - position1.getX();
        const dy = position2.getY() - position1.getY();
        const v1x = speed1.getX();
        const v1y = speed1.getY();

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
        const aDoubled = 2 * (v1x * v1x + v1y * v1y);
        const b = 2 * (-dx * v1x - dy * v1y);
        const c = dx * dx + dy * dy - rSum * rSum;
        const delta = b * b - 2 * aDoubled * c;
        const sqrtDelta = delta <= 0 ? -1 : Math.sqrt(delta);

        let t = aDoubled ? ((-b - sqrtDelta) / aDoubled) : -1;
        t = (sqrtDelta > 0 && aDoubled && t > 0 && t < tMax) ? t : null;

        if (!t) {
            return null;
        }

        let data = null;

        const getCollisionSpeed = function () {
            if (data === null) {
                data = {};
                data.dtx = dx - t * v1x;
                data.dty = dy - t * v1y;
                data.sin2 = data.dty ** 2;
                data.cos2 = data.dtx ** 2;
                data.d2 = data.sin2 + data.cos2;
                data.sincos = data.dtx * data.dty;
                data.mx = -v1x * data.sincos;
                data.my = -v1y * data.sincos;
                data.ballSpeed = Vector.create(
                    (v1x * data.sin2 + data.my) / data.d2,
                    (v1y * data.cos2 + data.mx) / data.d2
                );
                data.collisionPower = data.ball1Speed.subtract(speed1).getLength();
            }

            return data.ballSpeed;
        };

        const getCollisionPower = function () {
            if (data === null) {
                getCollisionSpeed(ball1);
            }
            return data.collisionPower;
        };

        const getCollisionTime = () => t;

        return {
            getCollisionTime,
            getCollisionPower,
            getCollisionSpeed,
        };
    }

    /**
     *
     * @param {LineSegment} l
     * @param {number} tMax
     * @returns {{getCollisionTime, getSpeed}|null}
     */
    calculateLineSegmentCollision(l, tMax) {
        const p1 = l.getP1();
        const p2 = l.getP2();
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
        const p1x = p1.getX() * cos - p1.getY() * sin;
        const p2x = p2.getX() * cos - p2.getY() * sin;
        const p1y = p1.getX() * sin + p1.getY() * cos;

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
        //
        const xt = x0 + vx * t;
        if (xt <= Math.min(p1x, p2x) || xt >= Math.max(p1x, p2x)) {
            return null;
        }

        const getCollisionTime = () => t;

        const getCollisionSpeed = function () {
            if (collisionSpeed === null) {
                vx -= sideSpin * speed.getLength();
                collisionSpeed = Vector.create(vx * cos - vy * sin, -vy * cos - vx * sin);
                // [vx, vy] = [vx - sideSpin * speed.getLength(), -vy];
                // [vx, vy] = [vx * cos + vy * sin, vy * cos - vx * sin];
                // collisionSpeed = Vector.create(vx, vy);
            }

            return collisionSpeed;
        };

        const sideSpin = this.getSideSpin();
        let collisionSpeed = null;
        return {
            getCollisionTime,
            getCollisionSpeed
        };
    }

    /**
     *
     * @param {SnookrBall} arcBall
     * @param {number} tMax
     */
    calculateLineArcCollision(arcBall, tMax) {
        const ballCollision = this.calculateStaticBallCollision(arcBall, tMax);

        if (!ballCollision) {
            return null;
        }

        const ballPositionOnCollision = this.getPosition().translate(this.getSpeed().clone().scale(0.999 * ballCollision.getCollisionTime()));
        const centerVector = ballPositionOnCollision.createVectorTo(arcBall.getPosition());
        const centerVectorScaled = centerVector.clone().normalize(1.001 * this.getBallRadius());
        const touchPoint = ballPositionOnCollision.translate(centerVectorScaled);
        const p1 = touchPoint.translate(centerVector.clone().rotate(Math.PI / 2));
        const p2 = touchPoint.translate(centerVector.clone().rotate(-Math.PI / 2));
        return this.calculateLineSegmentCollision(new LineSegment(p1, p2), tMax);
    }

}
