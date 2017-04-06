class SnookrGameCommander {
    /**
     *
     * @param snookrGame
     */
    constructor(snookrGame) {
        this.snookrGame = snookrGame;
    }
}



class SnookrGameCommandChangeSideSpin {
    /**
     *
     * @param {nummber} delta
     */
    constructor(delta) {
        this.delta = delta;
    }

    getDelta() {
        return this.delta;
    }
}

class SnookrGameCommandChangeForwardSpin {
    /**
     *
     * @param {nummber} delta
     */
    constructor(delta) {
        this.delta = delta;
    }

    /**
     *
     * @returns {nummber}
     */
    getDelta() {
        return this.delta;
    }
}

class SnookrGameCommandSetSpin {
    /**
     *
     * @param {nummber} forwardSpinValue
     * @param {nummber} sideSpinValue
     */
    constructor(forwardSpinValue, sideSpinValue) {
        this.forwardSpinValue = forwardSpinValue;
        this.sideSpinValue = sideSpinValue;
    }

    /**
     *
     * @returns {nummber}
     */
    getForwardSpinValue() {
        return this.forwardSpinValue;
    }

    /**
     *
     * @returns {nummber}
     */
    getSideSpinValue() {
        return this.sideSpinValue;
    }
}

class SnookrGameCommandPrepareWhitePosition {
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     *
     * @returns {number}
     */
    getY() {
        return this.y;
    }
}

class SnookrGameCommandSetWhitePosition {
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     *
     * @returns {number}
     */
    getY() {
        return this.y;
    }
}

class SnookrGameCommandSetGhostPosition {
    /**
     *
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     *
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     *
     * @returns {number}
     */
    getY() {
        return this.y;
    }
}

class SnookrGameCommandSetCueDistanceAndSpeed {
    /**
     *
     * @param {number} distance
     * @param {number} speed
     */
    constructor(distance, speed) {
        this.distance = distance;
        this.speed = speed;
    }

    /**
     *
     * @returns {number}
     */
    getDistance() {
        return this.distance;
    }

    /**
     *
     * @returns {number}
     */
    getSpeed() {
        return this.speed;
    }
}

class SnookrGameCommandSetTimer {
    /**
     *
     * @param {number} time
     */
    constructor(time) {
        this.time = time;
    }

    /**
     *
     * @returns {number}
     */
    getTime() {
        return this.time;
    }
}

class SnookrGameCommandTick {

}

class SnookrGameCommandRollback {

}

