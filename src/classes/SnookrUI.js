class SnookrUI {
    constructor(domElement, data = {}) {
        this._domElement = domElement;
        this._children = [];
        this._data = data;

        this.onMount();
        this.updateView();
    }

    mountOrCreateChildren(children) {
        const self = this;
        children.forEach(function (child, index) {
            if (self._children[index]) {
                self._children[index].mount(child.element);
            } else {
                self._children[index] = new child.component(child.element, child.data);
            }
        });
    }

    /**
     *
     * @param {HTMLElement} domElement
     */
    mount(domElement) {
        this._domElement = domElement;
        this.onMount();
        this.updateView();
    }

    onMount() {
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

    dispatchEventToChildren(eventType) {
        const self = this;
        self.getElement().addEventListener(eventType, function () {
            self.getChildren().forEach(childView => childView.getElement().dispatchEvent(new Event(eventType)));
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
