/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.InteractiveNode}
 */
core.PopUpNode = core.InteractiveNode.extend({

    /** @type {Function} **/
    _tweenCompletionCallback: null,

    /** @type {String|core.Sounds|*} **/
    _tweenInSound: null,

    /** @type {String|core.Sounds|*} **/
    _tweenOutSound: null,

    /** @type {cc.Point} */
    targetPosition:null,

    /** @type {Number} */
    targetScale:null,

    /**
     * @constructs
     */
    ctor: function (notifier) {
        this._super(notifier);
    },

    /**
     * @param {String|core.Sounds|*} soundUrl
     */
    setTweenInSound: function (soundUrl) {
        this._tweenInSound = soundUrl;
    },

    /**
     * @param {String|core.Sounds|*} soundUrl
     */
    setTweenOutSound: function (soundUrl) {
        this._tweenOutSound = soundUrl;
    },

    /**
     * @override
     */
    tweenIn: function () {
        this.stopAllActions();
        this.getInteractiveLayer().lock();
        if(this._tweenInSound) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, this._tweenInSound);
        }

        this.setCascadeOpacityEnabled(true);
        let dY = cc.winSize.height/1.3;
        this.y -= dY;

        this.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.3, 0, dY).easing(cc.easeSineOut())
            ),
            cc.callFunc(this.onTweenCompleted, this)
        ));
    },

    /**
     * @abstract
     */
    tweenOut: function () {
        this.stopAllActions();
        this.setPosition(this.targetPosition);
        this.getInteractiveLayer().lock();
        if(this._tweenOutSound) {
            this.sceneNotifier.dispatchAfter(0.15, core.GameViewEvent.Types.PLAY_EFFECT, this._tweenOutSound);
        }

        this.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.4, 0, cc.winSize.height/1.3).easing(cc.easeBackIn())
            ),
            cc.callFunc(this.onTweenCompleted, this)
        ))
    },

    /**
     * @public
     */
    onTweenCompleted: function () {
        if(this._tweenCompletionCallback) {
            this._tweenCompletionCallback();
            this._tweenCompletionCallback = null;
        }
    },

    /**
     * @public
     */
    onParentLayerWillResize: function () {
        this.stopAllActions();
    },

    /**
     * @public
     */
    onParentLayerResize: function () {
        this.stopAllActions();
        this.setPosition(this.targetPosition);
        this.setScale(this.targetScale);
        this.onTweenCompleted();
    },

    /**
     * @abstract
     */
    destroy: function () {}
})