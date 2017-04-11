class SnookrTableController {
    constructor() {
        this.shotFiredCallback = () => null;
        this.cueBallPositionChangedCallback = () => null;
        this.positionValidator = () => true;
        this.ghostScreenPosition = null;
        this.dragData = null;
        this.cueScreenDistance = null;
        this.mouseOnCueBall = false;
    }

    /**
     *
     * @param callback
     * @returns {SnookrTableController}
     */
    onCueBallPositionChanged(callback) {
        this.cueBallPositionChangedCallback = callback;
        return this;
    }

    /**
     *
     * @param callback
     * @returns {SnookrTableController}
     */
    onShotFired(callback) {
        this.shotFiredCallback = callback;
        return this;
    }

    /**
     *
     * @param positionValidator
     * @returns {SnookrTableController}
     */
    setPositionValidator(positionValidator) {
        this.positionValidator = positionValidator;
        return this;
    }


    /**
     *
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBallSet} ballSet
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    repaint(tableRenderer, ballSet, cueBall, {shooting, settingCueBall}) {
        const screenCueBallOffset = this.getScreenCueBallOffset(settingCueBall);
        const ghostScreenPosition = this.getScreenGhostPosition(shooting);

        tableRenderer.invalidateCanvasSize();
        tableRenderer.paintCanvas(ballSet, cueBall, ghostScreenPosition, shooting, settingCueBall, screenCueBallOffset, this.isPointerOnCueBall());
        if (this.cueScreenDistance) {
            tableRenderer.paintCue(cueBall, shooting, this.isDraggingCueBall(settingCueBall), settingCueBall, this.isPointerOnCueBall(), ghostScreenPosition, this.cueScreenDistance);
        }
    }

    /**
     *
     * @param {boolean} shooting
     * @returns {Point}
     */
    getScreenGhostPosition(shooting) {
        return this.isDraggingCue(shooting) ? this.dragData.startPosition : this.ghostScreenPosition;
    }

    /**
     *
     * @param {boolean} settingCueBall
     * @returns {Vector}
     */
    getScreenCueBallOffset(settingCueBall) {
        return this.isDraggingCueBall(settingCueBall) ? this.dragData.dragOffset : Vector.create();
    }

    isPointerOnCueBall() {
        return this.mouseOnCueBall;
    }

    /**
     *
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseDown(tableRenderer, cueBall, {shooting, settingCueBall}) {
        if ((!shooting && !settingCueBall) || !this.ghostScreenPosition) {
            return;
        }

        if (settingCueBall && this.mouseOnCueBall) {
            this.dragData = {
                mode: 'cueBall',
                startPosition: this.ghostScreenPosition,
                dragOffset: Vector.create(),
                centerOffset: tableRenderer.getTablePosition(this.ghostScreenPosition).createVectorTo(cueBall.getPosition())
            };
        } else if (shooting) {
            this.dragData = {
                mode: 'cue',
                startPosition: this.ghostScreenPosition,
                dragOffset: Vector.create(),
            };
        }
    }

    /**
     *
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     * @param {boolean} settingCueBall
     */
    handleMouseUp(tableRenderer, cueBall, {settingCueBall}) {
        if (this.isDraggingCueBall(settingCueBall)) {
            this.cueBallPositionChangedCallback({
                position: tableRenderer.getTablePosition(tableRenderer.getScreenPosition(cueBall.getPosition()).translate(this.dragData.dragOffset))
            });
        }
        this.dragData = null;
        this.cueScreenDistance = tableRenderer.getScreenSize(cueBall.getBallRadius());
    }

    /**
     *
     * @param {boolean} shooting
     */
    isDraggingCue(shooting) {
        return shooting && this.dragData && this.dragData.mode === 'cue';
    }

    /**
     *
     * @param {boolean} settingCueBall
     */
    isDraggingCueBall(settingCueBall) {
        return settingCueBall && this.dragData && this.dragData.mode === 'cueBall';
    }

    /**
     *
     * @param event
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseMove(event, tableRenderer, cueBall, {shooting, settingCueBall}) {
        this.ghostScreenPosition = Point.create(event.layerX, event.layerY);
        const cueBallTablePosition = cueBall.getPosition();
        const mouseTablePosition = tableRenderer.getTablePosition(this.ghostScreenPosition);
        this.mouseOnCueBall = this.isDraggingCueBall(settingCueBall) || cueBallTablePosition.getDistance(mouseTablePosition) < cueBall.getBallRadius();

        if (this.cueScreenDistance === null) {
            this.cueScreenDistance = tableRenderer.getScreenSize(cueBall.getBallRadius());
        }

        if (this.isDraggingCue(shooting)) {
            this.handleCueDrag(event, tableRenderer, cueBall);
        } else if (this.isDraggingCueBall(settingCueBall)) {
            this.handleCueBallDrag(event, tableRenderer, cueBall);
        }
    }

    /**
     *
     * @param event
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     */
    handleCueDrag(event, tableRenderer, cueBall) {
        const previousOffset = this.dragData.dragOffset.getY();
        const initialCueScreenDistance = tableRenderer.getScreenSize(cueBall.getBallRadius());
        this.dragData.dragOffset = this.dragData.startPosition.createVectorTo(Point.create(event.layerX, event.layerY));

        if (this.dragData.dragOffset.getY() + initialCueScreenDistance < 0) {
            this.shotFiredCallback({
                speed: cueBall.getPosition().createVectorTo(tableRenderer.getTablePosition(this.dragData.startPosition)).normalize(tableRenderer.getTableSize(previousOffset - this.dragData.dragOffset.getY()))
            });
            this.dragData = null;
            this.cueScreenDistance = initialCueScreenDistance;
        } else {
            this.cueScreenDistance = initialCueScreenDistance + this.dragData.dragOffset.getY();
        }
    }

    /**
     *
     * @param event
     * @param {SnookrRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     */
    handleCueBallDrag(event, tableRenderer, cueBall) {
        const tableNewPosition = tableRenderer.getTablePosition(Point.create(event.layerX, event.layerY)).translate(this.dragData.centerOffset);
        const screenNewPosition = tableRenderer.getScreenPosition(tableNewPosition);
        const tableOldPosition = cueBall.getPosition();
        const screenOldPosition = tableRenderer.getScreenPosition(tableOldPosition);
        const w = screenOldPosition.createVectorTo(screenNewPosition);
        let d = w.getLength();

        do {
            if (this.positionValidator(tableRenderer.getTablePosition(screenOldPosition.translate(w)))) {
                break;
            }
            w.scale((d - 1) / d);
            d = d - 1;
        } while (d > 0);

        this.dragData.dragOffset = w;
    }
}