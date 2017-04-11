class ResourceStaticResolver extends ResourceNameResolver {
    /**
     *
     * @param resolves
     */
    constructor(resolves) {
        super();
        this._resolves = resolves;
    }

    /**
     *
     * @param {string} resourceName
     * @returns {string}
     */
    resolveResourceName(resourceName) {
        return this._resolves[resourceName];
    }
}
