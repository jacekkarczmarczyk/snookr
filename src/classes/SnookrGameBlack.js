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
            new SnookrBall(this.getBallRadius(), 'white', new Point(33.867 + 11.124 / 2, 107.886)),
            new SnookrBall(this.getBallRadius(), 'black', new Point(33.867, 12.343)),
        ]);
    }
}
