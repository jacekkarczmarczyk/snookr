class SnookrGameLoader {
    /**
     *
     * @param {ResourceNameResolver} nameResolver
     */
    constructor(nameResolver) {
        this._nameResolver = nameResolver;
    }

    /**
     *
     * @param {string} gameName
     * @returns {Promise.<SnookrGame>}
     */
    load(gameName) {
        return fetch(this._nameResolver.resolveResourceName(gameName))
            .then(response => response.json())
            .then(function (json) {
                const game = new SnookrGame();

                game.setPhysicsSettings(json.physicsSettings);
                game.setBallRandomness(json.ballRandomness);
                game.setTableSize(json.tableSize.width, json.tableSize.length);
                game.setDCenter(Point.create(json.kitchen.center.x, json.kitchen.center.y));
                game.setDRadius(json.kitchen.radius);
                game.setTableBoundaryPoints(json.tableBoundaryPoints.map(point => new SnookrTableBoundaryPoint(point.position.x, point.position.y, point.d)));
                game.setTablePots(json.tablePots.map(pot => new SnookrTablePot(pot.center.x, pot.center.y, pot.radius)));
                game.setBallSet(new SnookrBallSet(json.balls.map(ball => new SnookrBall(ball.radius, ball.type, Point.create(ball.position.x, ball.position.y)))));

                Object.keys(json.resources).forEach(function (resourceName) {
                    if (!json.resources[resourceName]) {
                        delete json.resources[resourceName];
                    }
                });
                const resourceLoader = new ResourceLoader(new ResourceStaticResolver(json.resources));
                game.setResourceLoader(resourceLoader);

                return resourceLoader.loadResources(Object.keys(json.resources)).then(() => game);
            });
    }
}