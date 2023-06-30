/**
 * Created by Ryan Balieiro on 29/08/20.
 * @class
 * @extends {cc.Node}
 */
core.ProgressBar = cc.Node.extend({

    /** @type {core.Sprite} **/
    _sprBackground: null,

    /** @type {core.Sprite} **/
    _sprFill: null,

    /**
     * @constructs
     * @param {Number} width
     * @param {Number} [height=50]
     */
    ctor: function (width, height) {
        this._super();
        height = height || 50;

        this._sprBackground = this._createRect(width, height);
        this._sprBackground.setColor(core.colorHelpers.get(core.ColorHelpers.BLACK));
        this._sprBackground.setOpacity(60);
        this._sprBackground.setScaleX(width/core.ProgressBar.SPRITE_WIDTH);

        this._sprFill = this._createRect(width, height);
        this._sprFill.setColor(core.colorHelpers.get(core.ColorHelpers.GOLD));
        this.setPercentage(30);
    },

    /**
     * @param {Number} width
     * @param {Number} height
     * @returns {core.Sprite}
     */
    _createRect: function (width, height) {
        let rect = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
        rect.setAnchorPoint(cc.p(0, 0.5));
        this.addChild(rect);
        rect.setPositionX(-width/2);
        rect.setScaleY(height/core.ProgressBar.SPRITE_WIDTH);
        return rect;
    },

    /**
     * @param {Number} percentage
     */
    setPercentage: function (percentage) {
        percentage = core.mathHelpers.clamp(percentage, 0, 100);
        this._sprFill.setScaleX(this._sprBackground.getScaleX() * percentage/100);
    }
})

/**
 * @type {number}
 */
core.ProgressBar.SPRITE_WIDTH = 50;