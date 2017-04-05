class SnookrUISpinnerBall extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SpinPower} spinPower
     */
    constructor(domElement, {spinPower}) {
        super(domElement, {spinPower});

        domElement.addEventListener('snookrEvent.arrowUp', () => this.updateForwardSpin(1));
        domElement.addEventListener('snookrEvent.arrowDown', () => this.updateForwardSpin(-1));
        domElement.addEventListener('snookrEvent.arrowLeft', () => this.updateSideSpin(-1));
        domElement.addEventListener('snookrEvent.arrowRight', () => this.updateSideSpin(1));
    }

    updateView() {
        const forwardSpinPower = this.getData().spinPower.getForwardSpinPower();
        const sideSpinPower = this.getData().spinPower.getSideSpinPower();
        this.getElement().innerHTML = `<div><div style="top: ${forwardSpinPower * 24}px; left: ${sideSpinPower * 24}px"></div></div>`;
    }

    updateForwardSpin(delta) {
        const oldPower = this.getData().spinPower.getForwardSpinPower();
        const newPower = Math.min(1, Math.max(-1, oldPower + delta / 12));
        const sideSpinPower = this.getData().spinPower.getSideSpinPower();

        if (newPower * newPower + sideSpinPower * sideSpinPower <= 1) {
            this.getData().spinPower.setForwardSpinPower(newPower);
            this.updateView();
        }
    }

    updateSideSpin(delta) {
        const oldPower = this.getData().spinPower.getSideSpinPower();
        const newPower = Math.min(1, Math.max(-1, oldPower + delta / 12));
        const forwardSpinPower = this.getData().spinPower.getForwardSpinPower();

        if (newPower * newPower + forwardSpinPower * forwardSpinPower <= 1) {
            this.getData().spinPower.setSideSpinPower(newPower);
            this.updateView();
        }
    }
}

