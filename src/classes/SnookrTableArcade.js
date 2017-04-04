class SnookrTableArcade extends SnookrTable {
    constructor() {
        super();
    }

    createPots() {
        const potRadius = 3;
        return [
            {center: Point.create(33.867 + 35.567, 67.981), radius: potRadius},
            {center: Point.create(33.867 + -35.567, 67.981), radius: potRadius},
            {center: Point.create(33.867 + 34.567 - 1, -0.71 + 1), radius: potRadius},
            {center: Point.create(33.867 + -34.567 + 1, -0.71 + 1), radius: potRadius},
            {center: Point.create(33.867 + 34.567 - 1, 136.65 - 1), radius: potRadius},
            {center: Point.create(33.867 + -34.567 + 1, 136.65 - 1), radius: potRadius},
        ];
    }

}
