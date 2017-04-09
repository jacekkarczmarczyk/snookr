class SnookrTableController {
    /**
     *
     * @param {SnookrTableRenderer} tableRenderer
     * @param {SnookrBall} cueBall
     * @param $bus
     * @param {string} gameId
     */
    constructor(tableRenderer, cueBall, $bus, gameId) {
        this.tableRenderer = tableRenderer;
        this.cueBall = cueBall;
        this.$bus = $bus;
        this.gameId = gameId;
        this.ghostScreenPosition = null;
        this.dragData = null;
        this.cueScreenDistance = 0; //this.tableRenderer.getScreenSize(this.cueBall.getBallRadius());
        this.mouseOnCueBall = false;
    }

    /**
     *
     * @returns {SnookrTableRenderer}
     */
    getTableRenderer() {
        return this.tableRenderer;
    }

    /**
     *
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    repaint({shooting, settingCueBall}) {
        const screenCueBallOffset = this.getScreenCueBallOffset(settingCueBall);
        const ghostScreenPosition = this.getScreenGhostPosition(shooting);

        this.getTableRenderer().paintCanvas(ghostScreenPosition, shooting, settingCueBall, screenCueBallOffset, this.isPointerOnCueBall());
        this.getTableRenderer().paintCue(shooting, this.isDraggingCueBall(settingCueBall), settingCueBall, this.isPointerOnCueBall(), ghostScreenPosition, this.getCueScreenDistance());
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

    /**
     *
     * @returns {number}
     */
    getCueScreenDistance() {
        return this.cueScreenDistance;
    }

    isPointerOnCueBall() {
        return this.mouseOnCueBall;
    }

    /**
     *
     * @param {boolean} playing
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseDown({shooting, settingCueBall}) {
        if ((!shooting && !settingCueBall) || !this.ghostScreenPosition) {
            return;
        }

        if (settingCueBall && this.mouseOnCueBall) {
            this.dragData = {
                mode: 'cueBall',
                startPosition: this.ghostScreenPosition,
                dragOffset: Vector.create(),
                centerOffset: this.tableRenderer.getTablePosition(this.ghostScreenPosition).createVectorTo(this.cueBall.getPosition())
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
     * @param {boolean} settingCueBall
     */
    handleMouseUp({settingCueBall}) {
        if (this.isDraggingCueBall(settingCueBall)) {
            this.$bus.emit('snookrEvent.cueBallPositionChanged', {
                gameId: this.gameId,
                position: this.tableRenderer.getTablePosition(this.tableRenderer.getScreenPosition(this.cueBall.getPosition()).translate(this.dragData.dragOffset))
            });
        }
        this.dragData = null;
        this.cueScreenDistance = this.tableRenderer.getScreenSize(this.cueBall.getBallRadius());
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
     * @param {boolean} shooting
     * @param {boolean} settingCueBall
     */
    handleMouseMove(event, {shooting, settingCueBall}) {
        this.ghostScreenPosition = Point.create(event.layerX, event.layerY);
        const cueBallTablePosition = this.cueBall.getPosition();
        const mouseTablePosition = this.tableRenderer.getTablePosition(this.ghostScreenPosition);
        this.mouseOnCueBall = this.isDraggingCueBall(settingCueBall) || cueBallTablePosition.getDistance(mouseTablePosition) < this.cueBall.getBallRadius();

        if (this.isDraggingCue(shooting)) {
            this.handleCueDrag(event);
        } else if (this.isDraggingCueBall(settingCueBall)) {
            this.handleCueBallDrag(event);
        }
    }

    /**
     *
     * @param event
     */
    handleCueDrag(event) {
        const previousOffset = this.dragData.dragOffset.getY();
        const initialCueScreenDistance = this.tableRenderer.getScreenSize(this.cueBall.getBallRadius());
        this.dragData.dragOffset = this.dragData.startPosition.createVectorTo(Point.create(event.layerX, event.layerY));

        if (this.dragData.dragOffset.getY() + initialCueScreenDistance < 0) {
            this.$bus.emit('snookrEvent.shotFired', {
                gameId: this.gameId,
                speed: this.cueBall.getPosition().createVectorTo(this.tableRenderer.getTablePosition(this.dragData.startPosition)).normalize(this.tableRenderer.getTableSize(previousOffset - this.dragData.dragOffset.getY()))
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
     */
    handleCueBallDrag(event) {
        const screenPosition = Point.create(event.layerX, event.layerY);
        const tablePosition = this.tableRenderer.getTablePosition(screenPosition).translate(this.dragData.centerOffset);
        if (this.tableRenderer.getTable().isInCueBallArea(tablePosition)) {
            this.dragData.dragOffset = this.dragData.startPosition.createVectorTo(screenPosition);
        }
    }
}