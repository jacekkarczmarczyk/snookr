class SnookrUserInput {
    static listen(eventListener, view, snookrGame) {
        let drag = false;
        let dragStartOffset = 0;
        let dragPreviousOffset = 0;

        window.onmousemove = function (event) {
            if (!drag) {
                eventListener.trigger(SnookrEvent.MOUSE_MOVED, view.getTablePosition(Point.create(event.clientX, event.clientY)));
            } else if (event.clientY - dragStartOffset + view.getScreenSize(snookrGame.getInitialCueDistance()) < 0) {
                eventListener.trigger(SnookrEvent.SHOT_ATTEMPT, {
                    shotPower: view.getTableSize(dragPreviousOffset - event.clientY),
                    forwardSpinValue: -document.querySelector('.snookr-spin-indicator').offsetTop / 27,
                    sideSpinValue: document.querySelector('.snookr-spin-indicator').offsetLeft / 27,
                });
                eventListener.trigger(SnookrEvent.CUE_HITS_BALL);
                drag = false;
            } else {
                eventListener.trigger(SnookrEvent.CUE_DRAG, snookrGame.getInitialCueDistance() + view.getTableSize(event.clientY - dragStartOffset));
                dragPreviousOffset = event.clientY;
            }
        };

        window.onmousedown = function (event) {
            if (!drag) {
                drag = true;
                dragPreviousOffset = 0;
                dragStartOffset = event.clientY;
            }
        };

        window.onmouseup = function (event) {
            eventListener.trigger(SnookrEvent.CUE_DRAG_END, view.getTableSize(event.clientY - dragStartOffset));
            drag = false;
        };

        document.body.onkeydown = function (event) {
            if (event.which === 38 || event.which === 40) {
                const spinIndicator = document.querySelector('.snookr-spin-indicator');
                const newValue = Math.min(27, Math.max(-27, spinIndicator.offsetTop - (39 - event.which)));
                const sideSpinValue = spinIndicator.offsetLeft;
                if (newValue * newValue + sideSpinValue * sideSpinValue > 27 * 27) {
                    return;
                }
                spinIndicator.style.top = newValue + 'px';
            }
            if (event.which === 37 || event.which === 39) {
                const spinIndicator = document.querySelector('.snookr-spin-indicator');
                const newValue = Math.min(27, Math.max(-27, spinIndicator.offsetLeft - (38 - event.which)));
                const forwardSpinValue = spinIndicator.offsetTop;
                if (newValue * newValue + forwardSpinValue * forwardSpinValue > 27 * 27) {
                    return;
                }
                spinIndicator.style.left = newValue + 'px';
            }
        };

        window.ondragstart = () => false;

        window.oncontextmenu = () => false;

        window.onresize = () => view.resize();
    }

    static playApplause() {
        const applauseAudioClips = SnookrUserInput.getAudioClips().applause;
        window.setTimeout(() => applauseAudioClips[Math.floor(Math.random() * applauseAudioClips.length)].play(), 200);
    }

    static playDisappointment() {
        SnookrUserInput.getAudioClips().disappointment.play(0.1);
    }

    static playCueHitsBall() {
        SnookrUserInput.getAudioClips().cueHitsBall.play();
    }

    static playBallHitsBall() {
        const now = Date.now();
        const audioClip = SnookrUserInput.getAudioClips().ballHitsBall;

        if (now - SnookrUserInput.lastPlayed < 50) {
            return;
        }

        SnookrUserInput.lastPlayed = now;
        audioClip.play();
    }

    static playBallHitsPocket() {
        SnookrUserInput.getAudioClips().ballHitsPocket.play();
    }

    /**
     *
     */
    static getAudioClips() {
        const applauseElement = document.querySelector('audio[data-type="applause1"]');
        const disappointmentElement = document.querySelector('audio[data-type="disappointment"]');
        const ballElement = document.querySelector('audio[data-type="ball"]');
        return {
            applause: [
                new AudioClip(applauseElement, 1000),
            ],
            disappointment: new AudioClip(disappointmentElement, 600),
            cueHitsBall: new AudioClip(ballElement, 2400, 300),
            ballHitsBall: new AudioClip(ballElement, 2950, 300),
            ballHitsPocket: new AudioClip(ballElement, 3300, 300),
        };
    }

    static createGame(domElement) {
        let snookr;
        switch (document.location.hash) {
            case '#test':
                snookr = new SnookrGameTest();
                break;
            case '#arcade':
                snookr = new SnookrGameArcade();
                break;
            case '#regular':
                snookr = new SnookrGameRegular();
                break;
            case '#real':
                snookr = new SnookrGameReal();
                break;
            default:
                snookr = new SnookrGameArcade();
                break;
        }

        const eventListener = snookr.getEventListener();
        const view = new SnookrCanvasView(domElement, snookr.getTable());
        const resourcesFactory = new StaticResourcesFactory(function () {
            const resources = {};
            [].slice.call(domElement.ownerDocument.querySelectorAll('img[data-resource]')).forEach(image => resources[image.getAttribute('data-resource')] = image);
            return resources;
        }());

        const numberOfFrames = 7;
        let frameNumber = 1;
        let frameWins = [0, 0];

        SnookrUserInput.listen(eventListener, view, snookr);
        eventListener.on(SnookrEvent.BALLS_STOPPED, function () {
            document.querySelector('.snookr-spin-indicator').style.top = 0;
            document.querySelector('.snookr-spin-indicator').style.left = 0;
        });

        eventListener.on(SnookrEvent.BALL_POTTED, () => SnookrUserInput.playBallHitsPocket());
        eventListener.on(SnookrEvent.RIGHT_BALL_POTTED, () => SnookrUserInput.playApplause());
        eventListener.on(SnookrEvent.WRONG_BALL_POTTED, () => SnookrUserInput.playDisappointment());
        eventListener.on(SnookrEvent.CUE_HITS_BALL, () => SnookrUserInput.playCueHitsBall());
        eventListener.on(SnookrEvent.BALL_HITS_BALL, () => SnookrUserInput.playBallHitsBall());
        eventListener.on(SnookrEvent.BALL_HITS_POCKET, () => SnookrUserInput.playBallHitsPocket());

        eventListener.on(SnookrEvent.REPAINT, gameState => view.repaint(gameState));
        eventListener.on(SnookrEvent.GAME_OVER, function (score) {
            window.setTimeout(function () {
                frameWins[0] += 1 * (score[0] > score[1]);
                frameWins[1] += 1 * (score[1] > score[0]);
                document.querySelector('.player-0 .frames-won').innerText = '' + frameWins[0];
                document.querySelector('.player-1 .frames-won').innerText = '' + frameWins[1];

                snookr.resetGame();

                frameNumber = frameNumber + 1;
                if (frameNumber === numberOfFrames + 1) {
                    window.setTimeout(function () {
                        alert('Match over!');
                        frameNumber = 1;
                        frameWins = [0, 0];
                        document.querySelector('.player-0 .frames-won').innerText = '0';
                        document.querySelector('.player-1 .frames-won').innerText = '0';
                    }, 0);
                }
            });
        });
        eventListener.on(SnookrEvent.NEXT_RULE_CHOICE, function (nextRules) {
            window.setTimeout(function () {
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

                eventListener.trigger(SnookrEvent.NEXT_RULE_CHOSEN, nextRules[nextRuleIndex]);
            });
        });
        eventListener.on(SnookrEvent.SNOOKER_CREATED, function () {
            SnookrUserInput.playApplause();
            document.querySelector('.board').classList.add('snooker');
        });
        eventListener.on(SnookrEvent.SCORE_CHANGED, function (score) {
            document.querySelector('.player-0 .score').innerText = score[0];
            document.querySelector('.player-1 .score').innerText = score[1];
        });
        eventListener.on(SnookrEvent.PLAYER_CHANGED, function (player) {
            document.querySelector(`.player-${player}`).classList.add('current');
            document.querySelector(`.player-${1 - player}`).classList.remove('current');
            document.querySelector('.board').classList.remove('snooker');
        });
        eventListener.on(SnookrEvent.RULE_CHANGED, function (rule) {
            for (let player = 0; player < 2; player++) {
                const nextRuleElement = document.querySelector(`.player-${player}`);
                nextRuleElement.querySelector('.next-rule').innerHTML = (rule && nextRuleElement.classList.contains('current')) ? rule.toString() : '&nbsp;';
            }
        });
        eventListener.on(SnookrEvent.BREAK_CHANGED, function (breakValue) {
            for (let player = 0; player < 2; player++) {
                const playerElement = document.querySelector(`.player-${player}`);
                playerElement.querySelector('.break').innerHTML = (breakValue && playerElement.classList.contains('current')) ? `Break: ${breakValue}` : '&nbsp;';
            }
        });

        view.loadResources(resourcesFactory).then(() => snookr.loop()).catch(function (error) {
            console.trace();
            console.log(error);
        });
    }
}

