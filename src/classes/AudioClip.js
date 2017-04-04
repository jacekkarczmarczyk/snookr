/**
 * Immutable data object
 */
class AudioClip {
    constructor(domElement, start = 0, length = 0) {
        this.domElement = domElement;
        this.start = start / 1000;
        this.length = length;
    }

    play(volume = 1) {
        let audio = this.domElement.ownerDocument.createElement('audio');

        audio.src = this.domElement.getAttribute('src');
        audio.volume = volume;
        audio.currentTime = this.start;
        audio.play();

        this.length && window.setTimeout(function () {
            audio.pause();
            audio.currentTime = 0;
            audio = null;
        }, this.length);
    }
}