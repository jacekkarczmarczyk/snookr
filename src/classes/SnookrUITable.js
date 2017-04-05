class SnookrUITable extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SnookrGame} snookr
     * @param {SpinPower} spinPower
     */
    constructor(domElement, {snookr, spinPower}) {
        super(domElement);

        this.getElement().setAttribute('unselectable', 'on');
        this.getElement().addEventListener('selectstart', () => false);

        this.spinPower = spinPower;
        this.snookr = snookr;
        this.resources = null;
        this.scaledResources = {};
        this.ghostPosition = null;
        this.cueDistance = 0;
        this.drag = false;
        this.dragStartOffset = 0;
        this.dragPreviousOffset = 0;
        this.dragSpeedVector = null;

        const resourcesFactory = new StaticResourcesFactory(function () {
            const resources = {};
            [].slice.call(domElement.ownerDocument.querySelectorAll('img[data-resource]')).forEach(image => resources[image.getAttribute('data-resource')] = image);
            return resources;
        }());
        resourcesFactory.initResources().then(resources => this.resources = resources);

        this.getElement().addEventListener('mousemove', ({clientX, clientY}) => this.handleMouseMove(clientX, clientY));
        this.getElement().addEventListener('mousedown', ({clientY}) => this.startCueDrag(clientY));
        this.getElement().addEventListener('mouseup', () => this.endCueDrag());
        this.getElement().addEventListener('dragstart', () => false);
        this.getElement().addEventListener('contextmenu', () => false);

        this.snookr.getEventListener().on(SnookrEvent.REPAINT, gameState => this.repaint());
    }

    updateView() {
        this.getElement().innerHTML = '<img class="snookr-table-background" /><canvas class="snookr-table-canvas"></canvas><img class="snookr-table-cue" />';
        this.canvasElement = this.getElement().querySelector('.snookr-table-canvas');
        this.backgroundElement = this.getElement().querySelector('.snookr-table-background');
        this.cueElement = this.getElement().querySelector('.snookr-table-cue');
    }

    repaint() {
        let height = this.getElement().offsetHeight;
        let width = height * 1440 / 758;

        if (width > this.getElement().offsetWidth) {
            height = height * this.getElement().offsetWidth / width;
            width = this.getElement().offsetWidth;
        }

        width = Math.round(width);
        height = Math.round(height);

        if (this.backgroundElement.width !== width || this.backgroundElement.height !== height) {
            this.canvasElement.width = `${width}`;
            this.canvasElement.height = `${height}`;
            this.canvasElement.style.width = `${width}px`;
            this.canvasElement.style.height = `${height}px`;
            this.getElement().appendChild(this.canvasElement);

            this.context = this.canvasElement.getContext('2d');

            this.initBackgroundElement();

            this.scaledResources = {};

            const cueScreenLength = this.getScreenSize(this.snookr.getTable().getOuterLength() * 0.4);
            this.cueElement.style.width = cueScreenLength;
        }

        this.context.clearRect(0, 0, width, height);
        this.snookr.getBallSet().forEach(ball => this.paintBall(ball));
        this.paintCue();
        this.paintGhost();
    }

    /**
     *
     * @param {SnookrBall} ball
     */
    paintBall(ball) {
        if (ball.isPotted() || !this.resources) {
            return;
        }

        const canvasBallRadius = this.getScreenSize(ball.getBallRadius());
        const absoluteBallPosition = this.getScreenPosition(ball.getPosition());
        const ballType = ball.getBallType();
        const spritePadding = 1;

        if (!this.scaledResources[ballType]) {
            const tmpCanvas = this.getElement().ownerDocument.createElement('canvas');
            tmpCanvas.width = canvasBallRadius * 2 + 2 * spritePadding;
            tmpCanvas.height = canvasBallRadius * 2 + 2 * spritePadding;

            const tmpContext = tmpCanvas.getContext('2d');
            tmpContext.drawImage(this.resources.balls[ballType], spritePadding, spritePadding, canvasBallRadius * 2, canvasBallRadius * 2);
            tmpContext.beginPath();
            tmpContext.arc(canvasBallRadius + spritePadding, canvasBallRadius + spritePadding, canvasBallRadius - 0.2, 0, 2 * Math.PI, false);
            tmpContext.strokeStyle = '#000';
            tmpContext.lineWidth = 0.4;
            tmpContext.stroke();

            const img = new Image();
            img.width = 2 * canvasBallRadius;
            img.height = 2 * canvasBallRadius;
            img.src = tmpCanvas.toDataURL();
            this.scaledResources[ballType] = img;
        }

        this.context.drawImage(this.scaledResources[ballType], absoluteBallPosition.getX() - canvasBallRadius - spritePadding, absoluteBallPosition.getY() - canvasBallRadius - spritePadding);
    }

    paintGhost() {
        if (!this.ghostPosition) {
            return;
        }

        const canvasBallRadius = this.getScreenSize(this.snookr.getBallSet().first('white').getBallRadius());

        this.context.beginPath();
        this.context.arc(this.ghostPosition.getX(), this.ghostPosition.getY(), canvasBallRadius - 0.25, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.context.fill();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 0.5;
        this.context.stroke();
    }

    paintCue() {
        if (!this.ghostPosition || !this.resources || !this.resources.cue) {
            this.cueElement.style.display = 'none';
            return;
        }

        const whiteBall = this.snookr.getBallSet().first('white');
        const ballScreenRadius = this.getScreenSize(whiteBall.getBallRadius());
        const cueTipScreenPosition = this.getScreenPosition(whiteBall.getPosition());
        const cueScreenDistance = this.getScreenSize(this.cueDistance);
        if (!this.cueElement.src) {
            this.cueElement.src = this.resources.cue.src;
        }
        this.cueElement.style.top = (cueTipScreenPosition.getY() - this.cueElement.offsetHeight / 2) + 'px';
        this.cueElement.style.left = (cueTipScreenPosition.getX() + cueScreenDistance + ballScreenRadius) + 'px';
        this.cueElement.style.transformOrigin = `-${ballScreenRadius + cueScreenDistance}px 50%`;
        this.cueElement.style.transform = 'rotate(' + (90 + whiteBall.getPosition().vectorTo(this.getTablePosition(this.ghostPosition)).getAngle() * 180 / Math.PI) + 'deg)';
        this.cueElement.style.display = 'block';
    }

    handleMouseMove(clientX, clientY) {
        const ghostPosition = Point.create(clientX, clientY);

        if (this.drag) {
            this.handleCueDrag(clientY);
        } else if (this.snookr.isInAction()) {
            this.ghostPosition = null;
        } else {
            this.ghostPosition = ghostPosition;
        }
    }

    handleCueDrag(mouseY) {
        if (mouseY - this.dragStartOffset + this.getScreenSize(this.snookr.getInitialCueDistance()) < 0) {
            const shotPower = Math.min(this.snookr.getPhysics().getSetting('maxShotPower'), this.getTableSize(this.dragPreviousOffset - mouseY));
            const speed = this.dragSpeedVector.normalize().scale(shotPower);
            const forwardSpin = speed.scale(-this.spinPower.getForwardSpinPower() * Math.sqrt(speed.getLength() / 5) * this.snookr.getPhysics().getSetting('forwardSpinScale'));
            const sideSpin = -this.spinPower.getSideSpinPower() * speed.getLength() * this.snookr.getPhysics().getSetting('sideSpinScale');
            const movement = new BallMovement(speed, new Spin(forwardSpin, sideSpin));

            this.ghostPosition = null;
            this.drag = false;

            this.snookr.getEventListener().trigger(SnookrEvent.CUE_HITS_BALL, shotPower);
            this.snookr.getEventListener().trigger(SnookrEvent.SHOT_ATTEMPT, movement);
        } else {
            this.cueDistance = this.snookr.getInitialCueDistance() + this.getTableSize(mouseY - this.dragStartOffset);
            this.dragPreviousOffset = mouseY;
        }
    }

    startCueDrag(mouseY) {
        if (!this.drag) {
            this.drag = true;
            this.dragPreviousOffset = 0;
            this.dragStartOffset = mouseY;
            this.dragSpeedVector = this.snookr.getBallSet().first('white').getPosition().vectorTo(this.getTablePosition(this.ghostPosition));
        }
    }

    endCueDrag() {
        this.cueDistance = this.snookr.getInitialCueDistance();
        this.drag = false;
    }

    initBackgroundElement() {
        const self = this;
        const canvas = this.canvasElement;
        const context = this.context;
        const table = this.snookr.getTable();

        let p;

        context.fillStyle = 'darkgreen';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = '#030';
        context.lineWidth = 1;
//        context.fillStyle = '#228B22';
        const canvasPattern = document.querySelector('img[data-resource="canvas"]');
        context.fillStyle = context.createPattern(canvasPattern, 'repeat');
        context.beginPath();
        context.moveTo(self.getScreenPosition(table.getBoundaryElements()[0].getP1()).getX(), self.getScreenPosition(table.getBoundaryElements()[0].getP1()).getY());
        table.getBoundaryElements().forEach(function (element) {
            if (element instanceof LineSegment) {
                const p2 = self.getScreenPosition(element.getP2());
                context.lineTo(p2.getX(), p2.getY());
            } else if (element instanceof LineArc) {
                const center = self.getScreenPosition(element.getCenter());
                const radius = self.getScreenSize(element.getRadius());
                context.arc(center.getX(), center.getY(), radius, element.getAlpha2() - Math.PI / 2, element.getAlpha1() - Math.PI / 2, true);
            }
        });
        context.stroke();
        context.closePath();
        context.fill();

        // brown part
        //
        context.fillStyle = '#4A2106';

        p = self.getScreenPosition(Point.create(0, -4));
        context.beginPath();
        context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, -4));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, -1.8));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(0, -1.8));
        context.lineTo(p.getX(), p.getY());
        context.closePath();
        context.fill();
        p = self.getScreenPosition(Point.create(0, 137.8));
        context.beginPath();
        context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, 137.8));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, 140));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(0, 140));
        context.lineTo(p.getX(), p.getY());
        context.closePath();
        context.fill();
        p = self.getScreenPosition(Point.create(-4, -0.5));
        context.beginPath();
        context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-1.8, -0.5));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-1.8, 136));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-4, 136));
        context.lineTo(p.getX(), p.getY());
        context.closePath();
        context.fill();
        p = self.getScreenPosition(Point.create(71.8, -0.5));
        context.beginPath();
        context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(69.2, -0.5));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(69.2, 136));
        context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(71.8, 136));
        context.lineTo(p.getX(), p.getY());
        context.closePath();
        context.fill();

        const bulkLine1 = this.getScreenPosition(Point.create(-33.867 + 33.867, 107.986));
        const bulkLine2 = this.getScreenPosition(Point.create(+33.867 + 33.867, 107.986));
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#cfc';
        context.moveTo(bulkLine1.getX(), bulkLine1.getY());
        context.lineTo(bulkLine2.getX(), bulkLine2.getY());
        context.stroke();

        const bulkCircleCenter = this.getScreenPosition(Point.create(0 + 33.867, 107.886));
        const bulkCircleRadius = this.getScreenSize(11);
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#cfc';
        context.arc(bulkCircleCenter.getX(), bulkCircleCenter.getY(), bulkCircleRadius, 1.5 * Math.PI, 0.5 * Math.PI);
        context.stroke();

        context.fillStyle = 'gold';
        p = this.getScreenPosition(Point.create(0, -4));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, -4));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(0, 136));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, 136));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, 65.97));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(2.6));
        p = this.getScreenPosition(Point.create(-1.85, 65.97));
        context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(2.1));

        table.getPots().forEach(function (pot) {
            const p = self.getScreenPosition(pot.center);
            const r = self.getScreenSize(pot.radius);
            context.beginPath();
            context.arc(p.getX(), p.getY(), r - 0.1, 0, 2 * Math.PI, false);
            context.fillStyle = '#222';
            context.fill();
        });

        this.backgroundElement.src = canvas.toDataURL();
        this.backgroundElement.width = canvas.width;
        this.backgroundElement.height = canvas.height;
    }

    /**
     *
     * @param {Point} tablePosition
     */
    getScreenPosition(tablePosition) {
        const table = this.snookr.getTable();
        const screenX = (tablePosition.getY() + (table.getOuterLength() - table.getInnerLength()) / 2) * this.canvasElement.width / table.getOuterLength();
        const screenY = this.canvasElement.height - (tablePosition.getX() + (table.getOuterWidth() - table.getInnerWidth()) / 2) * this.canvasElement.height / table.getOuterWidth();
        return Point.create(screenX, screenY);
    }

    getScreenSize(tableSize) {
        const table = this.snookr.getTable();
        return tableSize * this.canvasElement.width / table.getOuterLength();
    }

    getTablePosition(screenPosition) {
        const table = this.snookr.getTable();
        const tableX = (this.canvasElement.height - screenPosition.getY()) * table.getOuterWidth() / this.canvasElement.height - (table.getOuterWidth() - table.getInnerWidth()) / 2;
        const tableY = screenPosition.getX() * table.getOuterLength() / this.canvasElement.width - (table.getOuterLength() - table.getInnerLength()) / 2;
        return Point.create(tableX, tableY);
    }

    getTableSize(screenSize) {
        const table = this.snookr.getTable();
        return screenSize * table.getOuterLength() / this.canvasElement.width;
    }

}

