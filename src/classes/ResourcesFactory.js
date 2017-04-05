class StaticResourcesFactory {
    constructor(resources) {
        this.resources = resources;
    }

    initResources() {
        return Promise.all([
            this.fetchCueImage(),
            this.fetchBallImage('white'),
            this.fetchBallImage('red'),
            this.fetchBallImage('yellow'),
            this.fetchBallImage('green'),
            this.fetchBallImage('brown'),
            this.fetchBallImage('blue'),
            this.fetchBallImage('pink'),
            this.fetchBallImage('black')
        ]).then(function (resources) {
            return {
                cue: resources[0],
                balls: {
                    white: resources[1],
                    red: resources[2],
                    yellow: resources[3],
                    green: resources[4],
                    brown: resources[5],
                    blue: resources[6],
                    pink: resources[7],
                    black: resources[8],
                }
            }
        });
    }

    /**
     *
     * @returns {Promise}
     */
    fetchCueImage() {
        return this.fetchImagePromise('cue');
    }

    /**
     *
     * @returns {Promise}
     */
    fetchBallImage(color) {
        return this.fetchImagePromise(`ball-${color}`);
    }

    /**
     *
     * @returns {Promise}
     */
    fetchImagePromise(resourceName) {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (self.resources[resourceName]) {
                resolve(self.resources[resourceName]);
            } else {
                console.trace();
                reject(`Resource "${resourceName}" Not found`);
            }
        });
    }
}
