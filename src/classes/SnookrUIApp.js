class SnookrUIApp extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {string} hash
     * @param {SpinPower} spinPower
     */
    constructor(domElement, {hash, spinPower}) {
        let snookr;
        switch (hash) {
            case '#test':
                snookr = new SnookrGameTest();
                break;
            case '#arcade':
                snookr = new SnookrGameArcade();
                break;
            case '#regular':
                snookr = new SnookrGameRegular();
                break;
            case '#real':
                snookr = new SnookrGameReal();
                break;
            default:
                snookr = new SnookrGameArcade();
                break;
        }

        super(domElement, {snookr, spinPower});

        this.audioPlayer = new SnookrAudioPlayer(snookr.getEventListener());

        this.dispatchEventToChildren('snookrEvent.arrowDown');
        this.dispatchEventToChildren('snookrEvent.arrowUp');
        this.dispatchEventToChildren('snookrEvent.arrowLeft');
        this.dispatchEventToChildren('snookrEvent.arrowRight');
        this.dispatchEventToChildren('snookrEvent.rollback');
        this.dispatchEventToChildren('snookrEvent.resize');

        this.getData().snookr.getEventListener().on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.showNextRuleChoiceDialog(nextRules));
        this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.getData().snookr.resetGame());
    }

    updateView() {
        this.getElement().innerHTML = `<snookr-ui-table></snookr-ui-table><snookr-ui-board></snookr-ui-board>`;

        this._children = [
            new SnookrUITable(this.getElement().querySelector('snookr-ui-table'), {
                snookr: this.getData().snookr,
                spinPower: this.getData().spinPower
            }),
            new SnookrUIBoard(this.getElement().querySelector('snookr-ui-board'), {
                snookr: this.getData().snookr,
                spinPower: this.getData().spinPower
            })
        ];
    }

    showNextRuleChoiceDialog(nextRules) {
        let nextRuleIndex = 0;

        if (nextRules.length > 1) {
            let text = "What next?";
            nextRules.forEach(function (rule, index) {
                text += "\n" + (index + 1) + ': ' + rule.toString();
            });
            do {
                try {
                    nextRuleIndex = Math.max(0, (window.prompt(text) >>> 0) - 1);
                } catch (e) {}
            } while (nextRuleIndex < 0 || nextRuleIndex >= nextRules.length);
        }

        this.getData().snookr.getEventListener().trigger(SnookrEvent.NEXT_RULE_CHOSEN, nextRules[nextRuleIndex]);
    }
}

