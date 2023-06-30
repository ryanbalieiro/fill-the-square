/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {core.Sprite}
 */
fts.Tile = core.Sprite.extend({
    /** @type {Number} **/
    _colorId: null,

    /** @type {String} **/
    _themeName: null,

    /** @type {core.Sprite} **/
    _feedback: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
        this._createShadow();
    },

    /**
     * @private
     */
    _createShadow: function () {
        this._feedback = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(
            cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT)
        ));

        this._feedback.setAnchorPoint(cc.p(0, 0));
        this.addChild(this._feedback);
        this._feedback.setVisible(false);
    },

    /**
     * @param {String} themeName
     */
    setTheme: function (themeName) {
        if(!themeName)
            return;

        this._themeName = themeName;
        this.setColorId(this._colorId);
    },

    /**
     * @return {String}
     */
    getThemeName: function () {
        return this._themeName;
    },

    /**
     * @param {Boolean} visible
     */
    setShadowVisible: function (visible) {
        this._feedback.cleanup();
        this._feedback.setVisible(visible);

        if(visible) {
            this._feedback.setScale(1.1);
            this._feedback.setPosition(-7, -7);
            this._feedback.setLocalZOrder(-1);
            this._feedback.setOpacity(80);
            this._feedback.setColor(cc.color(155, 155, 155));
            this._feedback.setSpriteFrame(this.getSpriteFrame())
        }
    },

    /**
     * @public
     * @param {Boolean} visible
     */
    setWhiteOverlayVisible: function (visible) {
        this._feedback.cleanup();
        this._feedback.setVisible(visible);
        this.setCascadeOpacityEnabled(visible);

        if(visible) {
            this._feedback.setScale(1);
            this._feedback.setPosition(0, 0);
            this._feedback.setLocalZOrder(2);
            this._feedback.setOpacity(255);

            this._feedback.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(
                core.stringHelpers.getSpriteFrameNameWithSuffix(fts.SpriteFramePatterns.TILE.replace("${theme}", this._themeName), 12)
            ));
        }
    },

    /**
     * @param {Number} duration
     */
    glowDown: function (duration) {
        this.setColorId(0);
        this.setWhiteOverlayVisible(true);
        this._feedback.runAction(cc.fadeOut(duration));
    },

    /**
     * @param {Number} colorId
     */
    setColorId: function (colorId) {
        this._colorId = core.mathHelpers.clamp(colorId, -1, fts.Tile.MAX_COLOR_ID);

        // fallback
        if(this._themeName === null) {
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
            return;
        }

        let spriteFrame = cc.spriteFrameCache.getSpriteFrame(
            core.stringHelpers.getSpriteFrameNameWithSuffix(fts.SpriteFramePatterns.TILE.replace("${theme}", this._themeName), colorId + 2)
        );

        this.setSpriteFrame(spriteFrame);
    },

    /**
     * @return {Number}
     */
    getColorId: function () {
        return this._colorId;
    }
})

/**
 * @type {number}
 */
fts.Tile.MAX_COLOR_ID = 11;

/**
 * @type {number}
 */
fts.Tile.SPACING = 150;