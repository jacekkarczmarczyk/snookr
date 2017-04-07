class SnookrGameTest extends SnookrGameRegular {
    /**
     *
     */
    constructor() {
        super();
    }

    resetGame() {
        this.currentScore = [0, 0];
        this.player = 0;
        this.rule = new SnookrRuleExpectingColor('yellow');
        this.ballSet = this.createBallSet();

        this.ballSet.only('white').first().setSpeed(Vector.create(-120, -160));
        this.inAction = true;
    }

    getFrameLength() {
        return 1;
    }

    /**
     *
     * @returns {SnookrBallSet}
     */
    // createBallSet() {
    //     const radius = this.getBallRadius();
    //
    //     return new SnookrBallSet([
    //         new SnookrBall(radius, 'white', new Point(66, 100.886), BallMovement.create(Vector.create(-0.2, 50))),
    //         new SnookrBall(radius, 'yellow', new Point(66, 130.886)),
    //     ]);
    // }
}
