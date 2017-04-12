class AudioClip {
    constructor(src, start = 0, length = 0) {
        this.src = src;
        this.start = start / 1000;
        this.length = length;
    }

    play(volume = 1) {
        let audio = document.createElement('audio');

        audio.src = this.src;
        audio.volume = volume;
        audio.currentTime = this.start;

        const self = this;
        return new Promise(function (resolve) {
            audio.play();
            audio.addEventListener('ended', () => resolve());
            self.length && window.setTimeout(function () {
                audio.pause();
                resolve();
                audio.currentTime = 0;
                audio = null;
            }, self.length);
        });

    }
}