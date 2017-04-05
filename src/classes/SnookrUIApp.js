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

        this.dispatchEventToChildren('snookrEvent.arrowDown');
        this.dispatchEventToChildren('snookrEvent.arrowUp');
        this.dispatchEventToChildren('snookrEvent.arrowLeft');
        this.dispatchEventToChildren('snookrEvent.arrowRight');
        this.dispatchEventToChildren('snookrEvent.rollback');
        this.dispatchEventToChildren('snookrEvent.resize');
    }

    updateView() {
        this.getElement().innerHTML = `<snookr-ui-table unselectable="on" onselectstart="return false"><div class="table"></div></snookr-ui-table><snookr-ui-board></snookr-ui-board>`;

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
}

