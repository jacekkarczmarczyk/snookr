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
                table: resources[1],
                balls: {
                    white: resources[2],
                    red: resources[3],
                    yellow: resources[4],
                    green: resources[5],
                    brown: resources[6],
                    blue: resources[7],
                    pink: resources[8],
                    black: resources[9],
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
