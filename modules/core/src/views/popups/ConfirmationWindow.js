/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.PopUpMessage}
 */
core.ConfirmationWindow = core.PopUpMessage.extend({
    /** @type {core.LongButton} **/
    _confirmButton: null,

    /** @type {core.LongButton} **/
    _denyButton: null,

    /** @type {String} **/
    _confirmEvent: null,

    /** @type {String} **/
    _denyEvent: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     */
    ctor: function (notifier) {
        this._super(notifier);
        this.setTweenInSound(core.Sounds.SFX_WHOOSH);
    },

    /**
     * @override
     * @param {String} title
     * @param {String} message
     * @param {String|*} iconSpriteFrame
     * @param {String} confirmText
     * @param {String} [denyText=null]
     */
    build: function (title, message, iconSpriteFrame, confirmText, denyText) {
        this._super(title, message, iconSpriteFrame);

        if(denyText) {
            this._confirmButton = new core.LongButton(
                core.colorHelpers.get(core.ColorHelpers.SUCCESS, true),
                core.colorHelpers.get(core.ColorHelpers.SUCCESS),
                confirmText
            );

            this._denyButton = new core.LongButton(
                core.colorHelpers.get(core.ColorHelpers.DANGER, true),
                core.colorHelpers.get(core.ColorHelpers.DANGER),
                denyText
            );

            this.addChild(this._confirmButton);
            this.addChild(this._denyButton);

            this._confirmButton.setPosition(-170, -200);
            this._denyButton.setPosition(170, -200);
            this.buttons.push(this._confirmButton, this._denyButton);
        }
        else {
            this._confirmButton = new core.LongButton(
                core.colorHelpers.get(core.ColorHelpers.INFO, true),
                core.colorHelpers.get(core.ColorHelpers.INFO),
                confirmText
            );
            this.addChild(this._confirmButton);
            this._confirmButton.setPosition(0, -200);
            this.buttons.push(this._confirmButton);
        }
    },

    /**
     * @param confirmEvent
     * @param [denyEvent]
     */
    setCallbackEvents: function (confirmEvent, denyEvent) {
        this._confirmEvent = confirmEvent;
        this._denyEvent = denyEvent;
    },

    /**
     * @override
     */
    tweenIn: function () {
        this._tweenCompletionCallback = this._onTweenInComplete;
        this._super();
    },

    /**
     * @private
     */
    _onTweenInComplete: function () {
        this.setOpacity(255);
        this.getInteractiveLayer().unlock();
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(button === this._confirmButton && this._confirmEvent) {
            this.sceneNotifier.dispatch(this._confirmEvent);
        }

        else if(button === this._denyButton && this._denyEvent) {
            this.sceneNotifier.dispatch(this._denyEvent);
        }
    },

    /**
     * @override
     */
    destroy: function () {}
})