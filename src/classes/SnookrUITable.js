class SnookrUITable extends SnookrUI {
    /**
     *
     * @param {HTMLElement} domElement
     * @param {SnookrGame} snookr
     * @param {SpinPower} spinPower
     */
    constructor(domElement, {snookr, spinPower}) {
        super(domElement, {
            snookr,
            spinPower,
            ghostPosition: Point.create(),
            drag: false,
            dragStartOffset: 0,
            dragPreviousOffset: 0,
            dragSpeedVector: null,
        });

        this.getElement().addEventListener('snookrUI.resize', () => this.view.resize());
        this.getElement().addEventListener('mousemove', ({clientX, clientY}) => this.handleMouseMove(clientX, clientY));
        this.getElement().addEventListener('mousedown', ({clientY}) => this.startCueDrag(clientY));
        this.getElement().addEventListener('mouseup', () => this.endCueDrag());
        this.getElement().addEventListener('dragstart', () => false);
        this.getElement().addEventListener('contextmenu', () => false);

        const resourcesFactory = new StaticResourcesFactory(function () {
            const resources = {};
            [].slice.call(domElement.ownerDocument.querySelectorAll('img[data-resource]')).forEach(image => resources[image.getAttribute('data-resource')] = image);
            return resources;
        }());
        this.getData().snookr.getEventListener().on(SnookrEvent.BALLS_STOPPED, () => this.view.setGhostPosition(this.ghostPosition));
        this.getData().snookr.getEventListener().on(SnookrEvent.BALL_POTTED, () => this.playBallHitsPocket());
        this.getData().snookr.getEventListener().on(SnookrEvent.RIGHT_BALL_POTTED, () => this.playApplause());
        this.getData().snookr.getEventListener().on(SnookrEvent.WRONG_BALL_POTTED, () => this.playDisappointment());
        this.getData().snookr.getEventListener().on(SnookrEvent.BALL_HITS_BALL, ballHitsBallPower => this.playBallHitsBall(ballHitsBallPower));
        this.getData().snookr.getEventListener().on(SnookrEvent.BALL_HITS_POCKET, () => this.playBallHitsPocket());
        this.getData().snookr.getEventListener().on(SnookrEvent.REPAINT, gameState => this.view.repaint(gameState, this.ghostPosition));
        this.getData().snookr.getEventListener().on(SnookrEvent.GAME_OVER, score => this.getData().snookr.resetGame());
        this.getData().snookr.getEventListener().on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.showNextRuleChoiceDialog(nextRules));

        this.view.loadResources(resourcesFactory).then(() => this.getData().snookr.loop());
    }

    updateView() {
        this.view = new SnookrCanvasView(this.getElement(), this.getData().snookr.getTable());
        this.view.setBallSet(this.getData().snookr.getBallSet());
        this.view.setCueDistance(this.getData().snookr.getInitialCueDistance());
    }

    handleMouseMove(clientX, clientY) {
        const ghostPosition = Point.create(clientX, clientY);

        this.ghostPosition = ghostPosition;
        if (this.drag) {
            this.handleCueDrag(clientY);
        } else if (this.getData().snookr.isInAction()) {
            this.view.setGhostPosition(null);
        } else {
            this.view.setGhostPosition(ghostPosition);
        }
    }

    handleCueDrag(mouseY) {
        if (mouseY - this.dragStartOffset + this.view.getScreenSize(this.getData().snookr.getInitialCueDistance()) < 0) {
            const shotPower = Math.min(this.getData().snookr.getPhysics().getSetting('maxShotPower'), this.view.getTableSize(this.dragPreviousOffset - mouseY));
            const speed = this.dragSpeedVector.normalize().scale(shotPower);
            const forwardSpin = speed.scale(-this.getData().spinPower.getForwardSpinPower() * Math.sqrt(speed.getLength() / 5) * this.getData().snookr.getPhysics().getSetting('forwardSpinScale'));
            const sideSpin = -this.getData().spinPower.getSideSpinPower() * speed.getLength() * this.getData().snookr.getPhysics().getSetting('sideSpinScale');
            const movement = new BallMovement(speed, new Spin(forwardSpin, sideSpin));

            this.view.setGhostPosition(null);
            this.playCueHitsBall(shotPower)
            this.drag = false;

            this.getData().snookr.getEventListener().trigger(SnookrEvent.SHOT_ATTEMPT, movement);
        } else {
            this.view.setCueDistance(this.getData().snookr.getInitialCueDistance() + this.view.getTableSize(mouseY - this.dragStartOffset));
            this.dragPreviousOffset = mouseY;
        }
    }

    startCueDrag(mouseY) {
        if (!this.drag) {
            this.drag = true;
            this.dragPreviousOffset = 0;
            this.dragStartOffset = mouseY;
            this.dragSpeedVector = this.getData().snookr.getBallSet().first('white').getPosition().vectorTo(this.view.getTablePosition(this.ghostPosition));
        }
    }

    endCueDrag() {
        this.view.setCueDistance(this.getData().snookr.getInitialCueDistance());
        this.drag = false;
    }

    playApplause() {
        const applauseAudioClips = this.getAudioClips().applause;
        window.setTimeout(() => applauseAudioClips[Math.floor(Math.random() * applauseAudioClips.length)].play(), 200);
    }

    playDisappointment() {
        this.getAudioClips().disappointment.play(0.1);
    }

    playCueHitsBall(shotPower) {
        this.getAudioClips().cueHitsBall.play(Math.min(1, shotPower / 10));
    }

    playBallHitsBall(ballHitsBallPower) {
        this.getAudioClips().ballHitsBall.play(Math.min(1, ballHitsBallPower / 5));
    }

    playBallHitsPocket() {
        this.getAudioClips().ballHitsPocket.play();
    }

    getAudioClips() {
        const applause1Element = this.getElement().ownerDocument.querySelector('audio[data-type="applause1"]');
        const applause2Element = this.getElement().ownerDocument.querySelector('audio[data-type="applause2"]');
        const disappointmentElement = this.getElement().ownerDocument.querySelector('audio[data-type="disappointment"]');
        const ballElement = this.getElement().ownerDocument.querySelector('audio[data-type="ball"]');
        return {
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

    showNextRuleChoiceDialog(nextRules) {
        let nextRuleIndex = 0;

        if (nextRules.length > 1) {
            let text = "What next?";
            nextRules.forEach(function (rule, index) {
                text += "\n" + (index + 1) + ': ' + rule.toString();
            });
            do {
                nextRuleIndex = Math.max(0, (window.prompt(text) >>> 0) - 1);
            } while (nextRuleIndex < 0 || nextRuleIndex >= nextRules.length);
        }

        this.getData().snookr.getEventListener().trigger(SnookrEvent.NEXT_RULE_CHOSEN, nextRules[nextRuleIndex]);
    }
}

