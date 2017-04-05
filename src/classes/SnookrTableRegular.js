class SnookrTableRegular extends SnookrTable {
    constructor() {
        super();
    }

    createPots() {
        const potRadius = 1.9;
        return [
            {center: Point.create(33.867 + 35.567, 67.981), radius: potRadius},
            {center: Point.create(33.867 + -35.567, 67.981), radius: potRadius},
            {center: Point.create(33.867 + 34.567 - 0.8, -0.71 + 0.8), radius: potRadius},
            {center: Point.create(33.867 + -34.567 + 0.8, -0.71 + 0.8), radius: potRadius},
            {center: Point.create(33.867 + 34.567 - 0.8, 136.65 - 0.8), radius: potRadius},
            {center: Point.create(33.867 + -34.567 + 0.8, 136.65 - 0.8), radius: potRadius},
        ];
    }

}
