/**
 * Created by Ryan Balieiro on 28/08/20.
 * @class
 * @extends {core.PopUpBoard}
 */
core.AchievementsWindow = core.PopUpBoard.extend({
    /** @type {core.AchievementCard[]} **/
    _items: null,
    
    /** @type {core.GameManager} **/
    gameManager: null,

    /** @type {core.UserManager} **/
    userManager: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.GameManager} gameManager
     * @param {core.UserManager} userManager
     */
    ctor: function (notifier, gameManager, userManager) {
        let dimensions = cc.size(900, 1150);
        this.gameManager = gameManager;
        this.userManager = userManager;

        this._super(notifier, dimensions, "Achievements");
        this.createConfirmButton("Close");
        this.createIcon(core.SpriteFrames.MEDAL);
        this._icon.x -= 20;
        this._icon.y += 20;

        this._items = [];
        for(let i = 0 ; i < this.gameManager.achievements.length ; i++) {
            let item = new core.AchievementCard(cc.size(800, 170));
            item.setPositionY(dimensions.height/2 - 290 - 200*i);
            this.addChild(item);
            this._items.push(item);
        }

        this._setItems();
    },

    /**
     * @private
     */
    _setItems: function () {
        let achievements = this.gameManager.achievements;

        for(let i = 0 ; i < achievements.length ; i++) {
            let item = this._items[i];
            let model = achievements[i];
            item.setModel(model, this.userManager.getCurrentValueForAchievement(model));
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
        this.getInteractiveLayer().unlock();
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(button === this._btnClose) {
            this.tweenOut();
        }
    },

    /**
     * @public
     */
    tweenOut: function () {
        this._tweenCompletionCallback = this._onTweenOutComplete;
        this._super();
    },

    /**
     * @private
     */
    _onTweenOutComplete: function () {
        this.destroy();
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.REQUESTED_PAUSE)
    },

    /**
     * @override
     */
    destroy: function () {
        this.gameManager.notifier.removeSubscription(this);
    }
})