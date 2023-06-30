/**
 * Created by Ryan Balieiro on 28/08/20.
 * @class
 * @extends {core.PopUpBoard}
 */
core.StatsWindow = core.PopUpBoard.extend({
    /** @type {core.StatsCard[]} **/
    _items: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.UserManager} userManager
     */
    ctor: function (notifier, userManager) {
        let dimensions = cc.size(900, 980);
        this.userManager = userManager;

        this._super(notifier, dimensions, "Stats");
        this.createConfirmButton("Ok");
        this.createIcon(core.SpriteFrames.CHART_ICON);

        this._items = [];
        for(let i = 0 ; i < core.StatsWindow.MAX_ITEMS ; i++) {
            let item = new core.StatsCard(cc.size(800, 100));
            item.setPositionY(dimensions.height/2 - 280 - 120*i);
            this.addChild(item);
            this._items.push(item);
        }

        this._setItems();
    },

    /**
     * @private
     */
    _setItems: function () {
        this._items[0].setNameAndValue("Best Score", this.userManager.getBestScore());
        this._items[1].setNameAndValue("Average Score", this.userManager.getAverageScore());
        this._items[2].setNameAndValue("Matches Played", this.userManager.getTotalMatchesPlayed());
        this._items[3].setNameAndValue("Total Coins Earned", this.userManager.getTotalCoinsEarned());
        this._items[4].setNameAndValue("Total Coins Spent", this.userManager.getTotalCoinsSpent());
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
        this.userManager.notifier.removeSubscription(this);
    }
})

/**
 * @type {number}
 */
core.StatsWindow.MAX_ITEMS = 5;