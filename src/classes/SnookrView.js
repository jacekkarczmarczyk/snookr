class SnookrView {
    constructor() {
        this.resources = null;
    }

    /**
     *
     * @param {StaticResourcesFactory} resourcesRepository
     * @returns {Promise}
     */
    loadResources(resourcesRepository) {
        return resourcesRepository.initResources().then(resources => this.resources = resources);
    }

    /**
     *
     * @param {SnookrGameState} gameState
     */
    repaint(gameState) {
        this.paintTable(this.table);
        this.paintBalls(gameState.getBallSet());
        this.paintCue(gameState.getGhostPosition(), gameState.getCueDistance(), gameState.getCueBall());
        this.paintGhost(gameState.getGhostPosition(), gameState.getCueBall());
    }
}


class SnookrCanvasView extends SnookrView {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SnookrTable} table
     */
    constructor(domElement, table) {
        super();
        this.domElement = domElement;
        this.table = table;
        this.viewSize = Point.create();
        this.tableImg = null;
    }

    /**
     *
     * @returns {Point}
     */
    getViewSize() {
        return this.viewSize;
    }

    resize() {
        this.domElement.innerHTML = '';
    }

    /**
     *
     * @param {Point} tablePosition
     */
    getScreenPosition(tablePosition) {
        const screenX = (tablePosition.getY() + (this.table.getOuterLength() - this.table.getInnerLength()) / 2) * this.getViewSize().getX() / this.table.getOuterLength();
        const screenY = this.getViewSize().getY() - (tablePosition.getX() + (this.table.getOuterWidth() - this.table.getInnerWidth()) / 2) * this.getViewSize().getY() / this.table.getOuterWidth();
        return Point.create(screenX, screenY);
    }

    getScreenSize(tableSize) {
        return tableSize * this.getViewSize().getX() / this.table.getOuterLength();
    }

    getTablePosition(screenPosition) {
        const tableX = (this.getViewSize().getY() - screenPosition.getY()) * this.table.getOuterWidth() / this.getViewSize().getY() - (this.table.getOuterWidth() - this.table.getInnerWidth()) / 2;
        const tableY = screenPosition.getX() * this.table.getOuterLength() / this.getViewSize().getX() - (this.table.getOuterLength() - this.table.getInnerLength()) / 2;
        return Point.create(tableX, tableY);
    }

    getTableSize(screenSize) {
        return screenSize * this.table.getOuterLength() / this.getViewSize().getX();
    }

    /**
     *
     * @param {SnookrGameState} gameState
     */
    repaint(gameState) {
        let height = this.domElement.offsetHeight;
        let width = height * 1440 / 758;

        if (width > this.domElement.offsetWidth) {
            height = height * this.domElement.offsetWidth / width;
            width = this.domElement.offsetWidth;
        }

        this.viewSize = Point.create(width, height);

        let canvas = this.domElement.querySelector('canvas');
        if (!canvas) {
            canvas = this.domElement.ownerDocument.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.style.position = 'absolute';
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            this.domElement.appendChild(canvas);
            this.context = canvas.getContext('2d');
            this.tableImg = this.getTableImg();
        }

        this.context.drawImage(this.tableImg, 0, 0, width, height);
        this.paintBalls(gameState.getBallSet());
        this.paintCue(gameState.getGhostPosition(), gameState.getCueDistance(), gameState.getCueBall());
        this.paintGhost(gameState.getGhostPosition(), gameState.getCueBall());
    }

    /**
     *
     * @returns {HTMLImageElement}
     */
    getTableImg() {
        const self = this;

        let p;

        this.context.fillStyle = 'darkgreen';
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);


        self.context.strokeStyle = '#030';
        self.context.lineWidth = 1;
//        self.context.fillStyle = '#228B22';
        const canvasPattern = document.querySelector('img[data-resource="canvas"]');
        self.context.fillStyle = self.context.createPattern(canvasPattern, 'repeat');
        self.context.beginPath();
        self.context.moveTo(self.getScreenPosition(this.table.getBoundaryElements()[0].getP1()).getX(), self.getScreenPosition(this.table.getBoundaryElements()[0].getP1()).getY());
        this.table.getBoundaryElements().forEach(function (element) {
            if (element instanceof LineSegment) {
                const p2 = self.getScreenPosition(element.getP2());
                self.context.lineTo(p2.getX(), p2.getY());
            } else if (element instanceof LineArc) {
                const center = self.getScreenPosition(element.getCenter());
                const radius = self.getScreenSize(element.getRadius());
                self.context.arc(center.getX(), center.getY(), radius, element.getAlpha2() - Math.PI / 2, element.getAlpha1() - Math.PI / 2, true);
            }
        });
        self.context.stroke();
        self.context.closePath();
        self.context.fill();

        // Brazowa czesc
        //
        self.context.fillStyle = '#4A2106';

        p = self.getScreenPosition(Point.create(0, -4));
        self.context.beginPath();
        self.context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, -4));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, -1.8));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(0, -1.8));
        self.context.lineTo(p.getX(), p.getY());
        self.context.closePath();
        self.context.fill();
        p = self.getScreenPosition(Point.create(0, 137.8));
        self.context.beginPath();
        self.context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, 137.8));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(67.8, 140));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(0, 140));
        self.context.lineTo(p.getX(), p.getY());
        self.context.closePath();
        self.context.fill();
        p = self.getScreenPosition(Point.create(-4, -0.5));
        self.context.beginPath();
        self.context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-1.8, -0.5));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-1.8, 136));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(-4, 136));
        self.context.lineTo(p.getX(), p.getY());
        self.context.closePath();
        self.context.fill();
        p = self.getScreenPosition(Point.create(71.8, -0.5));
        self.context.beginPath();
        self.context.moveTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(69.2, -0.5));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(69.2, 136));
        self.context.lineTo(p.getX(), p.getY());
        p = self.getScreenPosition(Point.create(71.8, 136));
        self.context.lineTo(p.getX(), p.getY());
        self.context.closePath();
        self.context.fill();

        const bulkLine1 = this.getScreenPosition(Point.create(-33.867 + 33.867, 107.986));
        const bulkLine2 = this.getScreenPosition(Point.create(+33.867 + 33.867, 107.986));
        self.context.beginPath();
        self.context.lineWidth = 2;
        self.context.strokeStyle = '#cfc';
        self.context.moveTo(bulkLine1.getX(), bulkLine1.getY());
        self.context.lineTo(bulkLine2.getX(), bulkLine2.getY());
        self.context.stroke();

        const bulkCircleCenter = this.getScreenPosition(Point.create(0 + 33.867, 107.886));
        const bulkCircleRadius = this.getScreenSize(11);
        self.context.beginPath();
        self.context.lineWidth = 2;
        self.context.strokeStyle = '#cfc';
        self.context.arc(bulkCircleCenter.getX(), bulkCircleCenter.getY(), bulkCircleRadius, 1.5 * Math.PI, 0.5 * Math.PI);
        self.context.stroke();

        self.context.fillStyle = 'gold';
        p = this.getScreenPosition(Point.create(0, -4));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, -4));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(0, 136));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, 136));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(4));
        p = this.getScreenPosition(Point.create(71.8, 65.97));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(2.6));
        p = this.getScreenPosition(Point.create(-1.85, 65.97));
        self.context.fillRect(p.getX(), p.getY(), this.getScreenSize(4), this.getScreenSize(2.1));

        this.table.getPots().forEach(function (pot) {
            const p = self.getScreenPosition(pot.center);
            const r = self.getScreenSize(pot.radius);
            self.context.beginPath();
            self.context.arc(p.getX(), p.getY(), r - 0.1, 0, 2 * Math.PI, false);
            self.context.fillStyle = '#222';
            self.context.fill();
        });

        const dataUrl = this.context.canvas.toDataURL();
        const img = this.domElement.ownerDocument.createElement('img');
        img.src = dataUrl;
        img.width = this.context.canvas.offsetWidth;
        img.height = this.context.canvas.offsetHeight;
        return img;
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     */
    paintBalls(ballSet) {
        ballSet.forEach(ball => this.paintBall(ball));
    }

    /**
     *
     * @param {SnookrBall} ball
     */
    paintBall(ball) {
        if (ball.isPotted()) {
            return;
        }

        const absoluteBallPosition = this.getScreenPosition(ball.getPosition());
        const canvasBallRadius = this.getScreenSize(ball.getBallRadius());

        this.context.drawImage(
            document.querySelector('img[data-resource="ball-' + ball.getBallType() + '"]'),
            absoluteBallPosition.getX() - canvasBallRadius,
            absoluteBallPosition.getY() - canvasBallRadius,
            canvasBallRadius * 2,
            canvasBallRadius * 2
        );
        this.context.beginPath();
        this.context.arc(absoluteBallPosition.getX(), absoluteBallPosition.getY(), canvasBallRadius - 0.2, 0, 2 * Math.PI, false);
        this.context.strokeStyle = '#000';
        this.context.lineWidth = 0.4;
        this.context.stroke();
    }

    /**
     *
     * @param {Point} ghostPosition
     * @param {SnookrBall} whiteBall
     */
    paintGhost(ghostPosition, whiteBall) {
        if (!ghostPosition) {
            return;
        }

        const absoluteBallPosition = this.getScreenPosition(ghostPosition);
        const canvasBallRadius = this.getScreenSize(whiteBall.getBallRadius());

        this.context.beginPath();
        this.context.arc(absoluteBallPosition.getX(), absoluteBallPosition.getY(), canvasBallRadius - 0.25, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.context.fill();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 0.5;
        this.context.stroke();
    }

    /**
     *
     * @param {Point} ghostPosition
     * @param cueDistance
     * @param {SnookrBall} whiteBall
     */
    paintCue(ghostPosition, cueDistance, whiteBall) {
        let cueElement = this.domElement.querySelector('.snookr-cue');

        if (!ghostPosition) {
            cueElement && cueElement.parentNode.removeChild(cueElement);
            return;
        }

        const ballScreenRadius = this.getScreenSize(whiteBall.getBallRadius());
        if (!cueElement) {
            const cueScreenLength = this.getScreenSize(this.table.getOuterLength() * 0.4);
            cueElement = this.resources.cue.cloneNode();
            cueElement.className = 'snookr-cue';
            cueElement.style.position = 'absolute';
            cueElement.style.zIndex = 1001;
            cueElement.style.width = cueScreenLength;

            this.domElement.appendChild(cueElement);
        }

        const cueTipScreenPosition = this.getScreenPosition(whiteBall.getPosition());
        const cueScreenDistance = this.getScreenSize(cueDistance);
        cueElement.style.top = (cueTipScreenPosition.getY() - cueElement.offsetHeight / 2) + 'px';
        cueElement.style.left = (cueTipScreenPosition.getX() + cueScreenDistance + ballScreenRadius) + 'px';
        cueElement.style.transformOrigin = `-${ballScreenRadius + cueScreenDistance}px 50%`;
        cueElement.style.transform = 'rotate(' + (90 + whiteBall.getPosition().vectorTo(ghostPosition).getAngle() * 180 / Math.PI) + 'deg)';
    }

}

