"use strict";

Vue.component('snookr-ui-table', {
    template: `
<div class="snookr-ui-table" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false">
    <img class="snookr-table-background" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false" />
    <canvas class="snookr-table-canvas" unselectable="on" v-on:selectstart="() => false" v-on:dragstart="() => false" v-on:contextmenu="() => false"></canvas>
    <img style="display: none" class="snookr-table-cue" src="resources/cue.png" />
</div>`,
    props: ['gameId'],
    mounted: function () {
        this.$bus.emit('snookrEvent.tableViewMounted', {
            gameId: this.gameId,
            containerElement: this.$el,
            canvasElement: this.$el.querySelector('canvas'),
            backgroundImageElement: this.$el.querySelector('.snookr-table-background'),
            cueElement: this.$el.querySelector('.snookr-table-cue')
        })
    }
});
