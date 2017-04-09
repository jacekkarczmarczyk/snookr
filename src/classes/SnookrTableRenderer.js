const BALL_STROKE_WIDTH = 0.3;
const BALL_STROKE_OFFSET = 0;
const BALL_SPRITE_PADDING = 2;

class SnookrTableRenderer {
    /**
     *
     * @param resources
     */
    constructor(resources) {
        this.resources = resources;
        this.scaledResources = {};
        this.table = null;
        this.containerElement = null;
        this.canvasElement = null;
        this.backgroundImageElement = null;
        this.cueElement = null;
    }

    /**
     *
     * @returns {boolean}
     */
    isMounted() {
        return !!this.containerElement;
    }

    /**
     *
     * @param {SnookrTable} table
     */
    setTable(table) {
        this.table = table;
    }

    /**
     *
     * @returns {SnookrTable}
     */
    getTable() {
        return this.table;
    }

    /**
     *
     * @param {HTMLElement} containerElement
     * @param {HTMLCanvasElement} canvasElement
     * @param {HTMLImageElement} backgroundImageElement
     * @param {HTMLImageElement} cueElement
     * @returns {SnookrTableRenderer}
     */
    mount(containerElement, canvasElement, backgroundImageElement, cueElement) {
        this.containerElement = containerElement;
        this.canvasElement = canvasElement;
        this.context = canvasElement.getContext('2d');
        this.backgroundImageElement = backgroundImageElement;
        this.cueElement = cueElement;
        this.invalidateCanvasSize();
        return this;
    }

    invalidateCanvasSize() {
        let height = this.containerElement.offsetHeight;
        let width = height * this.table.getOuterLength() / this.table.getOuterWidth();

        if (width > this.containerElement.offsetWidth) {
            height = height * this.containerElement.offsetWidth / width;
            width = this.containerElement.offsetWidth;
        }

        width = Math.round(width);
        height = Math.round(height);

        if (this.canvasElement.width === width && this.canvasElement.height === height) {
            return;
        }

        this.canvasElement.width = width;
        this.canvasElement.height = height;
        this.canvasElement.style.width = `${width}px`;
        this.canvasElement.style.height = `${height}px`;
        this.backgroundImageElement.width = width;
        this.backgroundImageElement.height = height;
        this.backgroundImageElement.src = this.getBackgroundImageDataUrl();

        this.scaledResources = {};

        this.cueElement.setAttribute('width', this.getScreenSize(this.table.getOuterLength() * 0.4).toFixed(0));
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param {SnookrBall} cueBall
     * @param {Point} ghostScreenPosition
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     * @param {Vector} screenCueBallOffset
     * @param {boolean} mouseOnCueBall
     */
    paintCanvas(ballSet, cueBall, ghostScreenPosition, shooting, settingCueBall, screenCueBallOffset, mouseOnCueBall) {
        if (!this.isMounted()) {
            return;
        }

        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        const self = this;
        ballSet.forEach(function (ball) {
            if (ball.isPotted()) {
                return;
            }

            if (ball.getBallType() === 'white') {
                self.paintBall(ball, screenCueBallOffset);
                if (settingCueBall) {
                    self.paintCueBallDragArrows(ball, screenCueBallOffset, mouseOnCueBall);
                }
            } else {
                self.paintBall(ball, Vector.create());
            }
        });

        if (ghostScreenPosition && !mouseOnCueBall && shooting) {
            this.paintGhost(cueBall, ghostScreenPosition);
        }

        this.canvasElement.style.cursor = (settingCueBall && mouseOnCueBall) ? 'move' : 'default';

    }

    /**
     *
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} isDraggingCueBall
     * @param {boolean} settingCueBall
     * @param {boolean} mouseOnCueBall
     * @param {Point|null} ghostScreenPosition
     * @param {number} cueScreenDistance
     */
    paintCue(cueBall, shooting, isDraggingCueBall, settingCueBall, mouseOnCueBall, ghostScreenPosition, cueScreenDistance) {
        if (!this.isMounted()) {
            return;
        }

        this.cueElement.style = this.computeCueStyle(cueBall, shooting, isDraggingCueBall, settingCueBall, mouseOnCueBall, ghostScreenPosition, cueScreenDistance);
    }

    /**
     *
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} isDraggingCueBall
     * @param {boolean} settingCueBall
     * @param {boolean} mouseOnCueBall
     * @param {Point|null} ghostScreenPosition
     * @param {number} cueScreenDistance
     * @returns {string}
     */
    computeCueStyle(cueBall, shooting, isDraggingCueBall, settingCueBall, mouseOnCueBall, ghostScreenPosition, cueScreenDistance) {
        if (!shooting || isDraggingCueBall || (settingCueBall && mouseOnCueBall) || !ghostScreenPosition) {
            return 'display: none';
        }

        const cueBallScreenRadius = this.getScreenSize(cueBall.getBallRadius());
        const cueTipScreenPosition = this.getScreenPosition(cueBall.getPosition());
        const ghostTablePosition = this.getTablePosition(ghostScreenPosition);

        const top = cueTipScreenPosition.getY() - this.cueElement.offsetHeight / 2;
        const left = cueTipScreenPosition.getX() + cueScreenDistance + cueBallScreenRadius;
        const transformOriginX = -(cueBallScreenRadius + cueScreenDistance);
        const rotateAngle = 90 + cueBall.getPosition().createVectorTo(ghostTablePosition).getAngle() * 180 / Math.PI;
        return `display: block; top: ${top}px; left: ${left}px; transform-origin: ${transformOriginX}px 50%; transform: rotate(${rotateAngle}deg)`;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @returns {Image}
     */
    getScaledBallImage(ball) {
        const resource = this.resources.balls[ball.getBallType()];
        const tmpCanvas = document.createElement('canvas');
        const ballRadius = this.getScreenSize(ball.getBallRadius());

        tmpCanvas.width = ballRadius * 2 + 2 * BALL_SPRITE_PADDING;
        tmpCanvas.height = ballRadius * 2 + 2 * BALL_SPRITE_PADDING;

        const tmpContext = tmpCanvas.getContext('2d');
        tmpContext.drawImage(resource, BALL_SPRITE_PADDING, BALL_SPRITE_PADDING, ballRadius * 2, ballRadius * 2);
        tmpContext.beginPath();
        tmpContext.arc(ballRadius + BALL_SPRITE_PADDING, ballRadius + BALL_SPRITE_PADDING, ballRadius + BALL_STROKE_OFFSET, 0, 2 * Math.PI, false);
        tmpContext.strokeStyle = '#000';
        tmpContext.lineWidth = BALL_STROKE_WIDTH;
        tmpContext.stroke();

        const img = new Image();
        img.width = 2 * ballRadius;
        img.height = 2 * ballRadius;
        img.src = tmpCanvas.toDataURL();
        return img;
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {Vector} screenBallOffset
     */
    paintBall(ball, screenBallOffset) {
        if (!this.isMounted()) {
            return;
        }

        if (!this.scaledResources[ball.getBallType()]) {
            this.scaledResources[ball.getBallType()] = this.getScaledBallImage(ball);
        }
        const screenBallPosition = this.getScreenPosition(ball.getPosition());
        const screenBallRadius = this.getScreenSize(ball.getBallRadius());
        this.context.drawImage(
            this.scaledResources[ball.getBallType()],
            screenBallPosition.getX() + screenBallOffset.getX() - screenBallRadius - BALL_SPRITE_PADDING,
            screenBallPosition.getY() + screenBallOffset.getY() - screenBallRadius - BALL_SPRITE_PADDING
        );
    }

    /**
     *
     * @param {SnookrBall} ball
     * @param {Vector} screenBallOffset
     * @param {boolean} isPointerOnCueBall
     */
    paintCueBallDragArrows(ball, screenBallOffset, isPointerOnCueBall) {
        if (!this.isMounted()) {
            return;
        }

        const context = this.context;
        const screenBallPosition = this.getScreenPosition(ball.getPosition()).translate(screenBallOffset);
        const screenBallRadius = this.getScreenSize(ball.getBallRadius());

        context.beginPath();
        context.moveTo(screenBallPosition.getX(), screenBallPosition.getY());

        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY() + screenBallRadius * 0.6);
        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.2, screenBallPosition.getY() + screenBallRadius * 0.4);
        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.2, screenBallPosition.getY() + screenBallRadius * 0.4);
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY() + screenBallRadius * 0.6);
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY());

        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY() - screenBallRadius * 0.6);
        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.2, screenBallPosition.getY() - screenBallRadius * 0.4);
        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.2, screenBallPosition.getY() - screenBallRadius * 0.4);
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY() - screenBallRadius * 0.6);
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY());

        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.6, screenBallPosition.getY());
        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.4, screenBallPosition.getY() + screenBallRadius * 0.2);
        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.4, screenBallPosition.getY() - screenBallRadius * 0.2);
        context.lineTo(screenBallPosition.getX() + screenBallRadius * 0.6, screenBallPosition.getY());
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY());

        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.6, screenBallPosition.getY());
        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.4, screenBallPosition.getY() + screenBallRadius * 0.2);
        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.4, screenBallPosition.getY() - screenBallRadius * 0.2);
        context.lineTo(screenBallPosition.getX() - screenBallRadius * 0.6, screenBallPosition.getY());
        context.lineTo(screenBallPosition.getX(), screenBallPosition.getY());

        context.strokeStyle = isPointerOnCueBall ? '#aaa' : '#666';
        context.lineWidth = 2;
        context.stroke();
    }

    /**
     *
     * @param {SnookrBall} cueBall
     * @param {Point} screenGhostPosition
     */
    paintGhost(cueBall, screenGhostPosition) {
        if (!this.isMounted()) {
            return;
        }

        const screenGhostRadius = this.getScreenSize(cueBall.getBallRadius());

        this.context.beginPath();
        this.context.arc(screenGhostPosition.getX(), screenGhostPosition.getY(), screenGhostRadius + BALL_STROKE_OFFSET, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.context.fill();
        this.context.strokeStyle = '#000';
        this.context.lineWidth = BALL_STROKE_WIDTH;
        this.context.stroke();
    }

    /**
     *
     * @returns {string}
     */
    getBackgroundImageDataUrl() {
        if (!this.isMounted()) {
            return;
        }

        const table = this.table;
        const self = this;
        const canvas = this.canvasElement;
        const context = this.context;

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

        const bulkCircleCenter = this.getScreenPosition(Point.create(33.867, 107.886));
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

        return canvas.toDataURL();
    }

    /**
     *
     * @param {Point} tablePosition
     * @returns {Point}
     */
    getScreenPosition(tablePosition) {
        const screenX = (tablePosition.getY() + (this.table.getOuterLength() - this.table.getInnerLength()) / 2) * this.canvasElement.width / this.table.getOuterLength();
        const screenY = this.canvasElement.height - (tablePosition.getX() + (this.table.getOuterWidth() - this.table.getInnerWidth()) / 2) * this.canvasElement.height / this.table.getOuterWidth();
        return Point.create(screenX, screenY);
    }

    /**
     *
     * @param {number} tableSize
     * @returns {number}
     */
    getScreenSize(tableSize) {
        return tableSize * this.canvasElement.width / this.table.getOuterLength();
    }

    /**
     *
     * @param {Point} screenPosition
     * @returns {Point}
     */
    getTablePosition(screenPosition) {
        const tableX = (this.canvasElement.height - screenPosition.getY()) * this.table.getOuterWidth() / this.canvasElement.height - (this.table.getOuterWidth() - this.table.getInnerWidth()) / 2;
        const tableY = screenPosition.getX() * this.table.getOuterLength() / this.canvasElement.width - (this.table.getOuterLength() - this.table.getInnerLength()) / 2;
        return Point.create(tableX, tableY);
    }

    /**
     *
     * @param {number} screenSize
     * @returns {number}
     */
    getTableSize(screenSize) {
        return screenSize * this.table.getOuterLength() / this.canvasElement.width;
    }


}