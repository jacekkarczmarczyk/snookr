class SnookrGameConfigResolver extends ResourceNameResolver {
    constructor() {
        super();
    }

    /**
     *
     * @param {string} resourceName
     * @returns {string}
     */
    resolveResourceName(gameName) {
        return `games/${gameName.replace(/[^a-z]/g, '')}.json`;
    }
}