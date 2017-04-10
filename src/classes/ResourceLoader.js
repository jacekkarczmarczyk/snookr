class ResourceLoader {
    /**
     *
     * @param {ResourceNameResolver} resourceNameResolver
     */
    constructor(resourceNameResolver) {
        this.resourceNameResolver = resourceNameResolver;
        this.cache = {};
        this.loadingCount = 0;
        this.loadedCount = 0;
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
        if (resourceName in this.cache) {
            return this.cache[resourceName];
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
        if (resourceName in this.cache) {
            return this.cache[resourceName];
        }

        const resourceNameResolved = this.resourceNameResolver.resolveResourceName(resourceName);
        if (typeof resourceNameResolved === 'undefined') {
            reject(`Resource name "${resourceName}" cannot be resolved`);
        }

        const resourceImage = new Image();
        resourceImage.src = this.resourceNameResolver.resolveResourceName(resourceName);
        this.loadingCount = this.loadedCount + 1;

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

        this.cache[resourceName] = resourceImage;

        this.loadedCount = this.loadedCount + 1;
        if (this.loadingCount === this.loadedCount) {
            this.loadingCount = 0;
            this.loadedCount = 0;
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
            this.loadingCount = this.loadingCount - 1;
            if (this.loadingCount === this.loadedCount) {
                this.loadingCount = 0;
                this.loadedCount = 0;
            }

            resolve(null);
        }
    }

}
