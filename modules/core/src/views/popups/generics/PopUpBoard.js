/**
 * Created by Ryan Balieiro on 28/08/20.
 * @class
 * @extends {core.PopUpNode}
 */
core.PopUpBoard = core.PopUpNode.extend({

    /** @type {cc.Size} **/
    _dimensions: null,

    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.Sprite} **/
    _icon:null,

    /** @type {core.LongButton} **/
    _btnClose: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {cc.Size} dimensions
     * @param {String} title
     */
    ctor: function (notifier, dimensions, title) {
        this._super(notifier);
        this._dimensions = dimensions;

        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(
            core.colorHelpers.getSpriteFrameBasedOnPalette(core.SpriteFramePatterns.POP_UP_BACKGROUND)
        ));
        this._scale9Bg.setCapInsets(cc.rect(80, 80, 80, 80));
        this.addChild(this._scale9Bg);
        this._scale9Bg.setContentSize(dimensions);

        this._lblTitle = new core.Label(title.toUpperCase(), core.Fonts.PATUA_ONE_LARGE, 900, cc.TEXT_ALIGNMENT_CENTER);
        this._lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));
        this._lblTitle.setScale(0.7);
        this._lblTitle.setPositionY(dimensions.height/2 - 120);
        this.addChild(this._lblTitle);
        this.setTweenInSound(core.Sounds.SFX_WHOOSH);
    },

    /**
     * @param {String} title
     * @param {cc.Color} [idleColor]
     * @param {cc.Color} [hoverColor]
     */
    createConfirmButton: function (title, idleColor, hoverColor) {
        this._btnClose = new core.LongButton(
            idleColor || core.colorHelpers.get(core.ColorHelpers.INFO, true),
            hoverColor || core.colorHelpers.get(core.ColorHelpers.INFO),
            title.toUpperCase()
        );

        this._btnClose.setPositionY(-this._dimensions.height/2 + 20);
        this.addChild(this._btnClose);
        this.buttons.push(this._btnClose);
        this._btnClose.setSoundUrl(core.Sounds.SFX_UI_CLAP);
    },

    /**
     * @param {String} spriteFrame
     */
    createIcon: function (spriteFrame) {
        this._icon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(spriteFrame));
        this._icon.setPosition(-this._dimensions.width/2 + 60, this._dimensions.height/2 - 60);
        this.addChild(this._icon);
    },

    /**
     * @override
     */
    tweenIn: function () {
        this._super();
    }

})