class SnookrHistory {
    constructor() {
        this.history = [];
    }

    /**
     *
     * @param {SnookrHistoryEntry} entry
     */
    push(entry) {
        this.history.push(entry);
        return this;
    }

    /**
     *
     * @returns {SnookrHistoryEntry}
     */
    pop() {
        return this.history.pop();
    }

    /**
     *
     * @returns {SnookrHistory}
     */
    clear() {
        this.history = [];
        return this;
    }

    /**
     *
     * @returns {Number}
     */
    count() {
        return this.history.length;
    }
}