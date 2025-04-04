/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {cc.Class}
 */
core.GameDelegate = cc.Class.extend({
    /** @type {Object} **/
    _gameNamespace: null,

    /** @type {cc.Class|Function} **/
    _classGameManager: null,

    /** @type {cc.Class|Function} **/
    _classGameLayer: null,

    /** @type {cc.Class|Function} **/
    _classTutorialManager: null,

    /** @type {core.GameScene} **/
    _gameScene: null,

    /** @type {core.ResourceLoader} **/
    resourceLoader: null,

    /** @type {core.AudioManager} **/
    audioManager: null,

    /** @type {core.GameManager} **/
    gameManager: null,

    /** @type {core.TutorialManager} **/
    tutorialManager: null,

    /** @type {core.UserManager} **/
    userManager: null,

    /** @type {core.DebugOptions} **/
    debugOptions: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._gameNamespace = {};
        this._classGameManager = core.GameManager;
        this._classGameLayer = core.GameLayer;
        this._classTutorial = null;
    },

    /**
     * @public
     */
    init: function () {
        this.audioManager = new core.AudioManager();
        this.userManager = new core.UserManager();
        this.debugOptions = new core.DebugOptions();

        this.resourceLoader = new core.ResourceLoader(this.audioManager);
        this.resourceLoader.notifier.addSubscription(this, this._onCoreResourcesLoaded);
        this.resourceLoader.preload(cc.game.config['coreRootPath'], null, core.Pngs, core.Fonts, core.Sounds);
    },

    /**
     * @private
     */
    _onCoreResourcesLoaded: function () {
        this.resourceLoader.notifier.removeSubscription(this);
        this.resourceLoader.notifier.addSubscription(this, this._onGameResourcesLoaded);
        this.resourceLoader.preload(cc.game.config['gameRootPath'], this._gameNamespace.Plists, this._gameNamespace.Pngs, this._gameNamespace.Fonts, this._gameNamespace.Sounds);
    },

    /**
     * @private
     */
    _onGameResourcesLoaded: function () {
        this.resourceLoader.notifier.removeSubscription(this);

        let ignorePersistence = this.debugOptions.getDebugFlag(core.DebugOptions.Flags.IGNORE_PERSISTENCE);
        this.gameManager = new this._classGameManager(this.userManager, ignorePersistence);
        this.audioManager.init(ignorePersistence);
        this.userManager.init(this.gameManager.items, ignorePersistence);
        this.userManager.notifier.addSubscription(this, this._onUserManagerEvent);

        if(this._classTutorialManager) {
            this.tutorialManager = new this._classTutorialManager();
            this.tutorialManager.init(ignorePersistence);
            this.tutorialManager.notifier.addSubscription(this, this._onTutorialManagerEvent);
        }

        if(this.debugOptions.getDebugFlag(core.DebugOptions.Flags.SKIP_INTRO)) {
            this.tutorialManager.forceComplete();
        }

        this._createGameView();
    },

    /**
     * @public
     */
    _createGameView: function () {
        let notifier = new core.Notifier();
        notifier.addSubscription(this, this._onGameSceneEvent);

        let optionsHud = new core.OptionsHud(notifier);
        let coinHud = new core.CoinHud(this.userManager);
        let scoreHud = new core.ScoreHud(this.gameManager, this.userManager);
        let actionHud = new core.ActionHud(notifier);
        let boostsHud = new core.BoostsHud(notifier, this.userManager, this.gameManager.items.getCategoryList(core.ItemCollectionModel.PresetCategories.BOOSTS));
        let hudLayer = new core.HudLayer(notifier, optionsHud, scoreHud, coinHud, actionHud, boostsHud);

        let gameLayer = new this._classGameLayer(notifier, this.gameManager, this.userManager);
        gameLayer.setTopLayer(hudLayer);

        let popUpLayer = new core.PopUpLayer(notifier);

        this._gameScene = new core.GameScene(notifier, gameLayer, hudLayer, popUpLayer);
        cc.director.runScene(this._gameScene);
    },

    /**
     * @param {String} event
     * @param {*} parameter
     * @private
     */
    _onGameSceneEvent: function (event, parameter) {
        switch(event) {
            case core.GameViewEvent.Types.FIRST_TOUCH_PERFORMED:            this._onFirstTouch(); break;
            case core.GameViewEvent.Types.PLAY_EFFECT:                      this._playEffect(parameter); break;
            case core.GameViewEvent.Types.PLAY_SCORE_EFFECT:                this._playScoreEffect(parameter); break;
            case core.GameViewEvent.Types.RESUME_BGM:                       this._changeBgm(parameter); break;
            case core.GameViewEvent.Types.STOP_BGM:                         this._stopBgm(); break;
            case core.GameViewEvent.Types.READY:                            this._checkCurrentTutorialStep(); break;
            case core.GameViewEvent.Types.REQUESTED_PAUSE:                  this._pauseGame(); break;
            case core.GameViewEvent.Types.REQUESTED_RESUME:                 this._resumeGame(); break;
            case core.GameViewEvent.Types.REQUESTED_RESTART:                this._restartGame(); break;
            case core.GameViewEvent.Types.REQUESTED_RESTART_CONFIRMATION:   this._onRestartConfirmation(); break;
            case core.GameViewEvent.Types.GAME_OVER:                        this._onGameOver(); break;
            case core.GameViewEvent.Types.OPENED_ITEM_SHOP:                 this._openItemShop(); break;
            case core.GameViewEvent.Types.OPENED_THEME_SHOP:                this._openThemeShop(); break;
            case core.GameViewEvent.Types.OPENED_STATS:                     this._openStats(); break;
            case core.GameViewEvent.Types.OPENED_ACHIEVEMENTS:              this._openedAchievements(); break;
            case core.GameViewEvent.Types.BOUGHT_ITEM:                      this._onItemBought(parameter); break;
            case core.GameViewEvent.Types.SELECTED_ITEM:                    this._onItemSelected(parameter); break;
            case core.GameViewEvent.Types.USED_ITEM:                        this._onItemUsed(parameter); break;
            case core.GameViewEvent.Types.PICKED_ITEM_FOR_DRAGGING:         this._onItemPicked(parameter); break;
            case core.GameViewEvent.Types.ANIMATE_FOR_EARNING_COINS:        this._onCoinsAnimation(parameter); break;
            case core.GameViewEvent.Types.EARNED_COINS:                     this._onCoinsEarned(parameter); break;
            case core.GameViewEvent.Types.CONFIRMATION_ACCEPTED:            this._onConfirmationAccepted(); break;
            case core.GameViewEvent.Types.CONFIRMATION_REJECTED:            this._onConfirmationRejected(); break;
            case core.GameViewEvent.Types.TOGGLED_MUSIC_ENABLED:            this._onMusicToggled(); break;
            case core.GameViewEvent.Types.TOGGLED_SFX_ENABLED:              this._onSfxToggled(); break;
            case core.GameViewEvent.Types.CLICKED_ON_DEVELOPER_SITE_LINK:   this._openDeveloperPage(); break;
            case core.GameViewEvent.Types.CLICKED_ON_PRIVACY_POLICY:        this._openPrivacyPolicy(); break;
            case core.GameViewEvent.Types.CLICKED_ON_SHARE_GAME:            this._shareGame(); break;
            case core.GameViewEvent.Types.CLICKED_ON_SHARE_SCORE:           this._shareScore(parameter); break;
            case core.GameViewEvent.Types.FORCE_HIDE_FEEDBACKS:             this._forceHideFeedbacks(); break;
            case core.GameViewEvent.Types.EXPANDED_ITEM_BAG:                this._onItemBagExpanded(); break;
            case core.GameViewEvent.Types.SHRANK_ITEM_BAG:                  this._onItemBagShrunk(); break;
        }
    },

    /**
     * @private
     */
    _onFirstTouch: function () {
        this.audioManager.setAudioContextActivated();
    },

    /**
     * @param {String} url
     * @private
     */
    _playEffect: function (url) {
        this.audioManager.playEffect(url);
    },

    /**
     * @param {{current:Number, total:Number}} data
     * @private
     */
    _playScoreEffect: function (data) {
        this.audioManager.playScoreEffect(data.current, data.total);
    },

    /**
     * @param {String} url
     * @private
     */
    _changeBgm: function (url) {
        this.audioManager.changeBgm(url);
    },

    /**
     * @private
     */
    _stopBgm: function () {
        this.audioManager.stopBgm();
    },

    /**
     * @private
     */
    _checkCurrentTutorialStep: function () {
        if(!this.tutorialManager || this.tutorialManager.hasBeenCompletedBefore()) {
            this._showInitialConfirmation();
        }
        else if(this.tutorialManager.isComplete()) {
            this._resumeGame();
        }
        else {
            this.tutorialManager.config(this, this._gameScene, this.gameManager);
        }
    },

    /**
     * @private
     */
    _showInitialConfirmation: function () {
        let alert = new core.ConfirmationWindow(this._gameScene.sceneNotifier);
        alert.build(
            cc.game.config['title'],
            "Are you ready to play?",
            core.MetadataSpriteFrames.EMOJI_HAPPY,
            "Let's go!"
        );
        alert.setCallbackEvents(core.GameViewEvent.Types.REQUESTED_RESUME);

        if(!this.debugOptions.getDebugFlag(core.DebugOptions.Flags.SKIP_INTRO)) {
            this._gameScene.getPopUpLayer().setTargetNode(alert, core.PopUpLayer.ContentPosition.CENTERED);
            this._gameScene.showPopUp();
        }
        else {
            this._resumeGame();
        }
    },

    /**
     * @private
     */
    _pauseGame: function () {
        let pauseBar = new core.PauseBar(this._gameScene.sceneNotifier, this.audioManager);
        this._gameScene.getPopUpLayer().setTargetNode(pauseBar, core.PopUpLayer.ContentPosition.ABSOLUTE);
        this._gameScene.showPopUp();
    },

    /**
     * @private
     */
    _resumeGame: function () {
        this._gameScene.hidePopUp();
    },

    /**
     * @private
     */
    _restartGame: function () {
        this.gameManager.reset();
        this._resumeGame();
    },

    /**
     * @private
     */
    _onRestartConfirmation: function () {
        let alert = new core.ConfirmationWindow(this._gameScene.sceneNotifier);
        alert.build(
            "Restart?",
            "Do you want to start a new game?",
            core.MetadataSpriteFrames.EMOJI_NEUTRAL,
            "Yes",
            "No"
        );
        alert.setCallbackEvents(core.GameViewEvent.Types.REQUESTED_RESTART, core.GameViewEvent.Types.REQUESTED_RESUME);
        this._gameScene.getPopUpLayer().setTargetNode(alert, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();
    },

    /**
     * @protected
     */
    _onGameOver: function () {
        let gameOverWindow = new core.GameOverWindow(this._gameScene.sceneNotifier, this.userManager, this.gameManager);
        this._gameScene.getPopUpLayer().setTargetNode(gameOverWindow, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();

        this.userManager.finishMatch(this.gameManager.getScore());
        this.gameManager.finish();
    },

    /**
     * @private
     */
    _onConfirmationAccepted: function () {
        this._resumeGame();
    },

    /**
     * @private
     */
    _onConfirmationRejected: function () {
        this._resumeGame();
    },

    /**
     * @private
     */
    _openItemShop: function () {
        let shop = new core.Shop(this._gameScene.sceneNotifier, this.userManager);
        shop.build("Item Shop", this.gameManager.items.getCategoryList(core.ItemCollectionModel.PresetCategories.BOOSTS));
        this._gameScene.getPopUpLayer().setTargetNode(shop, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();
    },

    /**
     * @private
     */
    _openThemeShop: function () {
        let shop = new core.Shop(this._gameScene.sceneNotifier, this.userManager);
        shop.build("Themes", this.gameManager.items.getCategoryList(core.ItemCollectionModel.PresetCategories.THEMES));
        this._gameScene.getPopUpLayer().setTargetNode(shop, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();
    },

    /**
     * @param {core.ItemModel} itemModel
     * @private
     */
    _onItemBought: function (itemModel) {
        let price = itemModel.getPrice();
        if(!this.userManager.canAfford(itemModel))
            return;

        this.userManager.transactCoins(-price);
        switch(itemModel.getType()) {
            case core.ItemModel.Types.CONSUMABLE:
                this.userManager.transactItem(itemModel, 1);
                break;

            case core.ItemModel.Types.SELECTABLE:
                this.userManager.unlockItem(itemModel);
                break;
        }
    },

    /**
     * @param {core.ItemModel} itemModel
     * @private
     */
    _onItemSelected: function (itemModel) {
        if(itemModel.getType() === core.ItemModel.Types.CONSUMABLE)
            return;

        this.userManager.selectItem(itemModel);
    },

    /**
     * @param {core.ItemModel} itemModel
     * @private
     */
    _onItemPicked: function (itemModel) {
        this._gameScene.getGameLayer().pickItem(itemModel);
    },

    /**
     * @param {core.ItemModel} itemModel
     * @private
     */
    _onItemUsed: function (itemModel) {
        this.userManager.transactItem(itemModel, -1);
    },

    /**
     * @private
     */
    _openStats: function () {
        let statsWindow = new core.StatsWindow(this._gameScene.sceneNotifier, this.userManager);

        this._gameScene.getPopUpLayer().setTargetNode(statsWindow, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();
    },

    /**
     * @private
     */
    _openedAchievements: function () {
        let statsWindow = new core.AchievementsWindow(this._gameScene.sceneNotifier, this.gameManager, this.userManager);

        this._gameScene.getPopUpLayer().setTargetNode(statsWindow, core.PopUpLayer.ContentPosition.CENTERED);
        this._gameScene.showPopUp();
    },

    /**
     * @param {{amount:Number, position:cc.Point, objects:Number}} parameters
     * @private
     */
    _onCoinsAnimation: function (parameters) {
        this._gameScene.getHudLayer().createCoinAnimation(parameters.objects || 1, parameters.amount, parameters.position);
    },

    /**
     * @param {Number} amount
     * @private
     */
    _onCoinsEarned: function (amount) {
        this.userManager.transactCoins(amount);
    },

    /**
     * @private
     */
    _onMusicToggled: function () {
        this.audioManager.setMusicEnabled(!this.audioManager.getMusicEnabled());
    },

    /**
     * @private
     */
    _onSfxToggled: function () {
        this.audioManager.setSfxEnabled(!this.audioManager.getSfxEnabled());
    },

    /**
     * @private
     */
    _openDeveloperPage: function () {
        cc.sys.openURL(cc.game.config['developerUrl']);
    },

    /**
     * @private
     */
    _openPrivacyPolicy: function () {
        cc.sys.openURL(cc.game.config['privacyPolicyUrl']);
    },

    /**
     * @private
     */
    _shareGame: function () {
        cc.sys.openURL(`https://x.com/share?text=Play ${cc.game.config['title']} by Ryan Balieiro! It's addicting!&url=${cc.game.config['url']}&hashtags=game,addicted,${cc.game.config['hashtag']}`)
    },

    /**
     * @private
     * @param {Number} score
     */
    _shareScore: function (score) {
        cc.sys.openURL(`https://x.com/share?text=I've scored ${score} on ${cc.game.config['title']}! Can you beat me?&url=${cc.game.config['url']}&hashtags=game,addicted,${cc.game.config['hashtag']}`)
    },

    /**
     * @private
     */
    _forceHideFeedbacks: function () {
        this._gameScene.getHudLayer().forceHideAllFeedbacks();
    },

    /**
     * @private
     */
    _onItemBagExpanded: function () {
        this._gameScene.getGameLayer().disable();
    },

    /**
     * @private
     */
    _onItemBagShrunk: function () {
        this._gameScene.getGameLayer().enable();
    },

    /**
     * @param {String} event
     * @param parameter
     * @private
     */
    _onUserManagerEvent: function (event, parameter) {
        switch(event) {
            case core.UserManager.Events.BEST_SCORE_CHANGED:
                this._checkAchievementUnlocked(parameter.before, parameter.after, this.gameManager.scoreAchievement);
                break;

            case core.UserManager.Events.COINS_BALANCE_CHANGED:
                this._checkAchievementUnlocked(parameter.before, parameter.after, this.gameManager.coinAchievement);
                break;

            case core.UserManager.Events.TOTAL_MATCHES_PLAYED_CHANGED:
                this._checkAchievementUnlocked(parameter.before, parameter.after, this.gameManager.sessionsAchievement);
                break;
        }
    },

    /**
     * @param {Number} beforeValue
     * @param {Number} afterValue
     * @param {core.AchievementModel} achievementModel
     * @private
     */
    _checkAchievementUnlocked: function (beforeValue, afterValue, achievementModel) {
        let beforeLevel = achievementModel.calculateProgress(beforeValue).level;
        let afterLevel = achievementModel.calculateProgress(afterValue).level;

        if(afterLevel > beforeLevel) {
            this._gameScene.getHudLayer().showAchievementUnlockedFeedback(achievementModel, afterValue);
        }
    },

    /**
     * @param event
     * @param parameter
     * @private
     */
    _onTutorialManagerEvent: function (event, parameter) {
        switch(event) {
            case core.TutorialManager.Events.COMPLETED_STEP:
                this._checkCurrentTutorialStep();
                break;
        }
    },
})