class SnookrAudioPlayer {
    constructor() {
        const applause1Element = document.querySelector('audio[data-type="applause1"]');
        const applause2Element = document.querySelector('audio[data-type="applause2"]');
        const disappointmentElement = document.querySelector('audio[data-type="disappointment"]');
        const ballElement = document.querySelector('audio[data-type="ball"]');

        this.clips = {
            applause: [
                new AudioClip(applause1Element, 1900),
                new AudioClip(applause2Element, 400),
            ],
            disappointment: new AudioClip(disappointmentElement, 600),
            cueHitsBall: new AudioClip(ballElement, 2400, 300),
            ballHitsBall: new AudioClip(ballElement, 2950, 300),
            ballHitsPocket: new AudioClip(ballElement, 3300, 300),
        };
    }

    playApplause() {
        const applauseAudioClips = this.clips.applause;
        applauseAudioClips[Math.floor(Math.random() * applauseAudioClips.length)].play(0.1);
    }

    playDisappointment() {
        this.clips.disappointment.play(0.1);
    }

    playCueHitsBall(shotPower) {
        this.clips.cueHitsBall.play(Math.min(1, shotPower / 5));
    }

    playBallHitsBall(ballHitsBallPower) {
        this.clips.ballHitsBall.play(Math.min(1, ballHitsBallPower / 5));
    }

    playBallHitsPocket() {
        this.clips.ballHitsPocket.play();
    }
}