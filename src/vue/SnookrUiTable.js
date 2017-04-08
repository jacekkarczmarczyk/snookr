"use strict";

const BALL_STROKE_WIDTH = 0.3;
const BALL_STROKE_OFFSET = 0;

Vue.component('snookr-ui-table', {
    template: `
<div class="snookr-ui-table" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false">
    <img class="snookr-table-background" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" />
    <canvas v-bind:style="{cursor: (settingCueBall && mouseOnCueBall) ? 'move' : 'default'}" class="snookr-table-canvas" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" v-on:mousemove="handleMouseMove" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp"></canvas>
    <img class="snookr-table-cue" v-bind:style="cueStyle" src="resources/cue.png" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" />
</div>`,
    props: [
        'playing',
        'shooting',
        'settingCueBall',
        'gameId'
    ],
    data: () => ({
        dragData: null,
        ghostScreenPosition: null,
        cueScreenDistance: null,
        mouseOnCueBall: false,
        cueStyle: {
            display: 'none'
        }
    }),
    created: function () {
        this.resources = null;
        this.scaledResources = {};

        this.$bus.on('snookrEvent.repaintTable', data => data.gameId === this.gameId && this.repaint(data));

        const resourcesFactory = new StaticResourcesFactory(function () {
            const resources = {};
            [].slice.call(document.querySelectorAll('img[data-resource]')).forEach(image => resources[image.getAttribute('data-resource')] = image);
            return resources;
        }());
        resourcesFactory.initResources().then(resources => this.resources = resources);
    },

    mounted: function () {
        this.canvasElement = this.$el.querySelector('canvas');
        this.backgroundElement = this.$el.querySelector('.snookr-table-background');
        this.context = this.canvasElement.getContext('2d');
        this.cueElement = this.$el.querySelector('.snookr-table-cue');
    },

    methods: {
        computeCueStyle: function computeCueStyle() {
            if (!this.cueBall || !this.shooting || this.isDraggingCueBall() || (this.settingCueBall && this.mouseOnCueBall) || !this.ghostScreenPosition) {
                return {
                    display: 'none'
                };
            }

            const cueBallScreenRadius = this.getScreenSize(this.cueBall.getBallRadius());
            const cueTipScreenPosition = this.getScreenPosition(this.cueBall.getPosition());
            const ghostTablePosition = this.getTablePosition(this.isDraggingCue() ? this.dragData.startPosition : this.ghostScreenPosition);

            if (this.cueScreenDistance === null) {
                this.cueScreenDistance = this.getScreenSize(this.cueBall.getBallRadius());
            }

            return {
                display: 'block',
                top: (cueTipScreenPosition.getY() - this.cueElement.offsetHeight / 2) + 'px',
                left: (cueTipScreenPosition.getX() + this.cueScreenDistance + cueBallScreenRadius) + 'px',
                transformOrigin: `-${cueBallScreenRadius + this.cueScreenDistance}px 50%`,
                transform: 'rotate(' + (90 + this.cueBall.getPosition().vectorTo(ghostTablePosition).getAngle() * 180 / Math.PI) + 'deg)',
            };
        },

        handleMouseDown: function handleMouseDown() {
            if (!this.snookr || (!this.shooting && !this.settingCueBall) || !this.ghostScreenPosition) {
                return;
            }

            if (this.settingCueBall && this.mouseOnCueBall) {
                this.dragData = {
                    mode: 'cueBall',
                    startPosition: this.ghostScreenPosition,
                    dragOffset: Vector.create(),
                };
            } else if (this.shooting) {
                this.dragData = {
                    mode: 'cue',
                    startPosition: this.ghostScreenPosition,
                    dragOffset: Vector.create(),
                };
            }
        },

        handleMouseUp: function handleMouseUp() {
            if (this.isDraggingCueBall()) {
                this.$bus.emit('snookrEvent.cueBallPositionChanged', {
                    gameId: this.gameId,
                    position: this.getTablePosition(this.getScreenPosition(this.cueBall.getPosition()).translate(this.dragData.dragOffset))
                });
            }
            this.dragData = null;
            this.cueScreenDistance = null;
        },

        isDraggingCue: function isDraggingCue() {
            return this.shooting && this.dragData && this.dragData.mode === 'cue';
        },

        isDraggingCueBall: function isDraggingCueBall() {
            return this.settingCueBall && this.dragData && this.dragData.mode === 'cueBall';
        },

        handleMouseMove: function handleMouseMove(event) {
            if (!this.snookr) {
                return;
            }

            this.ghostScreenPosition = Point.create(event.layerX, event.layerY);
            const cueBallTablePosition = this.cueBall.getPosition();
            const mouseTablePosition = this.getTablePosition(this.ghostScreenPosition);
            this.mouseOnCueBall = this.isDraggingCueBall() || cueBallTablePosition.getDistance(mouseTablePosition) < this.cueBall.getBallRadius();

            if (this.isDraggingCue()) {
                this.handleCueDrag(event);
            } else if (this.isDraggingCueBall()) {
                this.handleCueBallDrag(event);
            }
        },

        handleCueDrag: function handleCueDrag(event) {
            if (!this.snookr) {
                return;
            }

            const previousOffset = this.dragData.dragOffset.getY();
            const initialCueScreenDistance = this.getScreenSize(this.cueBall.getBallRadius());
            this.dragData.dragOffset = this.dragData.startPosition.vectorTo(Point.create(event.layerX, event.layerY));

            if (this.dragData.dragOffset.getY() + initialCueScreenDistance < 0) {
                this.$bus.emit('snookrEvent.shotFired', {
                    gameId: this.gameId,
                    speed: this.cueBall.getPosition().vectorTo(this.getTablePosition(this.dragData.startPosition)).normalize().scale(this.getTableSize(previousOffset - this.dragData.dragOffset.getY()))
                });

                this.dragData = null;
                this.cueScreenDistance = initialCueScreenDistance;
            } else {
                this.cueScreenDistance = initialCueScreenDistance + this.dragData.dragOffset.getY();
            }
        },

        handleCueBallDrag(event) {
            if (!this.snookr) {
                return;
            }

            this.dragData.dragOffset = this.dragData.startPosition.vectorTo(Point.create(event.layerX, event.layerY));
        },

        repaint: function repaint(data) {
            this.snookr = data.snookr;
            this.cueBall = data.snookr.getCueBall();

            let height = this.$el.offsetHeight;
            let width = height * 1440 / 758;

            if (width > this.$el.offsetWidth) {
                height = height * this.$el.offsetWidth / width;
                width = this.$el.offsetWidth;
            }

            width = Math.round(width);
            height = Math.round(height);

            if (this.backgroundElement.width !== width || this.backgroundElement.height !== height) {
                this.canvasElement.width = `${width}`;
                this.canvasElement.height = `${height}`;
                this.canvasElement.style.width = `${width}px`;
                this.canvasElement.style.height = `${height}px`;

                this.initBackgroundElement();

                this.scaledResources = {};

                this.cueElement.setAttribute('width', this.getScreenSize(this.snookr.getTable().getOuterLength() * 0.4).toFixed(0));
            }

            this.context.clearRect(0, 0, width, height);
            this.snookr.getBallSet().forEach(ball => this.paintBall(ball));
            this.paintGhost();
            this.cueStyle = this.computeCueStyle();
        },

        /**
         *
         * @param {SnookrBall} ball
         */
        paintBall: function paintBall(ball) {
            if (ball.isPotted() || !this.resources) {
                return;
            }

            const canvasBallRadius = this.getScreenSize(ball.getBallRadius());
            let absoluteBallPosition = this.getScreenPosition(ball.getPosition());
            const ballType = ball.getBallType();
            const spritePadding = 2;

            if (ball === this.cueBall && this.isDraggingCueBall()) {
                absoluteBallPosition = absoluteBallPosition.translate(this.dragData.dragOffset);
            }

            if (!this.scaledResources[ballType]) {
                const tmpCanvas = this.$el.ownerDocument.createElement('canvas');
                tmpCanvas.width = canvasBallRadius * 2 + 2 * spritePadding;
                tmpCanvas.height = canvasBallRadius * 2 + 2 * spritePadding;

                const tmpContext = tmpCanvas.getContext('2d');
                tmpContext.drawImage(this.resources.balls[ballType], spritePadding, spritePadding, canvasBallRadius * 2, canvasBallRadius * 2);
                tmpContext.beginPath();
                tmpContext.arc(canvasBallRadius + spritePadding, canvasBallRadius + spritePadding, canvasBallRadius + BALL_STROKE_OFFSET, 0, 2 * Math.PI, false);
                tmpContext.strokeStyle = '#000';
                tmpContext.lineWidth = BALL_STROKE_WIDTH;
                tmpContext.stroke();

                const img = new Image();
                img.width = 2 * canvasBallRadius;
                img.height = 2 * canvasBallRadius;
                img.src = tmpCanvas.toDataURL();
                this.scaledResources[ballType] = img;
            }

            this.context.drawImage(this.scaledResources[ballType], absoluteBallPosition.getX() - canvasBallRadius - spritePadding, absoluteBallPosition.getY() - canvasBallRadius - spritePadding);
            if (ball === this.cueBall && this.settingCueBall) {
                this.context.beginPath();
                this.context.moveTo(absoluteBallPosition.getX(), absoluteBallPosition.getY());

                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY() + canvasBallRadius * 0.6);
                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.2, absoluteBallPosition.getY() + canvasBallRadius * 0.4);
                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.2, absoluteBallPosition.getY() + canvasBallRadius * 0.4);
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY() + canvasBallRadius * 0.6);
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY());

                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY() - canvasBallRadius * 0.6);
                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.2, absoluteBallPosition.getY() - canvasBallRadius * 0.4);
                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.2, absoluteBallPosition.getY() - canvasBallRadius * 0.4);
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY() - canvasBallRadius * 0.6);
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY());

                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.6, absoluteBallPosition.getY());
                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.4, absoluteBallPosition.getY() + canvasBallRadius * 0.2);
                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.4, absoluteBallPosition.getY() - canvasBallRadius * 0.2);
                this.context.lineTo(absoluteBallPosition.getX() + canvasBallRadius * 0.6, absoluteBallPosition.getY());
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY());

                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.6, absoluteBallPosition.getY());
                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.4, absoluteBallPosition.getY() + canvasBallRadius * 0.2);
                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.4, absoluteBallPosition.getY() - canvasBallRadius * 0.2);
                this.context.lineTo(absoluteBallPosition.getX() - canvasBallRadius * 0.6, absoluteBallPosition.getY());
                this.context.lineTo(absoluteBallPosition.getX(), absoluteBallPosition.getY());

                this.context.strokeStyle = this.mouseOnCueBall ? '#aaa' : '#666';
                this.context.lineWidth = 2;
                this.context.stroke();
            }
        },

        paintGhost: function paintGhost() {
            if (!this.ghostScreenPosition || this.mouseOnCueBall || !this.shooting) {
                return;
            }

            const canvasBallRadius = this.getScreenSize(this.cueBall.getBallRadius());
            const ghostScreenPosition = this.isDraggingCue() ? this.dragData.startPosition : this.ghostScreenPosition;

            this.context.beginPath();
            this.context.arc(ghostScreenPosition.getX(), ghostScreenPosition.getY(), canvasBallRadius + BALL_STROKE_OFFSET, 0, 2 * Math.PI, false);
            this.context.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.context.fill();
            this.context.strokeStyle = '#000';
            this.context.lineWidth = BALL_STROKE_WIDTH;
            this.context.stroke();
        },

        initBackgroundElement: function initBackgroundElement() {
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

            this.backgroundElement.src = canvas.toDataURL();
            this.backgroundElement.width = canvas.width;
            this.backgroundElement.height = canvas.height;
        },

        /**
         *
         * @param {Point} tablePosition
         * @returns {Point}
         */
        getScreenPosition: function getScreenPosition(tablePosition) {
            const table = this.snookr.getTable();
            const screenX = (tablePosition.getY() + (table.getOuterLength() - table.getInnerLength()) / 2) * this.canvasElement.width / table.getOuterLength();
            const screenY = this.canvasElement.height - (tablePosition.getX() + (table.getOuterWidth() - table.getInnerWidth()) / 2) * this.canvasElement.height / table.getOuterWidth();
            return Point.create(screenX, screenY);
        },

        /**
         *
         * @param {number} tableSize
         * @returns {number}
         */
        getScreenSize: function getScreenSize(tableSize) {
            const table = this.snookr.getTable();
            return tableSize * this.canvasElement.width / table.getOuterLength();
        },

        /**
         *
         * @param {Point} screenPosition
         * @returns {Point}
         */
        getTablePosition: function getTablePosition(screenPosition) {
            const table = this.snookr.getTable();
            const tableX = (this.canvasElement.height - screenPosition.getY()) * table.getOuterWidth() / this.canvasElement.height - (table.getOuterWidth() - table.getInnerWidth()) / 2;
            const tableY = screenPosition.getX() * table.getOuterLength() / this.canvasElement.width - (table.getOuterLength() - table.getInnerLength()) / 2;
            return Point.create(tableX, tableY);
        },

        /**
         *
         * @param {number} screenSize
         * @returns {number}
         */
        getTableSize: function getTableSize(screenSize) {
            const table = this.snookr.getTable();
            return screenSize * table.getOuterLength() / this.canvasElement.width;
        },
    }
});
