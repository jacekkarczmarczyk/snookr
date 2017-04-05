class SnookrUI {
    constructor(domElement, data) {
        this._domElement = domElement;
        this._children = [];
        this._data = data;

        this.updateView();
    }

    /**
     *
     * @returns {Array}
     */
    getChildren() {
        return this._children;
    }

    /**
     *
     * @returns {*}
     */
    getData() {
        return this._data;
    }

    dispatchEventToChildren(eventName) {
        const self = this;
        self.getElement().addEventListener(eventName, function (event) {
            self.getChildren().forEach(function (childView) {
                const eventCopy = new Event(event.type);
                eventCopy.which = event.which;
                childView.getElement().dispatchEvent(eventCopy);
            });
        });
    }

    /**
     *
     * @returns {HTMLElement}
     */
    getElement() {
        return this._domElement;
    }

    updateView() {

    }

}
