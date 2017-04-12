"use strict";

Vue.component('snookr-ui-spinner-ball', {
    template: '<div class="snookr-ui-spinner-ball" v-on:selectstart="() => false" v-on:dragstart="() => false"><div class="snookr-ui-spinner-ball__ball" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:mouseenter="mouseEnter" v-on:mousemove="mouseMove" v-on:mousedown.self="mouseDownOnBall" v-on:mouseup="endDrag"><div class="snookr-ui-spinner-ball__indicator" v-on:mousedown="mouseDownOnIndicator" v-on:mouseup="endDrag" v-on:selectstart="() => false" v-on:dragstart="() => false" v-bind:style="{ top: (-spinPower.getForwardSpinPower() * 24) + \'px\', left: (spinPower.getSideSpinPower() * 24) + \'px\' }"></div></div></div>',
    props: ['spinPower'],
    data: () => ({}),
    methods: {
        mouseDownOnBall({layerX, layerY, target}) {
            this.spinPower.setPower(-(layerY - target.offsetHeight / 2) / 24, (layerX - target.offsetWidth / 2) / 24);
            this.drag = true;
            return false;
        },

        mouseDownOnIndicator({layerX, layerY, target}) {
            return this.mouseDownOnBall({
                layerX: layerX + target.offsetLeft,
                layerY: layerY + target.offsetTop,
                target: event.target.parentNode
            });
        },

        mouseEnter() {
            this.drag = false;
        },

        mouseMove(event) {
            if (this.drag) {
                if (event.target.classList.contains('snookr-ui-spinner-ball__ball')) {
                    return this.mouseDownOnBall(event);
                } else if (event.target.classList.contains('snookr-ui-spinner-ball__indicator')) {
                    return this.mouseDownOnIndicator(event);
                }
            }
        },

        endDrag() {
            this.drag = false;
            return false;
        }
    }
});
