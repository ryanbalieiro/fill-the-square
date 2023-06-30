/**
 * Created by Ryan Balieiro on 25/08/20.
 * @class
 * @extends {core.Sprite}
 */
core.AmountBadge = core.Sprite.extend({

    /** @type {core.Label} **/
    _lblAmount:null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.CIRCLE_INDICATOR));

        this._lblAmount = new core.Label("0", core.Fonts.PATUA_ONE_SMALL, 50, cc.TEXT_ALIGNMENT_CENTER);
        this._lblAmount.setColor(core.colorHelpers.get(core.ColorHelpers.BACKGROUND));
        this.addChild(this._lblAmount);
        this._lblAmount.setPosition(35, 45);
        this._lblAmount.setScale(0.8);
    },

    /**
     * @param {Number} amount
     */
    setAmount: function (amount) {
        this._lblAmount.setString(amount);
        this._lblAmount.setScale(Math.min(
            0.8,
            0.8 - 0.2*(amount.toString().length - 2)
        ));
    }
})