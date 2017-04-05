class SnookrEventListener {
    constructor() {
        this.handlers = [];
    }

    on(eventName, eventHandler) {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        this.handlers[eventName].push(eventHandler);
        return this;
    }

    trigger(eventName, eventData) {
        if (!this.handlers[eventName]) {
            return;
        }

        this.handlers[eventName].forEach(handler => handler.call(null, eventData));
        return this;
    }
}

