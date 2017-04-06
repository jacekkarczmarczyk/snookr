class SnookrUIApp extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SnookrGame} snookr
     * @param {SpinPower} spinPower
     */
    constructor(domElement, {snookr, spinPower}) {
        super(domElement, {snookr, spinPower});

        this.audioPlayer = new SnookrAudioPlayer(snookr.getEventListener());

        this.getData().snookr.getEventListener().on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.showNextRuleChoiceDialog(nextRules));
        this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.getData().snookr.resetGame());
    }

    onMount() {
        this.dispatchEventToChildren('snookrEvent.arrowDown');
        this.dispatchEventToChildren('snookrEvent.arrowUp');
        this.dispatchEventToChildren('snookrEvent.arrowLeft');
        this.dispatchEventToChildren('snookrEvent.arrowRight');
        this.dispatchEventToChildren('snookrEvent.rollback');
    }

    updateView() {
        this.getElement().innerHTML = `<snookr-ui-table></snookr-ui-table><snookr-ui-board></snookr-ui-board>`;

        this.mountOrCreateChildren([{
            element: this.getElement().querySelector('snookr-ui-board'),
            component: SnookrUIBoard,
            data: {
                snookr: this.getData().snookr,
                spinPower: this.getData().spinPower
            }
        }, {
            element: this.getElement().querySelector('snookr-ui-table'),
            component: SnookrUITable,
            data: {
                snookr: this.getData().snookr,
                spinPower: this.getData().spinPower
            }
        }]);
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

