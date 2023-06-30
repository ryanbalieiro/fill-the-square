/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {cc.Class}
 */
core.GameManager = cc.Class.extend({
    /** @type {core.Notifier} **/
    notifier:null,

    /** @type {core.UserManager} **/
    userManager:null,

    /** @type {core.ItemCollectionModel} **/
    items: null,

    /** @type {core.AchievementModel[]} **/
    achievements: null,

    /** @type {core.AchievementModel} **/
    scoreAchievement: null,

    /** @type {core.AchievementModel} **/
    coinAchievement: null,

    /** @type {core.AchievementModel} **/
    sessionsAchievement: null,

    /** @type {core.AchievementModel} **/
    itemsAchievement: null,

    /** @type {int|null} **/
    _score: null,

    /** @type {Boolean} **/
    _gameOver:false,

    /**
     * @constructs
     * @param {core.UserManager} userManager
     * @param {Boolean} ignorePersistence
     */
    ctor: function (userManager, ignorePersistence) {
        this.notifier = new core.Notifier();
        this.userManager = userManager;

        this._initItems();
        this._initAchievements();

        if(!ignorePersistence) {
            let gameState = JSON.parse(cc.sys.localStorage.getItem(core.GameManager.LOCAL_STORAGE_KEY));
            this._loadGameState(gameState);
        }
        else {
            this.create();
        }
    },

    /**
     * @private
     */
    _initItems:function () {
        this.items = new core.ItemCollectionModel(cc.game.config['items']);
    },

    /**
     * @private
     */
    _initAchievements: function () {
        let achievementBreakpoints = cc.game.config['achievementBreakpoints'];

        this.scoreAchievement = new core.AchievementModel(core.AchievementModel.PresetCategories.SCORE, "Skills", "Best Score", achievementBreakpoints.score);
        this.coinAchievement = new core.AchievementModel(core.AchievementModel.PresetCategories.COINS, "Wealth", "Total Earned Coins", achievementBreakpoints.coins);
        this.sessionsAchievement = new core.AchievementModel(core.AchievementModel.PresetCategories.SESSIONS, "Addiction", "Matches Played", achievementBreakpoints.matches);
        this.itemsAchievement = new core.AchievementModel(core.AchievementModel.PresetCategories.ITEMS, "Collector", "Features Unlocked", achievementBreakpoints.features);

        this.achievements = [this.scoreAchievement, this.coinAchievement, this.sessionsAchievement, this.itemsAchievement];
    },

    /**
     * @public
     */
    create: function () {
        this._setInitialState();
        this.notifier.dispatch(core.GameManager.Events.STARTED_GAME);
    },

    /**
     * @public
     * @param {Boolean} [silentReset=false]
     */
    reset: function (silentReset) {
        this._setInitialState();
        if(!silentReset)
            this.notifier.dispatch(core.GameManager.Events.RESET_GAME);
    },

    /**
     * @private
     */
    _setInitialState: function () {
        this._gameOver = false;
        this.setScore(0);
        this._saveGameState();
    },

    /**
     * @param {Number} score
     */
    setScore: function (score) {
        this._score = score;
        this.notifier.dispatch(core.GameManager.Events.SCORE_CHANGED, this._score);
        this._saveGameState();

        if(this._score > this.userManager.getBestScore()) {
            this.userManager.setBestScore(this._score);
        }
    },

    /**
     * @param {Number} points
     */
    addToScore: function (points) {
        this.setScore(this.getScore() + points);
    },

    /**
     * @returns {Number}
     */
    getScore: function () {
        return this._score;
    },

    /**
     * @public
     */
    finish: function () {
        this._gameOver = true;
        this._saveGameState();
    },

    /**
     * @private
     * @param {Object} gameState
     */
    _loadGameState: function (gameState) {
        if(!gameState) {
            this.reset();
            return;
        }

        this.onGameStateLoaded(gameState);
        this.notifier.dispatch(core.GameManager.Events.LOADED_GAME_STATE);
    },

    /**
     * @protected
     * @param {Object} gameState
     */
    onGameStateLoaded: function (gameState) {
        this._score = gameState.score;
    },

    /**
     * @protected
     * @returns {Object}
     */
    parseForSaving: function () {
        return {
            score: this._gameOver ? 0 : this._score
        };
    },

    /**
     * @protected
     */
    _saveGameState: function () {
        let gameState = this.parseForSaving();
        this._flushGameState(gameState);
    },

    /**
     * @param {Object} gameState
     * @private
     */
    _flushGameState: function (gameState) {
        cc.sys.localStorage.setItem(core.GameManager.LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    }
})

/**
 * @type {string}
 */
core.GameManager.LOCAL_STORAGE_KEY = "core.game.state";

/**
 * @enum
 */
core.GameManager.Events = {
    LOADED_GAME_STATE: "eventGameManagerLoadedGameState",
    RESET_GAME: "eventGameManagerResetGame",
    SCORE_CHANGED: "eventGameManagerScoreChanged",
    STARTED_GAME: "eventGameManagerStartedGame",
}
