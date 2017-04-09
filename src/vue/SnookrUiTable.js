"use strict";

Vue.component('snookr-ui-table', {
    template: `
<div class="snookr-ui-table" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false">
    <img class="snookr-table-background" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" />
    <canvas v-bind:style="canvasStyle" class="snookr-table-canvas" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" v-on:mousemove="handleMouseMove" v-on:mousedown="handleMouseDown" v-on:mouseup="handleMouseUp"></canvas>
    <img class="snookr-table-cue" src="resources/cue.png" />
</div>`,
    props: ['playing', 'shooting', 'settingCueBall', 'gameId'],
    created: function () {
        const self = this;
        this.$bus.on('snookrEvent.repaintTable', function ({gameId, tableController}) {
            if (gameId === self.gameId) {
                this.tableController = tableController;
                tableController.getTableRenderer().mount(self.$el, self.canvasElement, self.backgroundImageElement, self.cueElement);
                tableController.repaint(self.$props);
            }
        });
    },

    mounted: function () {
        this.canvasElement = this.$el.querySelector('canvas');
        this.backgroundImageElement = this.$el.querySelector('.snookr-table-background');
        this.context = this.canvasElement.getContext('2d');
        this.cueElement = this.$el.querySelector('.snookr-table-cue');
    },

    computed: {
        canvasStyle: function () {
            return {
                cursor: (this.tableController && this.settingCueBall && this.tableController.isPointerOnCueBall()) ? 'move' : 'default'
            };
        }
    },

    methods: {
        handleMouseDown: function handleMouseDown() {
            this.tableController && this.tableController.handleMouseDown(this.$props);
        },

        handleMouseUp: function handleMouseUp() {
            this.tableController && this.tableController.handleMouseUp(this.$props);
        },

        handleMouseMove: function handleMouseMove(event) {
            this.tableController && this.tableController.handleMouseMove(event, this.$props);
        }
    }
});
