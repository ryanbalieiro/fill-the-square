/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.PopUpMessage}
 */
core.Alert = core.PopUpMessage.extend({
    /** @type {Number} **/
    _duration: null,

    /** @type {Number} **/
    _timeout:null,

    /** @type {String} **/
    _callbackEvent: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     */
    ctor: function (notifier) {
        this._super(notifier);
        this.setTweenInSound(core.Sounds.SFX_ALERT_ERROR);
        this.setTweenOutSound(core.Sounds.SFX_WHOOSH);
    },

    /**
     * @override
     * @param {String} title
     * @param {String} message
     * @param {String} iconSpriteFrame
     * @param {Number} duration
     */
    build: function (title, message, iconSpriteFrame, duration) {
        this._super(title, message, iconSpriteFrame);
        this._duration = duration;
    },

    /**
     * @param event
     */
    setCallbackEvent: function (event) {
        this._callbackEvent = event;
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
        let self = this;
        this.setOpacity(255);
        this._timeout = setTimeout(function () {
            self.tweenOut();
        }, this._duration*1000);
    },

    /**
     * @public
     */
    tweenOut: function () {
        this._tweenCompletionCallback = this._onTweenOutComplete;
        this._super();
    },

    /**
     * @private
     */
    _onTweenOutComplete: function () {
        this.destroy();
        if(this._callbackEvent)
            this.sceneNotifier.dispatch(this._callbackEvent);
    },

    /**
     * @abstract
     */
    destroy: function () {
        if(this._timeout) {
            clearTimeout(this._timeout);
        }
    }
})