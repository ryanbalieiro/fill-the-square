/**
 * Created by Ryan Balieiro on 25/08/20.
 * @class
 * @extends {core.PopUpNode}
 */
core.Shop = core.PopUpNode.extend({
    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.ShopItemCard[]} **/
    _cards:null,

    /** @type {core.SpriteButton} **/
    _btnClose: null,

    /** @type {core.ItemModel[]} **/
    _itemModels: null,

    /** @type {core.UserManager} **/
    userManager: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.UserManager} userManager
     */
    ctor: function (notifier, userManager) {
        this._super(notifier);
        this.userManager = userManager;

        this._lblTitle = new core.Label("-", core.Fonts.PATUA_ONE_LARGE, 900, cc.TEXT_ALIGNMENT_CENTER);
        this._lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));

        this._btnClose = new core.SpriteButton(core.SpriteFrameBundles.CLOSE_BUTTON);
        this._btnClose.setSoundUrl(core.Sounds.SFX_CLICK);

        this.addChild(this._lblTitle);
        this.addChild(this._btnClose);

        this.buttons.push(this._btnClose);
    },

    /**
     * @param {String} title
     * @param {core.ItemModel[]} items
     */
    build: function (title, items) {
        this._cards = [];
        this._itemModels = items;

        this._lblTitle.setString(title.toUpperCase());

        for(let i = 0 ; i < items.length ; i++) {
            let card = new core.ShopItemCard(items[i]);
            this.addChild(card);
            this._cards.push(card);
            this.buttons.push(card.button);
        }

        this.userManager.notifier.addSubscription(this, this.onUserManagerEvent);
        this._updateData();
    },

    /**
     * @public
     */
    onParentLayerWillResize: function () {
        this._super();
        this._updateLayout();
    },

    /**
     * @private
     */
    _updateLayout: function () {
        let usePortraitLayout = core.mathHelpers.isBetween(core.layoutHelpers.getWinProportion(), 0.95, 2.7);
        let scaleFactor = usePortraitLayout ? core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens() : 1;

        this._lblTitle.setScale(0.7*scaleFactor);
        this._btnClose.setScale(scaleFactor);

        /** For some reason, setContentSize isn't working for Canvas mode, so we have to recreate it whenever the screen resizes. **/
        if(this._scale9Bg)
            this._scale9Bg.removeFromParent();
        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(
            core.colorHelpers.getSpriteFrameBasedOnPalette(core.SpriteFramePatterns.POP_UP_BACKGROUND)
        ));
        this._scale9Bg.setCapInsets(cc.rect(80, 80, 80, 80));
        this._scale9Bg.setLocalZOrder(-1);

        if(usePortraitLayout) {
            this._layoutForPortrait();
        }
        else {
            this._layoutForLandscape();
        }

        this.addChild(this._scale9Bg);
    },

    /**
     * @private
     */
    _layoutForPortrait: function () {
        let itemSchema = core.ShopItemCard.PortraitSchema;
        let windowWidth = Math.min(1100,cc.winSize.width*0.95);
        let windowHeight = (itemSchema.HEIGHT + itemSchema.VERTICAL_SPACING)*this._cards.length + itemSchema.VERTICAL_SPACING*4 + 150;
        let horizontalPadding = cc.winSize.width*0.05;
        this._scale9Bg.setContentSize(cc.size(windowWidth, windowHeight));

        this._lblTitle.setPositionY(windowHeight/2 - itemSchema.VERTICAL_SPACING - 75);
        this._btnClose.setPosition(windowWidth/2 - 40, windowHeight/2 - 40);

        for(let i = 0 ; i < this._cards.length ; i++) {
            let card = this._cards[i];
            card.buildForPortrait(windowWidth - horizontalPadding);
            card.x = 0;
            card.y = (this._cards.length/2 - i - 0.5)*(itemSchema.HEIGHT + itemSchema.VERTICAL_SPACING) - 75;
        }
    },

    /**
     * @private
     */
    _layoutForLandscape: function () {
        let itemSchema = core.ShopItemCard.LandscapeSchema;
        let windowWidth = (itemSchema.WIDTH + itemSchema.HORIZONTAL_SPACING)*this._cards.length + itemSchema.HORIZONTAL_SPACING*2;
        let windowHeight = itemSchema.HEIGHT + itemSchema.VERTICAL_SPACING*4 + 150;
        this._scale9Bg.setContentSize(cc.size(windowWidth, windowHeight));

        this._lblTitle.setPositionY(windowHeight/2 - itemSchema.VERTICAL_SPACING - 50);
        this._btnClose.setPosition(windowWidth/2 - 40, windowHeight/2 - 40);

        for(let i = 0 ; i < this._cards.length ; i++) {
            let card = this._cards[i];
            card.buildForLandscape();
            card.x = (i - this._cards.length/2 + 0.5)*(itemSchema.WIDTH + itemSchema.HORIZONTAL_SPACING);
            card.y = - itemSchema.VERTICAL_SPACING;
        }
    },

    /**
     * @override
     */
    tweenIn: function () {
        this._tweenCompletionCallback = this._onTweenInComplete;
        this._super();
    },

    /**
     * @private
     */
    _onTweenInComplete: function () {
        this.setOpacity(255);
        this.getInteractiveLayer().unlock();
    },

    /**
     * @private
     * @param {String} [event]
     * @param {*} [parameter]
     */
    onUserManagerEvent: function (event, parameter) {
        if(event === core.UserManager.Events.CONSUMABLE_ITEMS_CHANGED) {
            let index = this._itemModels.lastIndexOf(parameter);
            this._cards[index].animateForPurchase();
        }

        this._updateData();
    },

    /**
     * @private
     */
    _updateData: function () {
        for(let i = 0 ; i < this._itemModels.length ; i++) {
            let model = this._itemModels[i];
            let card = this._cards[i];

            switch(model.getType()) {
                case core.ItemModel.Types.CONSUMABLE:
                    card.setAmount(this.userManager.getItemAmount(model));
                    card.setPriceButton(model.getPrice(), this.userManager.canAfford(model));
                    break;

                case core.ItemModel.Types.SELECTABLE:
                    card.setAmount(null);
                    let status = this.userManager.getItemStatus(model);

                    if(status === core.ItemWalletModel.SelectableItemStatus.SELECTED)
                        card.setSelectedButton();
                    else if(status === core.ItemWalletModel.SelectableItemStatus.UNLOCKED)
                        card.setSelectButton();
                    else
                        card.setPriceButton(model.getPrice(), this.userManager.canAfford(model));

                    break;
            }
        }
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(button === this._btnClose) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.REQUESTED_RESUME);
            return;
        }

        let shopItem = button.getParent();
        let model = shopItem.model;
        switch(model.getType()) {
            case core.ItemModel.Types.CONSUMABLE:
                if(this.userManager.canAfford(model)) {
                    this.sceneNotifier.dispatch(core.GameViewEvent.Types.BOUGHT_ITEM, model);
                }
                break;

            case core.ItemModel.Types.SELECTABLE:
                let status = this.userManager.getItemStatus(model);
                if(status === core.ItemWalletModel.SelectableItemStatus.LOCKED && this.userManager.canAfford(model)) {
                    this.sceneNotifier.dispatch(core.GameViewEvent.Types.BOUGHT_ITEM, model);
                }
                else if(status === core.ItemWalletModel.SelectableItemStatus.UNLOCKED) {
                    this.sceneNotifier.dispatch(core.GameViewEvent.Types.SELECTED_ITEM, model);
                }
                break;
        }
    },

    /**
     * @abstract
     */
    destroy: function () {
        this.userManager.notifier.removeSubscription(this);
    }
})