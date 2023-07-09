/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {core.ResponsiveLayer}
 */
core.GameLayer = core.ResponsiveLayer.extend({
    /** @type {core.GameManager} **/
    gameManager: null,

    /** @type {core.UserManager} **/
    userManager: null,

    /** @type {String} **/
    _displayingThemeId: null,

    /** @type {core.InteractiveLayer} **/
    _topLayer: null,

    /** @type {core.ItemButton} **/
    _itemDragFeedback: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.GameManager} gameManager
     * @param {core.UserManager} userManager
     */
    ctor: function (notifier, gameManager, userManager) {
        this._super();
        this.sceneNotifier = notifier;
        this.gameManager = gameManager;
        this.userManager = userManager;
    },

    /**
     * @override
     */
    onEnter: function () {
        this._super();
        this.skin(false);

        this._itemDragFeedback = new core.ItemButton();
        this._itemDragFeedback.setVisible(false);
        this._itemDragFeedback.setBadgeVisible(false);
        this.addNodeToTopLayer(this._itemDragFeedback);
    },

    /**
     * @private
     */
    enable: function () {
        if(this._shouldUpdateSkin()) {
            this.skin(true);
        }

        this._super();
    },

    /**
     * @param {core.InteractiveLayer} topLayer
     */
    setTopLayer: function (topLayer) {
        this._topLayer = topLayer;
    },

    /**
     * @param {cc.Node} node
     */
    addNodeToTopLayer: function (node) {
        if(this._topLayer) {
            this._topLayer.addChild(node);
        }
        else {
            this.addChild(node);
        }
    },

    /**
     * @public
     */
    skin: function () {
        this._displayingThemeId = this.userManager.getSelectedItem(core.ItemCollectionModel.PresetCategories.THEMES);
    },

    /**
     * @private
     */
    _shouldUpdateSkin: function () {
        return this.userManager.getSelectedItem(core.ItemCollectionModel.PresetCategories.THEMES) !== this._displayingThemeId;
    },

    /**
     * @abstract
     */
    layoutElements: function () {
        this._super();
        this._itemDragFeedback.setVisible(false);
        this._itemDragFeedback.cleanup();

        if(this.isDragging()) {
            this.cancelDrag();
        }
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    pickItem: function (itemModel) {
        if(this._draggingObject)
            return;

        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_GRAB);
        this._itemDragFeedback.setItemModel(itemModel);
        this._itemDragFeedback.setOpacity(230);
        this.startDrag(this._itemDragFeedback);
    },

    /**
     * @param {cc.Node} node
     */
    startDrag: function (node) {
        this._super(node);
        if(node === this._itemDragFeedback) {
            node.setScale(core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens()*0.65);
        }
    },

    /**
     * @public
     */
    stopDrag: function () {
        if(this._draggingObject === this._itemDragFeedback) {
            this._cancelDraggingItemUse();
        }
    },

    /**
     * @public
     * @override
     */
    cancelDrag: function () {
        this._cancelDraggingItemUse();
        this._super();
    },

    /**
     * @protected
     */
    _cancelDraggingItemUse: function () {
        if(this._draggingObject !== this._itemDragFeedback)
            return;

        this._draggingObject = null;
        this._itemDragFeedback.setLocalZOrder(-1);
        this._itemDragFeedback.cleanup();
        this.sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_CANCEL_WHOOSH);

        if(this._topLayer) {
            let boostsHud = this._topLayer.getBoostsHud();
            this._itemDragFeedback.runAction(cc.sequence(
                cc.moveTo(0.2, boostsHud.getBtnToggleGlobalPosition()).easing(cc.easeSineIn()),
                cc.callFunc(boostsHud.bounceBtnToggle, boostsHud),
                cc.hide()
            ));
        }
        else {
            this._draggingObject.cleanup();
            this._draggingObject.setVisible(false);
            this._draggingObject = null;
        }
    }
})