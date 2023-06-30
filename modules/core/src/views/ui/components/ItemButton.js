/**
 * Created by Ryan Balieiro on 07/09/20.
 * @class
 * @extends {core.Button}
 */
core.ItemButton = core.Button.extend({
    /** @type {core.ItemModel} **/
    _itemModel: null,

    /** @type {core.DisplayState} **/
    targetState: null,

    /** @type {core.AmountBadge} **/
    _amountBadge: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
        this.targetState = new core.DisplayState();

        this._amountBadge = new core.AmountBadge();
        this._amountBadge.setPosition(140, 10);
        this.addChild(this._amountBadge);
        this.setLocalZOrder(1);
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    setItemModel: function (itemModel) {
        this._itemModel = itemModel;

        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(itemModel.getId() + ".png"));
        this.setScale(1);
        this.setScale(90/this.getBoundingBox().width);

        this.targetState.scale = this.getScaleX();
        this.targetState.opacity = 255;
    },

    /**
     * @return {core.ItemModel}
     */
    getItemModel: function () {
        return this._itemModel;
    },

    /**
     * @param {Boolean} visible
     */
    setBadgeVisible: function (visible) {
        this._amountBadge.setVisible(visible);
    },

    /**
     * @param {Number} value
     */
    setBadgeValue: function (value) {
        this._amountBadge.setAmount(value);
    },

    /**
     * @public
     */
    reset: function () {
        this._itemModel = null;
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
        this.setScale(1);
        this.targetState.position = null;
    }
})