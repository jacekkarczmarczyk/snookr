class SnookrResourceNameResolver extends ResourceNameResolver {
    constructor() {
        super();
    }

    resolveResourceName(resourceName) {
        return {
            'ball-white': 'resources/ball-white.png',
            'ball-black': 'resources/ball-black.png',
            'ball-pink': 'resources/ball-pink.png',
            'ball-blue': 'resources/ball-blue.png',
            'ball-brown': 'resources/ball-brown.png',
            'ball-green': 'resources/ball-green.png',
            'ball-yellow': 'resources/ball-yellow.png',
            'ball-red': 'resources/ball-red.png',
            'table-canvas': 'resources/canvas.jpg',
            'cue': 'resources/cue.png',
            'funky-table': 'resources/funky-arcade-table.png'
        }[resourceName];
    }
}