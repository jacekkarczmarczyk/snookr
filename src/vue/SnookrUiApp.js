"use strict";

Vue.component('snookr-ui-app', {
    template: '<div class="snookr-ui-app"><snookr-ui-table v-bind:current-game-state="gameState.currentGameState"></snookr-ui-table><snookr-ui-board v-bind:game-state="gameState"></snookr-ui-board></div>',
    props: ['gameState'],
    data: () => ({})
});