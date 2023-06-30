/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {core.InteractiveNode}
 */
core.OptionsHud = core.InteractiveNode.extend({
    /** @type {core.SpriteButton} **/
    _btnMenu: null,

    /** @type {core.SpriteButton} **/
    _btnShop: null,

    /** @type {core.SpriteButton} **/
    _btnTheme: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     */
    ctor: function (sceneNotifier) {
        this._super(sceneNotifier);
        this._createElements();
        this.updateLayout();

        this.buttons.push(this._btnMenu, this._btnShop, this._btnTheme);
    },

    /**
     * @private
     */
    _createElements: function () {
        this._btnMenu = new core.SpriteButton(core.SpriteFrameBundles.MENU_BUTTON);
        this._btnShop = new core.SpriteButton(core.SpriteFrameBundles.SHOP_BUTTON);
        this._btnTheme = new core.SpriteButton(core.SpriteFrameBundles.THEME_BUTTON);

        this.addChild(this._btnMenu);
        this.addChild(this._btnShop);
        this.addChild(this._btnTheme);

        this._btnMenu.setSoundUrl(core.Sounds.SFX_UI_PLOP);
        this._btnShop.setSoundUrl(core.Sounds.SFX_UI_PLOP);
        this._btnTheme.setSoundUrl(core.Sounds.SFX_UI_PLOP);
    },

    /**
     * @public
     */
    updateLayout: function () {
        let offset = 80;
        let spacing = 50;
        this._btnMenu.setPosition(offset, -offset);
        this._btnShop.setPosition(offset*2 + spacing, -offset);

        this._btnTheme.setVisible(false);
        this._btnTheme.setStatus(core.Button.Status.DISABLED);
        if(core.layoutHelpers.isSmOrHigher()) {
            this._btnTheme.setPosition(offset*3 + spacing*2, -offset);
            this._btnTheme.setVisible(true);
            this._btnTheme.setStatus(core.Button.Status.IDLE);
        }
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(!button)
            return;

        switch(button) {
            case this._btnMenu:
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.REQUESTED_PAUSE);
                break;
            case this._btnShop:
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.OPENED_ITEM_SHOP);
                break;
            case this._btnTheme:
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.OPENED_THEME_SHOP);
                break;
        }

        button.setStatus(core.Button.Status.IDLE);
    },
})