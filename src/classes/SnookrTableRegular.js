class SnookrTableRegular extends SnookrTable {
    constructor() {
        super();
    }

    createPots() {
        const potRadius = 2.7;
        return [
            {center: Point.create(4 + 33.867 + 35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + -35.567, 4 + 67.981), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567, 4 + -0.71), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567, 4 + -0.71), radius: potRadius},
            {center: Point.create(4 + 33.867 + 34.567, 4 + 136.65), radius: potRadius},
            {center: Point.create(4 + 33.867 + -34.567, 4 + 136.65), radius: potRadius},
        ];
    }

}
