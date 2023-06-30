/**
 * Created by Ryan Balieiro on 25/08/20.
 * @class
 * @extends {cc.Node}
 */
core.ShopItemCard = cc.Node.extend({
    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.ItemModel} */
    model: null,

    /** @type {core.Sprite} **/
    _sprIcon:null,

    /** @type {core.Label} **/
    _lblName:null,

    /** @type {core.Label} **/
    _lblDescription: null,

    /** @type {core.AmountBadge} **/
    _amountBadge: null,

    /** @type {core.LongButton} **/
    button: null,

    /**
     * @constructs
     * @param {core.ItemModel} model
     */
    ctor: function (model) {
        this._super();
        this.model = model;

        this._sprIcon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(model.getId() + ".png"));

        this._lblName = new core.Label(model.getName().toUpperCase(), core.Fonts.PATUA_ONE_SMALL, 100, cc.TEXT_ALIGNMENT_CENTER);
        this._lblName.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY, true));

        this.button = new core.LongButton(
            core.colorHelpers.get(core.ColorHelpers.INFO),
            core.colorHelpers.get(core.ColorHelpers.INFO, true),
            "Button"
        );

        this.button.setStatus(core.Button.Status.DISABLED);

        this._lblDescription = new core.Label(model.getDescription(), core.Fonts.PATUA_ONE_SMALL, 500, cc.TEXT_ALIGNMENT_CENTER);
        this._lblDescription.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));
        this._lblDescription.setOpacity(155);

        this._amountBadge = new core.AmountBadge();
        this._amountBadge.setPosition(140, 10);

        this.addChild(this._sprIcon);
        this.addChild(this._lblName);
        this.addChild(this.button);
        this.addChild(this._lblDescription);
        this._sprIcon.addChild(this._amountBadge);

        this._sprIcon.setLocalZOrder(1);
        this._lblName.setLocalZOrder(1);
        this.button.setLocalZOrder(1);
        this._lblDescription.setLocalZOrder(1);
    },

    /**
     * @public
     * @param {Number} width
     */
    buildForPortrait: function (width) {
        let itemSchema = core.ShopItemCard.PortraitSchema;
        this._rebuildScale9Background();
        this._scale9Bg.setContentSize(cc.size(width, itemSchema.HEIGHT));

        let iconSize = 150;
        this._sprIcon.setScale(1);
        this._sprIcon.setScale(iconSize/this._sprIcon.getBoundingBox().width);

        this._lblName.setBoundingWidth(600);
        this._lblName.setAnchorPoint(cc.p(0,0.5));
        this._lblName.setAlignment(cc.TEXT_ALIGNMENT_LEFT);

        if(core.layoutHelpers.isSmOrHigher()) {
            this._sprIcon.setPosition(-width/2 + iconSize/2 + cc.winSize.width*0.05 - 20, 0);
            this._lblName.setPosition(this._sprIcon.x + iconSize/2 + 45, 60);
            this._lblName.setScale(1);

            this._lblDescription.setPosition(this._lblName.x, this._lblName.y - 75);
            this._lblDescription.setAnchorPoint(cc.p(0,0.5));
            this._lblDescription.setAlignment(cc.TEXT_ALIGNMENT_LEFT);
            this._lblDescription.setScale(0.6);
            this._lblDescription.setBoundingWidth(680);

            this.button.setScale(0.85);
            this.button.setPosition(width/2 - 180, 0);
        }
        else {
            let scaleFactor = Math.max(0.75,core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens());

            this._sprIcon.setPosition(-width/2 + iconSize/2 + cc.winSize.width*0.05 - 30, 30);
            this._lblName.setPosition(this._sprIcon.x + iconSize/2 + 60 - 30/scaleFactor, 70);
            this._lblName.setScale(1*scaleFactor);

            this._lblDescription.setPosition(this._lblName.x, this._lblName.y - 60);
            this._lblDescription.setAnchorPoint(cc.p(0,0.5));
            this._lblDescription.setAlignment(cc.TEXT_ALIGNMENT_LEFT);
            this._lblDescription.setScale(0.6*scaleFactor);
            this._lblDescription.setBoundingWidth(1000*scaleFactor);

            this.button.setScale(0.7*scaleFactor);
            this.button.setPosition(width/2 - 130*scaleFactor, this._lblDescription.y - 83);

            this._sprIcon.setScale(this._sprIcon.getScale()*0.85*scaleFactor);
        }
    },

    /**
     * @public
     */
    buildForLandscape: function () {
        let itemSchema = core.ShopItemCard.LandscapeSchema;

        this._rebuildScale9Background();
        this._scale9Bg.setContentSize(cc.size(itemSchema.WIDTH, itemSchema.HEIGHT));

        let iconSize = 150;
        this._sprIcon.setScale(1);
        this._sprIcon.setScale(iconSize/this._sprIcon.getBoundingBox().width);
        this._sprIcon.setPosition(0, itemSchema.HEIGHT/2 - 120);

        this._lblName.setBoundingWidth(itemSchema.WIDTH);
        this._lblName.setScale(0.9);
        this._lblName.setPosition(0, this._sprIcon.y - iconSize/2 - 50);
        this._lblName.setAnchorPoint(cc.p(0.5,0.5));
        this._lblName.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._lblDescription.setPosition(0, this._lblName.y - 100);
        this._lblDescription.setScale(0.65);
        this._lblDescription.setBoundingWidth(itemSchema.WIDTH/0.65 - 70)
        this._lblDescription.setAnchorPoint(cc.p(0.5,0.5));
        this._lblDescription.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this.button.setScale(0.9);
        this.button.setPosition(0, -itemSchema.HEIGHT/2 + 100);
    },

    /**
     * @private
     */
    _rebuildScale9Background: function () {
        if(this._scale9Bg) {
            this._scale9Bg.removeFromParent();
        }

        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.LONG_BUTTON));
        this._scale9Bg.setColor(core.colorHelpers.get(core.ColorHelpers.BACKGROUND));
        this._scale9Bg.setOpacity(155);
        this.addChild(this._scale9Bg);
        this._scale9Bg.setLocalZOrder(0);
    },

    /**
     * @param {Number|null} amount
     */
    setAmount: function (amount) {
        if(amount === null || amount === undefined) {
            this._amountBadge.setVisible(false);
            return;
        }

        this._amountBadge.setVisible(true);
        this._amountBadge.setAmount(amount);
    },

    /**
     * @param {Number} amount
     * @param {Boolean} canAfford
     */
    setPriceButton: function (amount, canAfford) {
        this.button.setText(amount.toString());
        this.button.setIcon(core.SpriteFrames.COIN);
        this.button.setSoundUrl(core.Sounds.SFX_BUY);
        this.button.setColorSchema(
            core.colorHelpers.get(core.ColorHelpers.SUCCESS, true),
            core.colorHelpers.get(core.ColorHelpers.SUCCESS)
        );

        if(canAfford) {
            this.button.setStatus(core.Button.Status.IDLE);
        }
        else {
            this.button.setStatus(core.Button.Status.DISABLED);
        }
    },

    /**
     * @public
     */
    setSelectedButton: function () {
        this.button.setText("SELECTED");
        this.button.removeIcon();
        this.button.setStatus(core.Button.Status.SELECTED);
    },

    /**
     * @public
     */
    setSelectButton: function () {
        this.button.setText("SELECT");
        this.button.setSoundUrl(core.Sounds.SFX_UI_CLAP);
        this.button.removeIcon();
        this.button.setColorSchema(
            core.colorHelpers.get(core.ColorHelpers.INFO, true),
            core.colorHelpers.get(core.ColorHelpers.INFO)
        );
        
        this.button.setStatus(core.Button.Status.IDLE);
    },

    /**
     * @public
     */
    animateForPurchase: function () {
        this._amountBadge.stopAllActions();
        this._amountBadge.runAction(cc.sequence(
            cc.scaleTo(0.2, 1.3, 1.3).easing(cc.easeSineOut()),
            cc.scaleTo(0.4, 1, 1).easing(cc.easeBackOut())
        ));
    }
})

/**
 * @type {{VERTICAL_SPACING: number, WIDTH: number, HORIZONTAL_SPACING: number, HEIGHT: number}}
 */
core.ShopItemCard.LandscapeSchema = {
    WIDTH: 450,
    HEIGHT: 620,
    HORIZONTAL_SPACING: 50,
    VERTICAL_SPACING: 50
};

/**
 * @type {{VERTICAL_SPACING: number, HEIGHT: number}}
 */
core.ShopItemCard.PortraitSchema = {
    HEIGHT: 240,
    VERTICAL_SPACING: 20
}