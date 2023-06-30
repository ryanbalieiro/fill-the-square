/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {cc.Node}
 */
core.InteractiveNode = cc.Node.extend({
    /** @type {core.Notifier} **/
    sceneNotifier: null,

    /** @type {core.Button[]} **/
    buttons: null,

    /** @type {*} **/
    _touchTarget: null,

    /** @type {cc.Point} **/
    _touchCoords: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     */
    ctor: function (sceneNotifier) {
        this._super();
        this.sceneNotifier = sceneNotifier;
        this.buttons = [];
        this._touchCoords = new cc.Point(0, 0);
    },

    /**
     * @returns {core.InteractiveLayer}
     */
    getInteractiveLayer() {
        return this.getParent();
    },

    /**
     * @abstract
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {},

    /**
     * @public
     */
    setAllTargetsAsIdle: function () {
        for(let i = 0 ; i < this.buttons.length ; i++) {
            this.buttons[i].setStatus(core.Button.Status.IDLE);
        }
    },

    /**
     * @param event
     */
    onMouseDown: function (event) {
        this._touchCoords.x = event.getLocationX();
        this._touchCoords.y = event.getLocationY();

        for(let i = 0 ; i < this.buttons.length ; i++) {
            let button = this.buttons[i];
            if(button.hitTestChecker.contains(this._touchCoords, 10) && button.isEnabled()) {
                button.setStatus(core.Button.Status.PRESSED);
                this._touchTarget = button;
                return;
            }
        }
    },

    /**
     * @param event
     */
    onMouseMove: function (event) {
        if(this._touchTarget) {
            this._onMouseMoveWithTarget(event);
        }
        else {
            this._onMouseMoveWithoutTarget(event);
        }
    },

    /**
     * @param event
     */
    _onMouseMoveWithTarget(event) {
        this._touchCoords.x = event.getLocationX();
        this._touchCoords.y = event.getLocationY();

        if(this._touchTarget instanceof core.Button) {
            if(this._touchTarget.hitTestChecker.contains(this._touchCoords, 0)) {
                this._touchTarget.setStatus(core.Button.Status.PRESSED);
            }
            else {
                this._touchTarget.setStatus(core.Button.Status.IDLE);
            }
        }
    },

    /**
     * @param event
     */
    _onMouseMoveWithoutTarget(event) {
        this._touchCoords.x = event.getLocationX();
        this._touchCoords.y = event.getLocationY();

        for(let i = 0 ; i < this.buttons.length ; i++) {
            let button = this.buttons[i];
            if(button.isEnabled()) {
                if (button.hitTestChecker.contains(this._touchCoords, 0)) {
                    button.setStatus(core.Button.Status.HOVERED);
                } else {
                    button.setStatus(core.Button.Status.IDLE);
                }
            }
        }
    },

    /**
     * @param event
     */
    onMouseUp: function (event) {
        this._touchCoords.x = event.getLocationX();
        this._touchCoords.y = event.getLocationY();
        let pressedButton = null;

        if(this._touchTarget instanceof core.Button) {
            if(this._touchTarget.hitTestChecker.contains(this._touchCoords, 20)) {
                pressedButton = this._touchTarget;
            }

            this._touchTarget.setStatus(core.Button.Status.IDLE);
        }

        this._touchTarget = null;
        this._onMouseMoveWithoutTarget(event);
        if(pressedButton) {
            let soundUrl = pressedButton.getSoundUrl();
            this.onButtonPressed(pressedButton);

            if(soundUrl) {
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, soundUrl);
            }
        }
    }
})