"use strict";

Vue.component('snookr-ui-spinner-ball', {
    template: '<div class="snookr-ui-spinner-ball"><div><div v-bind:style="{ top: (-spinPower.getForwardSpinPower() * 24) + \'px\', left: (spinPower.getSideSpinPower() * 24) + \'px\' }"></div></div></div>',
    props: ['spinPower'],
    data: () => ({})
});
