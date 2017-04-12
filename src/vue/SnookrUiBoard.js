"use strict";

Vue.component('snookr-ui-board', {
    template: `
<div class="snookr-ui-board">
    <snookr-ui-player-panel v-bind:player="gameState.players[0]" v-bind:current="gameState.currentPlayer === 0" v-bind:rule="gameState.currentRule" v-bind:is-snooker="gameState.isSnooker"></snookr-ui-player-panel>
    <div class="snookr-ui-board__frame-count-panel">(7)</div>
    <snookr-ui-player-panel v-bind:player="gameState.players[1]" v-bind:current="gameState.currentPlayer === 1" v-bind:rule="gameState.currentRule" v-bind:is-snooker="gameState.isSnooker"></snookr-ui-player-panel>
    <snookr-ui-spinner-ball v-bind:spin-power="gameState.spinPower"></snookr-ui-spinner-ball>
</div>`,
    props: ['gameState'],
    data: () => ({})
});
