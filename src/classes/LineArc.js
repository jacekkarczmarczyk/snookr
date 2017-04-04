/**
 * Immutable data object
 */
class LineArc {
    /**
     *
     * @param {Point} center
     * @param {number} radius
     * @param {number} alpha1
     * @param {number} alpha2
     */
    constructor(center, radius, alpha1, alpha2) {
        this.center = center;
        this.radius = radius;
        this.alpha1 = alpha1;
        this.alpha2 = alpha2;
    }

    /**
     *
     * @returns {Point}
     */
    getCenter() {
        return this.center;
    }

    /**
     *
     * @returns {number}
     */
    getRadius() {
        return this.radius;
    }

    /**
     *
     * @returns {number}
     */
    getAlpha1() {
        return this.alpha1;
    }

    /**
     *
     * @returns {number}
     */
    getAlpha2() {
        return this.alpha2;
    }
}
