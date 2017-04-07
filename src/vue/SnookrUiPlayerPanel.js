"use strict";

Vue.component('snookr-ui-player-panel', {
    template: `
<div class="snookr-ui-player-panel">
    <div v-bind:class="{ current: current, snookered: isSnooker}">
        <div class="score-container">
            <div class="player-name">{{ player.name }}</div>
            <div class="score">{{ player.score }}</div>
            <div class="frames-won">{{ player.framesWon }}</div>
        </div>
        <div v-show="current" class="break">Break: {{ player.breakValue }}</div>
        <div v-show="current" class="next-rule">{{ rule }}</div>
    </div>
</div>
`,
    props: ['player', 'current', 'isSnooker', 'rule'],
    data: () => ({})
});



