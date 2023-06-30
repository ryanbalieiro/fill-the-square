/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.PopUpNode}
 */
core.PopUpMessage = core.PopUpNode.extend({
    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.Label} **/
    _lblMessage:null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     */
    ctor: function (notifier) {
        this._super(notifier);
        this._createElements();
        this._positionElements();
    },

    /**
     * @param {String} title
     * @param {String} message
     * @param {String} [iconSpriteFrame]
     */
    build: function (title, message, iconSpriteFrame) {
        this._lblTitle.setString(title.toUpperCase());
        this._lblMessage.setString(message);
        this._sprIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(iconSpriteFrame));
        this._positionElements();
    },

    /**
     * @private
     */
    _createElements: function () {
        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(
            core.colorHelpers.getSpriteFrameBasedOnPalette(core.SpriteFramePatterns.POP_UP_BACKGROUND)
        ));
        this._scale9Bg.setCapInsets(cc.rect(80, 80, 80, 80));
        this._scale9Bg.setContentSize(cc.size(800, 450));

        this._lblTitle = new core.Label("", core.Fonts.PATUA_ONE_LARGE, 900, cc.TEXT_ALIGNMENT_CENTER);
        this._lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));

        this._lblMessage = new core.Label("", core.Fonts.PATUA_ONE_SMALL, 670, cc.TEXT_ALIGNMENT_CENTER);
        this._lblMessage.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));

        this._sprIcon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.MetadataSpriteFrames.ICON_SQUARE));

        this.addChild(this._scale9Bg);
        this.addChild(this._lblTitle);
        this.addChild(this._lblMessage);
        this.addChild(this._sprIcon);
    },

    /**
     * @private
     */
    _positionElements: function () {
        this._lblTitle.setScale(0.6);
        this._lblTitle.setPosition(0, 120);

        this._lblMessage.setPosition(0, this._lblTitle.y - 105 - this._lblMessage.getBoundingBoxToWorld().height/4);

        this._sprIcon.setPosition(-360, 200);
        this._sprIcon.setScale(1);
        this._sprIcon.setRotation(0);
        this._sprIcon.setScale(140/this._sprIcon.getBoundingBox().width);
        this._sprIcon.setRotation(-10);
    },

    /**
     * @abstract
     */
    destroy: function () {}
})