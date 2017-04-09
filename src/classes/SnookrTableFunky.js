class SnookrTableFunky extends SnookrTable {
    constructor() {
        super();
    }

    initDimensions() {
        this.outerWidth = 76.0;
        this.outerLength = 140.2;
    }

    createPots() {
        const cornerR = 7.8;
        const cornerCenter = 4.2;
        const midR = 3.5;
        return [
            {center: Point.create(cornerCenter, cornerCenter), radius: cornerR},
            {center: Point.create(cornerCenter, this.outerLength - cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - cornerCenter - 0.8, cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - cornerCenter - 0.8, this.outerLength - cornerCenter), radius: cornerR},
            {center: Point.create(this.outerWidth - 4, this.outerLength / 2), radius: midR},
            {center: Point.create(3.9, this.outerLength / 2), radius: midR},
        ];
    }

    /**
     *
     * @returns {Array}
     */
    createBoundaryPoints() {
        const l = 1400;
        const w = 766;

        const top = 93;
        const bottom = 86;
        const left = 87;
        const right = 85;

        return [
            [71, 0],
            [122, bottom, 50],

            [657, bottom, 45],
            [684, 0],
            [l - 684, 0],
            [l - 657, bottom, 45],

            [l - 122, bottom, 50],
            [l - 71, 0],
            [l - 0, 0],

            [l - 0, 71],
            [l - right, 122, 50],
            [l - right, w - 122, 50],
            [l - 0, w - 71],
            [l - 0, w - 0],

            [l - 71, w - 0],
            [l - 122, w - top, 50],

            [l - 657, w - top, 45],
            [l - 684, w - 0],
            [684, w - 0],
            [657, w - top, 45],

            [122, w - top, 50],
            [71, w - 0],
            [0, w - 0],

            [0, w - 71],
            [left, w - 122, 50],
            [left, 122, 50],
            [0, 71],
            [0, 0],
        ].reverse().map(array => [Point.create(array[1] / 10, array[0] / 10), (array[2] >>> 0) / 10]);
    }
}
