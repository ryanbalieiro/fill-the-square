/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {cc.Class}
 */
core.UserManager = cc.Class.extend({
    /** @type {core.Notifier} **/
    notifier:null,

    /** @type {int} **/
    _bestScore: 0,

    /** @type {int} **/
    _previousBestScore: 0,

    /** @type {int} **/
    _avgScore: 0,

    /** @type {int} **/
    _coins: 0,

    /** @type {int} **/
    _totalCoinsEarned: 0,

    /** @type {int} **/
    _totalCoinsSpent: 0,

    /** @type {int} **/
    _totalMatchesPlayed: 0,

    /** @type {core.ItemWalletModel} **/
    _itemWallet: null,

    /**
     * @constructs
     */
    ctor: function () {
        this.notifier = new core.Notifier();
    },

    /**
     * @public
     * @param {core.ItemCollectionModel} itemCollection
     * @param {Boolean} ignorePersistence
     */
    init: function (itemCollection, ignorePersistence) {
        this._itemWallet = new core.ItemWalletModel(itemCollection);
        let preferences = JSON.parse(cc.sys.localStorage.getItem(core.UserManager.LOCAL_STORAGE_KEY));

        if(preferences && !ignorePersistence) {
            this._bestScore = preferences.bestScore || 0;
            this._previousBestScore = this._bestScore;
            this._avgScore = preferences.avgScore || 0;

            this._coins = preferences.coins || 0;
            this._totalCoinsEarned = preferences.totalCoinsEarned || 0;
            this._totalCoinsSpent = preferences.totalCoinsSpent || 0;

            this._totalMatchesPlayed = preferences.totalMatchesPlayed || 0;
            this._itemWallet.loadFrom(preferences._itemWallet);
        }
    },

    /**
     * @param {Number} bestScore
     */
    setBestScore: function (bestScore) {
        if(bestScore < this._bestScore)
            return;

        this.forceSetBestScore(bestScore);
    },

    /**
     * @param {Number} bestScore
     */
    forceSetBestScore: function (bestScore) {
        let oldScore = this._bestScore;
        this._bestScore = bestScore;
        this._savePreferences();
        this.notifier.dispatch(core.UserManager.Events.BEST_SCORE_CHANGED, {before:oldScore, after:this._bestScore});
    },

    /**
     * @returns {Number}
     */
    getBestScore: function () {
        return this._bestScore;
    },

    /**
     * @returns {Number}
     */
    getPreviousBestScore: function () {
        return this._previousBestScore;
    },

    /**
     * @returns {Number}
     */
    getAverageScore: function () {
        return Math.round(this._avgScore);
    },

    /**
     * @param {Number} amount
     */
    transactCoins: function (amount) {
        let previousBalance = this._coins;
        this._coins += amount;
        if(amount > 0) {
            this._totalCoinsEarned += amount;
        }
        else if(amount < 0) {
            this._totalCoinsSpent += Math.abs(amount);
        }

        this._coins = core.mathHelpers.clamp(this._coins, 0, 99999);
        this._savePreferences();
        this.notifier.dispatch(core.UserManager.Events.COINS_BALANCE_CHANGED, {before:previousBalance, after:this._coins});
    },

    /**
     * @param {core.ItemModel} itemModel
     * @returns {boolean}
     */
    canAfford: function (itemModel) {
        if(itemModel.getType() === core.ItemModel.Types.CONSUMABLE) {
            if(this.getItemAmount(itemModel) >= 99) {
                return false;
            }
            else {
                return this._coins >= itemModel.getPrice();
            }
        }

        return this._coins >= itemModel.getPrice();
    },

    /**
     * @returns {int}
     */
    getBalance: function () {
        return this._coins;
    },

    /**
     * @returns {Number}
     */
    getTotalCoinsEarned: function () {
        return this._totalCoinsEarned;
    },

    /**
     * @returns {Number}
     */
    getTotalCoinsSpent: function () {
        return this._totalCoinsSpent;
    },

    /**
     * @param {core.ItemModel} itemModel
     * @param {Number} amount
     */
    transactItem: function (itemModel, amount) {
        this._itemWallet.transact(itemModel, amount);
        this._savePreferences();
        this.notifier.dispatch(core.UserManager.Events.CONSUMABLE_ITEMS_CHANGED, itemModel);
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    unlockItem: function (itemModel) {
        this._itemWallet.unlock(itemModel);
        this._savePreferences();
        this.notifier.dispatch(core.UserManager.Events.CONSUMABLE_ITEMS_CHANGED, itemModel);
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    selectItem: function (itemModel) {
        this._itemWallet.select(itemModel);
        this._savePreferences();
        this.notifier.dispatch(core.UserManager.Events.CONSUMABLE_ITEMS_CHANGED, itemModel);
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    getItemAmount(itemModel) {
        return this._itemWallet.getItemAmount(itemModel)
    },

    /**
     * @param itemModel
     * @returns {core.ItemWalletModel.SelectableItemStatus|null}
     */
    getItemStatus: function (itemModel) {
        return this._itemWallet.getItemStatus(itemModel)
    },

    /**
     * @param itemCategory
     */
    getSelectedItem: function (itemCategory) {
         return this._itemWallet.getSelectedItem(itemCategory);
    },

    /**
     * @returns {number}
     */
    getPercentageOfItemsUnlocked: function () {
        return this._itemWallet.getPercentageOfItemsUnlocked();
    },

    /**
     * @return {boolean}
     */
    hasAnyConsumable: function () {
        return this._itemWallet.hasAnyConsumable();
    },

    /**
     * @param {core.AchievementModel} achievementModel
     * @return {Number}
     */
    getCurrentValueForAchievement: function (achievementModel) {
        switch(achievementModel.getId()) {
            case core.AchievementModel.PresetCategories.COINS: return this.getTotalCoinsEarned();
            case core.AchievementModel.PresetCategories.SCORE: return this.getBestScore();
            case core.AchievementModel.PresetCategories.SESSIONS: return this.getTotalMatchesPlayed();
            case core.AchievementModel.PresetCategories.ITEMS: return this.getPercentageOfItemsUnlocked();
        }

        return 0;
    },

    /**
     * @public
     * @param {Number} score
     */
    finishMatch: function (score) {
        let totalScore = this._avgScore*this._totalMatchesPlayed;
        this._totalMatchesPlayed++;
        this._previousBestScore = this._bestScore;
        this._avgScore = (totalScore + score)/this._totalMatchesPlayed;
        this.notifier.dispatch(core.UserManager.Events.TOTAL_MATCHES_PLAYED_CHANGED, {before:this._totalMatchesPlayed-1, after:this._totalMatchesPlayed});
        this._savePreferences();
    },

    /**
     * @returns {Number}
     */
    getTotalMatchesPlayed: function () {
        return this._totalMatchesPlayed;
    },

    /**
     * @private
     */
    _savePreferences: function () {
        let preferences = {
            bestScore: this._bestScore,
            avgScore: this._avgScore,
            coins: this._coins,
            totalCoinsSpent: this._totalCoinsSpent,
            totalCoinsEarned: this._totalCoinsEarned,
            totalMatchesPlayed: this._totalMatchesPlayed,
            _itemWallet: this._itemWallet.getHashForSaving()
        };

        cc.sys.localStorage.setItem(core.UserManager.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    }
})

/**
 * @type {string}
 */
core.UserManager.LOCAL_STORAGE_KEY = "core.user.state";

/**
 * @enum {String}
 */
core.UserManager.Events = {
    BEST_SCORE_CHANGED: "eventUserManagerBestScoreChanged",
    COINS_BALANCE_CHANGED: "eventUserManagerCoinsBalanceChanged",
    CONSUMABLE_ITEMS_CHANGED: "eventConsumableItemsChanged",
    TOTAL_MATCHES_PLAYED_CHANGED: "eventTotalMatchesPlayedChanged"
}