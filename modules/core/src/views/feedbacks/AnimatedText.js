/**
 * Created by Ryan Balieiro on 03/09/20.
 * @class
 * @extends {cc.Node}
 */
core.AnimatedText = cc.Node.extend({
    /** @type {core.Label} **/
    _lbl:null,

    /** @type {cc.Point} **/
    _initialPosition: null,

    /** @type {Number} **/
    _scaleFactor: null,

    /** @type {core.AnimatedText.AnimationTypes} **/
    _animationType: null,
    
    /** @type {Number} **/
    _jumpHeight: null,

    /** @type {Number} **/
    _targetScale: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
        this._lbl = new core.Label("99", core.Fonts.PATUA_ONE_LARGE, 950, cc.TEXT_ALIGNMENT_CENTER);
        this.addChild(this._lbl);
        this.setCascadeOpacityEnabled(true);
    },

    /**
     * @param {String} string
     * @param {cc.Point} initialPosition
     * @param {Number} scaleFactor
     * @param {Number} jumpHeight
     * @param {Number} targetScale
     */
    buildForPopping: function (string, initialPosition, scaleFactor, jumpHeight, targetScale) {
        this._lbl.setString(string);
        this._scaleFactor = scaleFactor;
        this._initialPosition = initialPosition;

        this._jumpHeight = jumpHeight;
        this._targetScale = targetScale;
        this._animationType = core.AnimatedText.AnimationTypes.POPPING;

        this.reset();
    },

    /**
     * @public
     */
    reset: function () {
        this.cleanup();

        this.setVisible(false);
        this.setOpacity(0);

        this.setPosition(this._initialPosition);
        this.setScale(this._scaleFactor);
    },

    /**
     * @public
     */
    play: function () {
        this.reset();
        this.setVisible(true);

        switch(this._animationType) {
            case core.AnimatedText.AnimationTypes.POPPING:
                this._playPopAnimation();
                break;
        }
    },

    /**
     * @private
     */
    _playPopAnimation: function () {
        this.runAction(cc.spawn(
            cc.moveBy(0.5, 0, this._jumpHeight, 1).easing(cc.easeSineOut()),

            cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.1, this._targetScale, this._targetScale),
                    cc.fadeTo(0.1, 200),
                ),
                cc.delayTime(0.4),
                cc.fadeOut(0.2)
            )
        ));
    },

    /**
     * @public
     */
    destroy: function () {
        this.cleanup();
        this.setVisible(false);
    }
})

/**
 * @enum
 */
core.AnimatedText.AnimationTypes = {
    POPPING: "popping"
}