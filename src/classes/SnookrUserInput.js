class SnookrUserInput {
    /**
     *
     * @param {SnookrGame} snookr
     * @param {HTMLElement} domElement
     */
    constructor(snookr, domElement) {
        this.snookr = snookr;
        this.domElement = domElement;
        this.ghostPosition = Point.create();

        this.drag = false;
        this.dragStartOffset = 0;
        this.dragPreviousOffset = 0;
        this.dragSpeedVector = null;

        this.numberOfFrames = 7;
        this.frameNumber = 1;
        this.frameWins = [0, 0];

        this.eventListener = this.snookr.getEventListener();
        this.view = new SnookrCanvasView(domElement.querySelector('.snookr'), this.snookr.getTable());
        this.view.setBallSet(this.snookr.getBallSet());
        this.view.setCueDistance(this.snookr.getInitialCueDistance());
    }

    getDomElement() {
        return this.domElement;
    }

    handleMouseMove(clientX, clientY) {
        const ghostPosition = Point.create(clientX, clientY);

        this.ghostPosition = ghostPosition;
        if (this.drag) {
            this.handleCueDrag(clientY);
        } else if (this.snookr.isInAction()) {
            this.view.setGhostPosition(null);
        } else {
            this.view.setGhostPosition(ghostPosition);
        }
    }

    handleCueDrag(mouseY) {
        if (mouseY - this.dragStartOffset + this.view.getScreenSize(this.snookr.getInitialCueDistance()) < 0) {
            const shotPower = Math.min(this.snookr.getPhysics().getSetting('maxShotPower'), this.view.getTableSize(this.dragPreviousOffset - mouseY));
            const forwardSpinValue = document.querySelector('.snookr-spin-indicator').offsetTop / 25;
            const sideSpinValue = document.querySelector('.snookr-spin-indicator').offsetLeft / 25;
            const speed = this.dragSpeedVector.normalize().scale(shotPower);
            const sideSpin = -sideSpinValue * speed.getLength() * this.snookr.getPhysics().getSetting('sideSpinScale');
            const forwardSpin = speed.scale(-forwardSpinValue * Math.sqrt(speed.getLength() / 5) * this.snookr.getPhysics().getSetting('forwardSpinScale'));
            const movement = new BallMovement(speed, new Spin(forwardSpin, sideSpin));

            this.view.setGhostPosition(null);
            this.eventListener.trigger(SnookrEvent.SHOT_ATTEMPT, movement);
            this.eventListener.trigger(SnookrEvent.CUE_HITS_BALL, shotPower);
            this.drag = false;
        } else {
            this.view.setCueDistance(this.snookr.getInitialCueDistance() + this.view.getTableSize(mouseY - this.dragStartOffset));
            this.dragPreviousOffset = mouseY;
        }
    }

    endCueDrag() {
        this.view.setCueDistance(this.snookr.getInitialCueDistance());
        this.drag = false;
    }

    startCueDrag(mouseY) {
        if (!this.drag) {
            const whiteBall = this.snookr.getBallSet().first('white');

            this.drag = true;
            this.dragPreviousOffset = 0;
            this.dragStartOffset = mouseY;
            this.dragSpeedVector = whiteBall.getPosition().vectorTo(this.view.getTablePosition(this.ghostPosition));
        }
    }

    updateForwardSpin(delta) {
        const spinIndicator = this.domElement.querySelector('.snookr-spin-indicator');
        const oldValue = parseInt(spinIndicator.getAttribute('data-forward-spin'), 10);
        const newValue = Math.min(25, Math.max(-25, oldValue + delta));
        const sideSpinValue = parseInt(spinIndicator.getAttribute('data-side-spin'), 10);
        if (newValue * newValue + sideSpinValue * sideSpinValue > 25 * 25) {
            return;
        }
        spinIndicator.setAttribute('data-forward-spin', newValue.toFixed(0));
        spinIndicator.style.top = newValue + 'px';
    }

    updateSideSpin(delta) {
        const spinIndicator = this.domElement.querySelector('.snookr-spin-indicator');
        const oldValue = parseInt(spinIndicator.getAttribute('data-side-spin'), 10);
        const newValue = Math.min(25, Math.max(-25, oldValue + delta));
        const forwardSpinValue = parseInt(spinIndicator.getAttribute('data-forward-spin'), 10);
        if (newValue * newValue + forwardSpinValue * forwardSpinValue > 25 * 25) {
            return;
        }
        spinIndicator.setAttribute('data-side-spin', newValue.toFixed(0));
        spinIndicator.style.left = newValue + 'px';
    }

    clearSpin() {
        const spinIndicator = this.domElement.querySelector('.snookr-spin-indicator');
        spinIndicator.setAttribute('data-forward-spin', '0');
        spinIndicator.setAttribute('data-side-spin', '0');
        spinIndicator.style.top = 0;
        spinIndicator.style.left = 0;
    }

    handleKey(which, ctrlKey = false) {
        if (!this.snookr.isInAction() && (which === 38 || which === 40)) {
            this.updateForwardSpin(which - 39);
            return false;
        } else if (!this.snookr.isInAction() && (which === 37 || which === 39)) {
            this.updateSideSpin(which - 38);
            return false;
        } else if (which === 90 && ctrlKey) {
            const spinIndicator = document.querySelector('.snookr-spin-indicator');
            spinIndicator.setAttribute('data-forward-spin', '0');
            spinIndicator.setAttribute('data-side-spin', '0');
            spinIndicator.style.top = 0;
            spinIndicator.style.left = 0;
            this.eventListener.trigger(SnookrEvent.ROLLBACK_REQUESTED);
            return false;
        }
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
        const applause1Element = this.domElement.ownerDocument.querySelector('audio[data-type="applause1"]');
        const applause2Element = this.domElement.ownerDocument.querySelector('audio[data-type="applause2"]');
        const disappointmentElement = this.domElement.ownerDocument.querySelector('audio[data-type="disappointment"]');
        const ballElement = this.domElement.ownerDocument.querySelector('audio[data-type="ball"]');
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

        this.eventListener.trigger(SnookrEvent.NEXT_RULE_CHOSEN, nextRules[nextRuleIndex]);
    }

    showScore(score) {
        this.domElement.querySelector('.player-0 .score').innerText = score[0];
        this.domElement.querySelector('.player-1 .score').innerText = score[1];
    }

    showCurrentPlayer(player) {
        this.domElement.querySelector(`.player-${player}`).classList.add('current');
        this.domElement.querySelector(`.player-${1 - player}`).classList.remove('current');
    }

    showRule(rule) {
        const ruleString = rule ? rule.toString() : '&nbsp;';
        this.domElement.querySelector('.player-0 .next-rule').innerHTML = ruleString;
        this.domElement.querySelector('.player-1 .next-rule').innerHTML = ruleString;
    }

    showBreak(breakValue) {
        const breakString = breakValue ? `Break: ${breakValue}` : '&nbsp;'
        this.domElement.querySelector('.player-0 .break').innerHTML = breakString;
        this.domElement.querySelector('.player-1 .break').innerHTML = breakString;
    }

    endGame(score) {
        this.frameWins[0] += 1 * (score[0] > score[1]);
        this.frameWins[1] += 1 * (score[1] > score[0]);
        this.domElement.querySelector('.player-0 .frames-won').innerText = '' + this.frameWins[0];
        this.domElement.querySelector('.player-1 .frames-won').innerText = '' + this.frameWins[1];

        this.snookr.resetGame();

        this.frameNumber = this.frameNumber + 1;
        if (this.frameNumber === this.numberOfFrames + 1) {
            alert('Match over!');
            this.frameNumber = 1;
            this.frameWins = [0, 0];
            this.domElement.querySelector('.player-0 .frames-won').innerText = '0';
            this.domElement.querySelector('.player-1 .frames-won').innerText = '0';
        }
    }

    setSnookerCreated(created) {
        if (created) {
            this.playApplause();
            this.domElement.querySelector('.board').classList.add('snooker')
        } else {
            this.domElement.querySelector('.board').classList.remove('snooker');
        }
    }

    listen() {
        this.domElement.ownerDocument.onkeydown = ({which, ctrlKey}) => this.handleKey(which, ctrlKey);
        this.domElement.ownerDocument.onmousemove = ({clientX, clientY}) => this.handleMouseMove(clientX, clientY);
        this.domElement.ownerDocument.onmousedown = ({clientY}) => this.startCueDrag(clientY);
        this.domElement.ownerDocument.onmouseup = () => this.endCueDrag();
        this.domElement.ownerDocument.ondragstart = () => false;
        this.domElement.ownerDocument.oncontextmenu = () => false;
        window.onresize = () => this.view.resize();
    }

    stop() {
        this.domElement.ownerDocument.onkeydown = () => null;
        this.domElement.ownerDocument.onmousemove = '';
        this.domElement.ownerDocument.onmousedown = '';
        this.domElement.ownerDocument.onmouseup = '';
        this.domElement.ownerDocument.ondragstart = '';
        this.domElement.ownerDocument.oncontextmenu = '';
        window.onresize = '';

        this.snookr = null;
        this.domElement = null;
        this.ghostPosition = Point.create();
        this.eventListener = null;
        this.view = null;
    }

    run() {
        const domElement = this.getDomElement();
        const resourcesFactory = new StaticResourcesFactory(function () {
            const resources = {};
            [].slice.call(domElement.ownerDocument.querySelectorAll('img[data-resource]')).forEach(image => resources[image.getAttribute('data-resource')] = image);
            return resources;
        }());

        this.eventListener.on(SnookrEvent.BALLS_STOPPED, () => this.clearSpin());
        this.eventListener.on(SnookrEvent.BALLS_STOPPED, () => this.view.setGhostPosition(this.ghostPosition));
        this.eventListener.on(SnookrEvent.BALLS_STOPPED, () => this.setSnookerCreated(false));
        this.eventListener.on(SnookrEvent.BALL_POTTED, () => this.playBallHitsPocket());
        this.eventListener.on(SnookrEvent.RIGHT_BALL_POTTED, () => this.playApplause());
        this.eventListener.on(SnookrEvent.WRONG_BALL_POTTED, () => this.playDisappointment());
        this.eventListener.on(SnookrEvent.CUE_HITS_BALL, shotPower => this.playCueHitsBall(shotPower));
        this.eventListener.on(SnookrEvent.BALL_HITS_BALL, ballHitsBallPower => this.playBallHitsBall(ballHitsBallPower));
        this.eventListener.on(SnookrEvent.BALL_HITS_POCKET, () => this.playBallHitsPocket());
        this.eventListener.on(SnookrEvent.REPAINT, gameState => this.view.repaint(gameState, this.ghostPosition));
        this.eventListener.on(SnookrEvent.GAME_OVER, score => this.endGame(score));
        this.eventListener.on(SnookrEvent.NEXT_RULE_CHOICE, nextRules => this.showNextRuleChoiceDialog(nextRules));
        this.eventListener.on(SnookrEvent.SNOOKER_CREATED, () => this.setSnookerCreated(true));
        this.eventListener.on(SnookrEvent.SCORE_CHANGED, score => this.showScore(score));
        this.eventListener.on(SnookrEvent.PLAYER_CHANGED, player => this.showCurrentPlayer(player));
        this.eventListener.on(SnookrEvent.RULE_CHANGED, rule => this.showRule(rule));
        this.eventListener.on(SnookrEvent.BREAK_CHANGED, breakValue => this.showBreak(breakValue));

        this.listen();

        this.view.loadResources(resourcesFactory).then(() => this.snookr.loop()).catch(function (error) {
            console.trace();
            console.log(error);
        });
    }
}

