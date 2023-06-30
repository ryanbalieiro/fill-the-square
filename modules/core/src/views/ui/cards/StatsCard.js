/**
 * Created by Ryan Balieiro on 28/08/20.
 * @class
 * @extends {cc.Node}
 */
core.StatsCard = cc.Node.extend({
    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.Label} **/
    _lblName:null,

    /** @type {core.Label} **/
    _lblValue:null,

    /**
     * @constructs
     * @param {cc.Size} dimensions
     */
    ctor: function (dimensions) {
        this._super();

        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.LONG_BUTTON));
        this._scale9Bg.setColor(core.colorHelpers.get(core.ColorHelpers.BACKGROUND));
        this._scale9Bg.setOpacity(155);
        this._scale9Bg.setLocalZOrder(0);
        this._scale9Bg.setContentSize(dimensions);

        this._lblName = new core.Label("NAME", core.Fonts.PATUA_ONE_SMALL, dimensions.width/1.3, cc.TEXT_ALIGNMENT_LEFT);
        this._lblName.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));
        this._lblName.setScale(0.8);
        this._lblName.setAnchorPoint(cc.p(0, 0));

        this._lblValue = new core.Label("0", core.Fonts.PATUA_ONE_SMALL, dimensions.width/2, cc.TEXT_ALIGNMENT_RIGHT);
        this._lblValue.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));
        this._lblValue.setScale(0.9);
        this._lblValue.setAnchorPoint(cc.p(1, 0));

        this.addChild(this._scale9Bg);
        this.addChild(this._lblName);
        this.addChild(this._lblValue);

        this._lblName.setPosition(-dimensions.width/2 + 50, -15);
        this._lblValue.setPosition(dimensions.width/2 - 50, -15);
    },

    /**
     * @param {String} name
     * @param {String|Number} value
     */
    setNameAndValue: function (name, value) {
        this._lblName.setString(name.toUpperCase());
        value = core.mathHelpers.clamp(value, 0, 999999999);
        this._lblValue.setString(value);
    }
})