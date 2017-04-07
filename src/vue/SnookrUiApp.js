"use strict";

Vue.component('snookr-ui-app', {
    template: `
<div class="snookr-ui-app">
    <snookr-ui-table v-bind:playing="gameState.currentGameState.playing" v-bind:shooting="gameState.currentGameState.shooting" v-bind:setting-cue-ball="gameState.currentGameState.settingCueBall"></snookr-ui-table>
    <snookr-ui-board v-bind:game-state="gameState"></snookr-ui-board>
</div>
`,
    props: ['gameState'],
    data: () => ({})
});