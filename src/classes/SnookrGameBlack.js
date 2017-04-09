class SnookrGameBlack extends SnookrGameArcade {
    /**
     *
     */
    constructor() {
        super();
    }

    getInitialRule() {
        return new SnookrRuleExpectingColor('black');
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    createBallSet() {
        return new SnookrBallSet([
            new SnookrBall(this.getBallRadius(), 'white', new Point(4 + 33.867 + 11.124 / 2, 4 + 107.886)),
            new SnookrBall(this.getBallRadius(), 'black', new Point(4 + 33.867, 4 + 12.343)),
        ]);
    }
}
