class LineSegment {
    /**
     *
     * @param {Point} source
     * @param {Point|Vector} destination
     */
    constructor(source, destination) {
        this.p1 = source;
        this.p2 = destination instanceof Point ? destination : source.translate(destination);
        this.w = destination instanceof Point ? source.vectorTo(destination) : destination;
    }

    getP1() {
        return this.p1;
    }

    getP2() {
        return this.p2;
    }

    getVector() {
        return this.w;
    }
}
