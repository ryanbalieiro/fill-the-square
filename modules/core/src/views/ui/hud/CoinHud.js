/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {cc.Node}
 */
core.CoinHud = cc.Node.extend({
    /** @type {core.Sprite} **/
    _sprBackground:null,

    /** @type {core.Sprite} **/
    _sprCoin:null,

    /** @type {core.Label} **/
    _lblAmount:null,

    /** @type {core.UserManager} **/
    userManager:null,

    /**
     * @constructs
     * @param {core.UserManager} userManager
     */
    ctor: function (userManager) {
        this._super();
        this._createElements();
        this._positionElements();

        this.userManager = userManager;
        this.userManager.notifier.addSubscription(this, this.onUserManagerEvent);
        this.setAmount(this.userManager.getBalance());
    },

    /**
     * @private
     */
    _createElements: function () {
        this._sprBackground = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.COIN_COUNT_BG));
        this._sprCoin = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.COIN));
        this._lblAmount = new core.Label("-", core.Fonts.PATUA_ONE_SMALL, 400, cc.TEXT_ALIGNMENT_LEFT);
        this._lblAmount.setDataType(core.Label.DataType.INT);
        this._lblAmount.setColor(core.colorHelpers.get(core.ColorHelpers.GOLD));
        this._lblAmount.setScale(0.9)

        this.addChild(this._sprBackground);
        this.addChild(this._sprCoin);
        this.addChild(this._lblAmount);
    },

    /**
     * @private
     */
    _positionElements: function () {
        this._sprBackground.setPosition(-120, -70);
        this._sprCoin.setPosition(-210, -70);
        this._lblAmount.setPosition(-100, -63);
    },

    /**
     * @param {Number} amountOfCoins
     */
    setAmount: function (amountOfCoins) {
        this._lblAmount.setStringWithAnimation(amountOfCoins.toString(), 0.1);
        this._sprCoin.stopAllActions();
        this._sprCoin.x = -210;
        this._lblAmount.x = -100;
        if(amountOfCoins > 10000) {
            this._sprCoin.x -= 10;
            this._lblAmount.x -= 3;
        }

        this._sprCoin.runAction(cc.sequence(
            cc.scaleTo(0.05, 1.1, 1.1).easing(cc.easeSineOut()),
            cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut())
        ))
    },

    /**
     * @public
     */
    getCoinGlobalPosition: function () {
        return this.convertToWorldSpace(this._sprCoin.getPosition());
    },

    /**
     * @param {core.UserManager.Events} event
     * @param {Number} parameter
     */
    onUserManagerEvent: function (event, parameter) {
        if(event === core.UserManager.Events.COINS_BALANCE_CHANGED) {
            this.setAmount(this.userManager.getBalance());
        }
    }
})