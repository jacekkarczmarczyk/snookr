class SnookrUIBoard extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SnookrGame} snookr
     */
    constructor(domElement, {snookr, spinPower}) {
        super(domElement, {
            snookr,
            spinPower,
            numberOfFrames: 7,
            frameNumber: 1,
            frameWins: [0, 0],
            frameScore: [0, 0],
            currentPlayer: 0,
            currentRule: '&nbsp;',
            snookered: false,
            breakValue: '&nbsp;',
        });

        this.dispatchEventToChildren('snookrEvent.arrowDown');
        this.dispatchEventToChildren('snookrEvent.arrowUp');
        this.dispatchEventToChildren('snookrEvent.arrowLeft');
        this.dispatchEventToChildren('snookrEvent.arrowRight');

        this.getElement().addEventListener('snookrEvent.rollback', () => this.rollback());
        this.getData().snookr.getEventListener().on(SnookrEvent.BALLS_STOPPED, () => this.ballsStopped(false));
        this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.endGame(score));
        this.getData().snookr.getEventListener().on(SnookrEvent.SNOOKER_CREATED, () => this.ballsStopped(true));
        this.getData().snookr.getEventListener().on(SnookrEvent.SCORE_CHANGED, score => this.updateScore(score));
        this.getData().snookr.getEventListener().on(SnookrEvent.PLAYER_CHANGED, player => this.updateCurrentPlayer(player));
        this.getData().snookr.getEventListener().on(SnookrEvent.RULE_CHANGED, rule => this.updateRule(rule));
        this.getData().snookr.getEventListener().on(SnookrEvent.BREAK_CHANGED, breakValue => this.updateBreak(breakValue));
    }

    updateView() {
        const data = this.getData();
        this.getElement().innerHTML = `<div class="player player-0 ${data.snookered ? 'snookered' : ''} ${data.currentPlayer ? '' : 'current'}">
            <div class="score-container">
                <div class="player-name">Player 1</div>
                <div class="score">${data.frameScore[0]}</div>
                <div class="frames-won">${data.frameWins[0]}</div>
            </div>
            <div class="break">${data.breakValue}</div>
            <div class="next-rule">${data.currentRule}</div>
        </div>
        <snookr-ui-cueball></snookr-ui-cueball>
        <div class="player player-1 ${data.snookered ? 'snookered' : ''} ${data.currentPlayer ? 'current' : ''}">
            <div class="score-container">
                <div class="player-name">Player 2</div>
                <div class="score">${data.frameScore[1]}</div>
                <div class="frames-won">${data.frameWins[1]}</div>
            </div>
            <div class="break">${data.breakValue}</div>
            <div class="next-rule">${data.currentRule}</div>
        </div>
`;

        this._children = [
            new SnookrUISpinnerBall(this.getElement().querySelector('snookr-ui-cueball'), {spinPower: this.getData().spinPower})
        ];
    }

    rollback() {
        if (confirm('Undo?')) {
            this.getData().spinPower.clear();
            this.getData().snookr.rollback();
            this.updateView();
        }
    }

    updateScore(score) {
        this.getData().frameScore = [score[0], score[1]];
        this.updateView();
    }

    updateCurrentPlayer(player) {
        this.getData().currentPlayer = player;
        this.updateView();
    }

    updateRule(rule) {
        this.getData().currentRule = rule ? rule.toString() : '&nbsp;';
        this.updateView();
    }

    updateBreak(breakValue) {
        this.getData().breakValue = breakValue ? `Break: ${breakValue}` : '&nbsp;';
        this.updateView();
    }

    endGame(score) {
        this.getData().frameWins[0] += 1 * (score[0] > score[1]);
        this.getData().frameWins[1] += 1 * (score[1] > score[0]);

        this.getData().snookr.resetGame();

        this.getData().frameNumber = this.getData().frameNumber + 1;
        if (this.getData().frameNumber === this.getData().numberOfFrames + 1) {
            alert('Match over!');
            this.getData().frameNumber = 1;
            this.getData().frameWins = [0, 0];
        }

        this.updateView();
    }

    ballsStopped(snookered) {
        this.getData().snookered = snookered;
        this.getData().spinPower.clear();
        this.updateView();
    }
}

