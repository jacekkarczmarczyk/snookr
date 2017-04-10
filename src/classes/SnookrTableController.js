class SnookrTableController {
    /**
     *
     * @param {SnookrRenderer} tableRenderer
     * @param shotFiredCallback
     * @param cueBallPositionChangedCallback
     */
    constructor(tableRenderer, {shotFiredCallback, cueBallPositionChangedCallback}) {
        this.tableRenderer = tableRenderer;
        this.shotFiredCallback = shotFiredCallback;
        this.cueBallPositionChangedCallback = cueBallPositionChangedCallback;
        this.ghostScreenPosition = null;
        this.dragData = null;
        this.cueScreenDistance = null;
        this.mouseOnCueBall = false;
    }

    /**
     *
     * @returns {SnookrRenderer}
     */
    getTableRenderer() {
        return this.tableRenderer;
    }

    /**
     *
     * @param {SnookrBallSet} ballSet
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    repaint(ballSet, cueBall, {shooting, settingCueBall}) {
        const screenCueBallOffset = this.getScreenCueBallOffset(settingCueBall);
        const ghostScreenPosition = this.getScreenGhostPosition(shooting);

        this.getTableRenderer().invalidateCanvasSize();
        this.getTableRenderer().paintCanvas(ballSet, cueBall, ghostScreenPosition, shooting, settingCueBall, screenCueBallOffset, this.isPointerOnCueBall());
        if (this.cueScreenDistance) {
            this.getTableRenderer().paintCue(cueBall, shooting, this.isDraggingCueBall(settingCueBall), settingCueBall, this.isPointerOnCueBall(), ghostScreenPosition, this.cueScreenDistance);
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
     * @param {SnookrBall} cueBall
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseDown(cueBall, {shooting, settingCueBall}) {
        if ((!shooting && !settingCueBall) || !this.ghostScreenPosition) {
            return;
        }

        if (settingCueBall && this.mouseOnCueBall) {
            this.dragData = {
                mode: 'cueBall',
                startPosition: this.ghostScreenPosition,
                dragOffset: Vector.create(),
                centerOffset: this.tableRenderer.getTablePosition(this.ghostScreenPosition).createVectorTo(cueBall.getPosition())
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
     * @param {SnookrBall} cueBall
     * @param {boolean} settingCueBall
     */
    handleMouseUp(cueBall, {settingCueBall}) {
        if (this.isDraggingCueBall(settingCueBall)) {
            this.cueBallPositionChangedCallback({
                position: this.tableRenderer.getTablePosition(this.tableRenderer.getScreenPosition(cueBall.getPosition()).translate(this.dragData.dragOffset))
            });
        }
        this.dragData = null;
        this.cueScreenDistance = this.tableRenderer.getScreenSize(cueBall.getBallRadius());
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
     * @param {SnookrBall} cueBall
     * @param {SnookrBallSet} ballSet
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseMove(event, cueBall, ballSet, {shooting, settingCueBall}) {
        this.ghostScreenPosition = Point.create(event.layerX, event.layerY);
        const cueBallTablePosition = cueBall.getPosition();
        const mouseTablePosition = this.tableRenderer.getTablePosition(this.ghostScreenPosition);
        this.mouseOnCueBall = this.isDraggingCueBall(settingCueBall) || cueBallTablePosition.getDistance(mouseTablePosition) < cueBall.getBallRadius();

        if (this.cueScreenDistance === null) {
            this.cueScreenDistance = this.tableRenderer.getScreenSize(cueBall.getBallRadius());
        }

        if (this.isDraggingCue(shooting)) {
            this.handleCueDrag(event, cueBall);
        } else if (this.isDraggingCueBall(settingCueBall)) {
            this.handleCueBallDrag(event, cueBall, ballSet);
        }
    }

    /**
     *
     * @param event
     * @param {SnookrBall} cueBall
     */
    handleCueDrag(event, cueBall) {
        const previousOffset = this.dragData.dragOffset.getY();
        const initialCueScreenDistance = this.tableRenderer.getScreenSize(cueBall.getBallRadius());
        this.dragData.dragOffset = this.dragData.startPosition.createVectorTo(Point.create(event.layerX, event.layerY));

        if (this.dragData.dragOffset.getY() + initialCueScreenDistance < 0) {
            this.shotFiredCallback({
                speed: cueBall.getPosition().createVectorTo(this.tableRenderer.getTablePosition(this.dragData.startPosition)).normalize(this.tableRenderer.getTableSize(previousOffset - this.dragData.dragOffset.getY()))
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
     * @param {SnookrBall} cueBall
     * @param {SnookrBallSet} ballSet
     */
    handleCueBallDrag(event, cueBall, ballSet) {
        const tableNewPosition = this.tableRenderer.getTablePosition(Point.create(event.layerX, event.layerY)).translate(this.dragData.centerOffset);
        const screenNewPosition = this.tableRenderer.getScreenPosition(tableNewPosition);
        const tableOldPosition = cueBall.getPosition();
        const screenOldPosition = this.tableRenderer.getScreenPosition(tableOldPosition);

        const check = function (position) {
            if (!this.tableRenderer.getTable().isInCueBallArea(position)) {
                return false;
            }
            return ballSet.unpotted().not(cueBall).map(ball => ball.getPosition().getDistance(position) >= ball.getBallRadius() + cueBall.getBallRadius()).reduce((carry, item) => carry && item, true);
        }.bind(this);

        const w = screenOldPosition.createVectorTo(screenNewPosition);
        let d = w.getLength();

        do {
            if (check(this.tableRenderer.getTablePosition(screenOldPosition.translate(w)))) {
                break;
            }
            w.scale((d - 1) / d);
            d = d - 1;
        } while (d > 0);

        this.dragData.dragOffset = w;
    }
}