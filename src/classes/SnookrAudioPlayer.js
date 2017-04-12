class SnookrAudioPlayer {
    constructor() {
        this.clips = {
            applause: [
                new AudioClip('audio/new/a1.mp3'),
                new AudioClip('audio/new/a2.mp3'),
                new AudioClip('audio/new/a3.mp3'),
                new AudioClip('audio/new/a4.mp3'),
                new AudioClip('audio/new/a5.mp3'),
                new AudioClip('audio/new/a6.mp3'),
                new AudioClip('audio/new/a7.mp3'),
                new AudioClip('audio/new/a8.mp3'),
            ],
            background: new AudioClip('audio/new/background.mp3'),
            disappointment: new AudioClip('audio/disappointment.mp3', 600),
            cueHitsBall: new AudioClip('audio/ball.mp3', 2400, 300),
            ballHitsBall: new AudioClip('audio/ball.mp3', 2950, 300),
            ballHitsPocket: new AudioClip('audio/ball.mp3', 3300, 300),
        };
    }

    playBackgroundSilence() {
        this.clips.background.play(0.4).then(() => this.playBackgroundSilence());
    }

    playApplause() {
        const applauseAudioClips = this.clips.applause;
        applauseAudioClips[Math.floor(Math.random() * applauseAudioClips.length)].play(0.15);
    }

    playDisappointment() {
        this.clips.disappointment.play(0.1);
    }

    playCueHitsBall(shotPower) {
        this.clips.cueHitsBall.play(Math.min(1, shotPower / 2));
    }

    playBallHitsBall(ballHitsBallPower) {
        this.clips.ballHitsBall.play(Math.min(1, ballHitsBallPower / 5));
    }

    playBallHitsPocket() {
        this.clips.ballHitsPocket.play();
    }
}