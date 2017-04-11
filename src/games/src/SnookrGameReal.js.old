class SnookrGameReal extends SnookrGameRegular {
    constructor() {
        super();
    }

    getPhysicsSettings() {
        return {
            slowdownBreaker: 200,
            forwardSpinLinearSlowdownRatio: 0.05,
            slowdownRatio: 0.987,
            sideSpinScale: 0.1,
            maxShotPower: 8.5,
            forwardSpinScale: 0.15
        };
    }

    getBallRadius() {
        return 1;
    }

    createTablePots() {
        const potRadius = 1.555;
        return new SnookrTablePots([
            new SnookrTablePot(4 + 33.867 + 35.567, 4 + 67.981, potRadius),
            new SnookrTablePot(4 + 33.867 + -35.567, 4 + 67.981, potRadius),
            new SnookrTablePot(4 + 33.867 + 34.567 - 1, 4 + -0.71 + 1, potRadius),
            new SnookrTablePot(4 + 33.867 + -34.567 + 1, 4 + -0.71 + 1, potRadius),
            new SnookrTablePot(4 + 33.867 + 34.567 - 1, 4 + 136.65 - 1, potRadius),
            new SnookrTablePot(4 + 33.867 + -34.567 + 1, 4 + 136.65 - 1, potRadius),
        ]);
    }
}
