/**
 * Created by Ryan Balieiro on 07/09/20.
 * @class
 * @extends {core.InteractiveNode}
 */
core.BoostsHud = core.InteractiveNode.extend({
    /** @type {core.ItemModel[]} **/
    _items: null,

    /** @type {core.SpriteButton} **/
    _btnToggle: null,

    /** @type {core.ItemButton[]} **/
    _boostButtons: null,

    /** @type {Boolean} **/
    _isExpanded: false,

    /** @type {core.UserManager} **/
    _userManager: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     * @param {core.UserManager} userManager
     * @param {core.ItemModel[]} items
     */
    ctor: function (sceneNotifier, userManager, items) {
        this._super(sceneNotifier);
        this._items = items;
        this._userManager = userManager;

        this._createElements();
        this.updateLayout();
        this.setCascadeOpacityEnabled(true);

        this._userManager.notifier.addSubscription(this, this.onUserManagerEvent);
    },

    /**
     * @private
     */
    _createElements: function () {
        this._boostButtons = [];
        for(let i = 0 ; i < this._items.length ; i++) {
            let button = new core.ItemButton();
            button.setVisible(false);
            this.addChild(button);
            this._boostButtons.push(button);
        }

        this._btnToggle = new core.SpriteButton(core.SpriteFrameBundles.ITEM_BUTTON);
        this.addChild(this._btnToggle);
        this._btnToggle.setPosition(80, 0);
        this._btnToggle.setLocalZOrder(99);
        this._btnToggle.setIdleOpacity(255);
    },

    /**
     * @public
     */
    getBtnToggleGlobalPosition: function () {
        return this.convertToWorldSpace(this._btnToggle.getPosition());
    },

    /**
     * @public
     * @param {Boolean} [shrink=false]
     */
    bounceBtnToggle: function (shrink) {
        this._btnToggle.cleanup();
        this._btnToggle.setScale(shrink ? 0.9 : 1.2);
        this._btnToggle.runAction(cc.scaleTo(0.5, 1, 1).easing(cc.easeBackOut()));
    },

    /**
     * @public
     */
    updateLayout: function () {
        this.buttons = [];

        for(let i = 0 ; i < this._boostButtons.length ; i++) {
            let button = this._boostButtons[i];
            button.reset();
        }

        let totalItemsOwned = 0;
        let buttonIndex = 0;

        for(let i = 0 ; i < this._items.length ; i++) {
            let amountOwned = this._userManager.getItemAmount(this._items[i]);

            if(amountOwned > 0) {
                let button = this._boostButtons[buttonIndex];
                button.setItemModel(this._items[i]);

                if(core.layoutHelpers.isSmOrLower()) {
                    button.targetState.position = new cc.Point(this._btnToggle.x + 120 + buttonIndex*110, this._btnToggle.y + 5);
                }
                else {
                    button.targetState.position = new cc.Point(this._btnToggle.x, this._btnToggle.y + 120 + buttonIndex*110);
                }
                button.setBadgeValue(amountOwned);
                if(this._isExpanded) {
                    button.setPosition(button.targetState.position);
                    button.setVisible(this._isExpanded);
                    button.setBadgeVisible(this._isExpanded);
                }
                this.buttons.push(button);
                buttonIndex++;
            }

            totalItemsOwned += amountOwned;
        }

        this._setToggleButtonVisible(totalItemsOwned > 0);
    },

    /**
     * @param {Boolean} visible
     */
    _setToggleButtonVisible: function (visible) {
        if(visible) {
            this._btnToggle.setVisible(true);
            if(this.buttons.lastIndexOf(this._btnToggle) === -1)
                this.buttons.push(this._btnToggle);
        }
        else {
            this._btnToggle.setVisible(false);
            let index = this.buttons.lastIndexOf(this._btnToggle);
            if(index !== -1)
                this.buttons.splice(index, 1);
        }
    },

    /**
     * @private
     */
    _toggle: function () {
        if(this._isExpanded)
            this._shrink(true);
        else
            this._expand();
    },

    /**
     * @private
     */
    _expand: function () {
        if(this._isExpanded)
            return;

        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_EXPAND);
        this._isExpanded = true;
        this._setFocus(true);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.EXPANDED_ITEM_BAG);

        for(let i = 0 ; i < this._boostButtons.length ; i++) {
            let button = this._boostButtons[i];
            button.setBadgeVisible(false);
            button.targetState.applyTo(button);
            button.cleanup();
            button.setPosition(this._btnToggle.getPosition());
            button.setStatus(core.Button.Status.IDLE);

            if(button.targetState.position) {
                button.runAction(cc.sequence(
                    cc.show(),
                    cc.moveTo(0.2, button.targetState.position).easing(cc.easeSineOut()),
                    cc.callFunc(function () {
                        button.setBadgeVisible(true);
                    }, this)
                ));
            }
        }
    },

    /**
     * @private
     * @param {Boolean} animated
     */
    _shrink: function (animated) {
        if(!this._isExpanded)
            return;

        this._isExpanded = false;
        this._setFocus(false);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.SHRANK_ITEM_BAG);

        if(animated) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_SHRINK);
        }

        for(let i = 0 ; i < this._boostButtons.length ; i++) {
            let button = this._boostButtons[i];
            button.setBadgeVisible(false);
            button.targetState.applyTo(button);
            button.cleanup();
            button.setStatus(core.Button.Status.DISABLED);

            if(animated) {
                this.bounceBtnToggle(true);

                button.runAction(cc.sequence(
                    cc.show(),
                    cc.spawn(
                        cc.moveTo(0.2, this._btnToggle.getPosition()).easing(cc.easeSineOut()),
                        cc.fadeOut(0.2)
                    ),
                    cc.hide()
                ));
            }
            else {
                button.setVisible(false);
            }
        }
    },

    /**
     * @param {Boolean} enabled
     * @private
     */
    _setFocus: function (enabled) {
        if(this.getParent() && this.getParent().setFocus) {
            this.getParent().setFocus(enabled);
        }
    },

    /**
     * @param event
     */
    onMouseDown: function (event) {
        this._super(event);

        if(this._touchTarget === null || !this._touchTarget.visible) {
            this._shrink(true);
            return;
        }

        if(this._boostButtons.lastIndexOf(this._touchTarget) !== -1) {
            this._shrink(false);
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PICKED_ITEM_FOR_DRAGGING, this._touchTarget.getItemModel());
            this._touchTarget = null;
        }
    },

    /**
     * @abstract
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(button === this._btnToggle) {
            this._toggle();
            return;
        }
    },

    /**
     * @private
     * @param {String} [event]
     * @param {*} [parameter]
     */
    onUserManagerEvent: function (event, parameter) {
        if(event === core.UserManager.Events.CONSUMABLE_ITEMS_CHANGED) {
            this.updateLayout();
        }
    }
})