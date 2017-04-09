class SnookrTableFunky extends SnookrTable {
    constructor() {
        super();
    }

    initDimensions() {
        this.outerWidth = 76.6;
        this.outerLength = 140.0;
    }

    createPots() {
        const cornerR = 7.6;
        const cornerCenter = 4.2;
        const midCenter = 3.4;
        const midR = 3.6;
        return [
            {center: Point.create(cornerCenter, cornerCenter), radius: cornerR},
            {center: Point.create(cornerCenter, this.outerLength - cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - cornerCenter, cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - cornerCenter, this.outerLength - cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - midCenter, this.outerLength / 2), radius: midR},
            {center: Point.create(midCenter, this.outerLength / 2), radius: midR},
        ];
    }

    /**
     *
     * @returns {Array}
     */
    createBoundaryPoints() {
        const l = 1400;
        const w = 766;
        return [
            [71, 0],
            [122, 88, 50],

            [657, 88, 40],
            [684, 0],
            [l - 684, 0],
            [l - 657, 88, 40],

            [l - 122, 88, 50],
            [l - 71, 0],
            [l - 0, 0],

            [l - 0, 71],
            [l - 88, 122, 50],
            [l - 88, w - 122, 50],
            [l - 0, w - 71],
            [l - 0, w - 0],

            [l - 71, w - 0],
            [l - 122, w - 88, 50],

            [l - 657, w - 88, 40],
            [l - 684, w - 0],
            [684, w - 0],
            [657, w - 88, 40],

            [122, w - 88, 50],
            [71, w - 0],
            [0, w - 0],

            [0, w - 71],
            [88, w - 122, 50],
            [88, 122, 50],
            [0, 71],
            [0, 0],
        ].reverse().map(array => [Point.create(array[1] / 10, array[0] / 10), (array[2] >>> 0) / 10]);
    }
}
