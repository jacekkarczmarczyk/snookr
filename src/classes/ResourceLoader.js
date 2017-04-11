class ResourceLoader {
    /**
     *
     * @param {ResourceNameResolver} resourceNameResolver
     */
    constructor(resourceNameResolver) {
        this._resourceNameResolver = resourceNameResolver;
        this._cache = {};
        this._loadingCount = 0;
        this._loadedCount = 0;
    }

    /**
     *
     * @param {string} resourceName
     * @param {boolean} isMandatory
     * @returns {Promise}
     */
    loadResource(resourceName, isMandatory = true) {
        return new Promise((resolve, reject) => this._loadResourcePromise(resourceName, isMandatory, resolve, reject));
    }

    getCachedResource(resourceName) {
        if (resourceName in this._cache) {
            return this._cache[resourceName];
        }

        throw `Resource "${resourceName}" is not loaded yet`;
    }

    /**
     *
     * @param {Array.<string>} resourceNames
     * @param {boolean} isMandatory
     * @returns {Promise}
     */
    loadResources(resourceNames, isMandatory = true) {
        return Promise.all(resourceNames.map(resourceName => this.loadResource(resourceName, isMandatory)));
    }

    /**
     *
     * @param {string} resourceName
     * @param {boolean} isMandatory
     * @param resolve
     * @param reject
     * @returns {*}
     * @private
     */
    _loadResourcePromise(resourceName, isMandatory, resolve, reject) {
        if (resourceName in this._cache) {
            return this._cache[resourceName];
        }

        const resourceNameResolved = this._resourceNameResolver.resolveResourceName(resourceName);
        if (typeof resourceNameResolved === 'undefined') {
            reject(`Resource name "${resourceName}" cannot be resolved`);
        }

        const resourceImage = new Image();
        resourceImage.src = this._resourceNameResolver.resolveResourceName(resourceName);
        this._loadingCount = this._loadedCount + 1;

        const timeout = window.setTimeout(() => this._resourceLoaded(resourceName, resourceImage, timeout, resolve), 100);

        resourceImage.onload = () => this._resourceLoaded(resourceName, resourceImage, timeout, resolve);
        resourceImage.onerror = () => this._resourceNotLoaded(resourceName, isMandatory, timeout, resolve, reject);
    }

    /**
     *
     * @param {string} resourceName
     * @param {Image} resourceImage
     * @param timeout
     * @param resolve
     * @private
     */
    _resourceLoaded(resourceName, resourceImage, timeout, resolve) {
        window.clearTimeout(timeout);

        this._cache[resourceName] = resourceImage;

        this._loadedCount = this._loadedCount + 1;
        if (this._loadingCount === this._loadedCount) {
            this._loadingCount = 0;
            this._loadedCount = 0;
        }

        resolve(resourceImage);
    }

    /**
     *
     * @param {string} resourceName
     * @param {boolean} isMandatory
     * @param timeout
     * @param resolve
     * @param reject
     * @private
     */
    _resourceNotLoaded(resourceName, isMandatory, timeout, resolve, reject) {
        window.clearTimeout(timeout);

        if (isMandatory) {
            reject(`Failed to load resource "${resourceName}"`);
        } else {
            this._loadingCount = this._loadingCount - 1;
            if (this._loadingCount === this._loadedCount) {
                this._loadingCount = 0;
                this._loadedCount = 0;
            }

            resolve(null);
        }
    }

}
