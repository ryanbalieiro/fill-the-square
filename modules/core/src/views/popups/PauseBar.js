/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {core.PopUpNode}
 */
core.PauseBar = core.PopUpNode.extend({
    /** @type {cc.LayerColor} **/
    _lyrBackground: null,

    /** @type {cc.LayerColor} **/
    _lyrShadow: null,

    /** @type {Object} **/
    _layoutingVars: null,

    /** @type {core.SpriteButton} **/
    btnRestart: null,

    /** @type {core.SpriteButton} **/
    btnShare: null,

    /** @type {core.SpriteButton} **/
    btnMusic: null,

    /** @type {core.SpriteButton} **/
    btnSfx: null,

    /** @type {core.SpriteButton} **/
    btnPolicy: null,

    /** @type {core.SpriteButton} **/
    btnDeveloper: null,

    /** @type {core.SpriteButton} **/
    btnPlay: null,

    /** @type {core.SpriteButton} **/
    btnStats: null,

    /** @type {core.SpriteButton} **/
    btnAchievements: null,

    /** @type {core.SpriteButton} **/
    btnTheme: null,

    /** @type {core.AudioManager} **/
    audioManager:null,
    
    /** @type {String} **/
    _tweenOutCbEvent: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.AudioManager} audioManager
     */
    ctor: function (notifier, audioManager) {
        this._super(notifier);
        this._createElements();
        this._layoutElements();

        this.audioManager = audioManager;
        this.audioManager.notifier.addSubscription(this, this._updateStatus);
        this._updateStatus();

        this.buttons.push(this.btnRestart, this.btnShare, this.btnMusic, this.btnSfx, this.btnPolicy, this.btnDeveloper, this.btnPlay, this.btnAchievements, this.btnStats, this.btnTheme);
    },

    /**
     * @private
     */
    _createElements: function () {
        this._lyrShadow = new cc.LayerColor(core.colorHelpers.get(core.ColorHelpers.BLACK));
        this._lyrShadow.changeWidthAndHeight(core.PauseBar.WIDTH + 10, cc.winSize.height);
        this._lyrShadow.setOpacity(45);

        this._lyrBackground = new cc.LayerGradient(core.colorHelpers.get(core.ColorHelpers.BACKGROUND, true), core.colorHelpers.get(core.ColorHelpers.BACKGROUND));
        this._lyrBackground.changeWidthAndHeight(core.PauseBar.WIDTH, cc.winSize.height);

        this.btnRestart = new core.SpriteButton(core.SpriteFrameBundles.RESTART_BUTTON);
        this.btnShare = new core.SpriteButton(core.SpriteFrameBundles.SHARE_BUTTON);
        this.btnMusic = new core.SpriteButton(core.SpriteFrameBundles.MUSIC_BUTTON);
        this.btnSfx = new core.SpriteButton(core.SpriteFrameBundles.SOUNDS_BUTTON);
        this.btnPolicy = new core.SpriteButton(core.SpriteFrameBundles.POLICY_BUTTON);
        this.btnDeveloper = new core.SpriteButton(core.SpriteFrameBundles.DEVELOPER_BUTTON);
        this.btnPlay = new core.SpriteButton(core.SpriteFrameBundles.PLAY_BUTTON);
        this.btnStats = new core.SpriteButton(core.SpriteFrameBundles.STATS_BUTTON);
        this.btnAchievements = new core.SpriteButton(core.SpriteFrameBundles.ACHIEVEMENTS_BUTTON);
        this.btnTheme = new core.SpriteButton(core.SpriteFrameBundles.THEME_BUTTON);

        this.addChild(this._lyrShadow);
        this.addChild(this._lyrBackground);
        this.addChild(this.btnRestart);
        this.addChild(this.btnShare);
        this.addChild(this.btnMusic);
        this.addChild(this.btnSfx);
        this.addChild(this.btnPolicy);
        this.addChild(this.btnDeveloper);
        this.addChild(this.btnPlay);
        this.addChild(this.btnStats);
        this.addChild(this.btnAchievements);
        this.addChild(this.btnTheme);

        this.btnRestart.setSoundUrl(core.Sounds.SFX_UI_PLOP);
        this.btnShare.setSoundUrl(core.Sounds.SFX_CLICK);
        this.btnPlay.setSoundUrl(core.Sounds.SFX_SHRINK);
        this.btnMusic.setSoundUrl(core.Sounds.SFX_EXPAND);
        this.btnSfx.setSoundUrl(core.Sounds.SFX_EXPAND);
        this.btnDeveloper.setSoundUrl(core.Sounds.SFX_CLICK);
        this.btnPolicy.setSoundUrl(core.Sounds.SFX_CLICK);
        this.btnStats.setSoundUrl(core.Sounds.SFX_UI_PLOP);
        this.btnAchievements.setSoundUrl(core.Sounds.SFX_UI_PLOP);
        this.btnTheme.setSoundUrl(core.Sounds.SFX_UI_PLOP);
    },


    /**
     * @private
     */
    _layoutElements: function () {
        this._layoutingVars = {
            centerX: core.PauseBar.WIDTH/2,
            currentY: cc.winSize.height
        };

        this._createHeader();
        this._createSection(null, [this.btnRestart, this.btnShare, this.btnPlay]);
        this._createSection("Account", [this.btnStats, this.btnAchievements, this.btnTheme]);
        this._createSection("Audio", [this.btnMusic, this.btnSfx]);
        this._createSection("Links", [this.btnPolicy, this.btnDeveloper]);
    },

    /**
     * @public
     */
    onParentLayerWillResize: function () {
        if(core.layoutHelpers.isSmOrHigher()) {
            this.btnTheme.setVisible(false);
            this.btnTheme.setStatus(core.Button.Status.DISABLED);
            this._repositionButtons([this.btnStats, this.btnAchievements]);
        }
        else {
            this.btnTheme.setVisible(true);
            this.btnTheme.setStatus(core.Button.Status.IDLE);
            this._repositionButtons([this.btnStats, this.btnAchievements, this.btnTheme]);
        }
    },

    /**
     * @private
     */
    _createHeader: function () {
        this._layoutingVars.currentY -= 230;
        let sprLogo = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.MetadataSpriteFrames.ICON_SQUARE));
        this.addChild(sprLogo);
        sprLogo.setPosition(this._layoutingVars.centerX, this._layoutingVars.currentY);
        this._layoutingVars.currentY -= 220;

        let lblTitle = new core.Label(cc.game.config['title'].toUpperCase(), core.Fonts.PATUA_ONE_SMALL, core.PauseBar.WIDTH, cc.TEXT_ALIGNMENT_CENTER);
        lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));
        this.addChild(lblTitle);
        lblTitle.setPosition(this._layoutingVars.centerX, this._layoutingVars.currentY);
        this._layoutingVars.currentY -= 60;

        let lblSubtitle = new core.Label("by Ryan Balieiro", core.Fonts.MENLO, core.PauseBar.WIDTH, cc.TEXT_ALIGNMENT_CENTER);
        lblSubtitle.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));
        this.addChild(lblSubtitle);
        lblSubtitle.setPosition(this._layoutingVars.centerX, this._layoutingVars.currentY);
        this._layoutingVars.currentY -= 120;
    },

    /**
     * @param {String|null} title
     * @param {core.SpriteButton[]} buttons
     * @private
     */
    _createSection: function (title, buttons) {
        if(title) {
            let lblTitle = new core.Label(title.toUpperCase(), core.Fonts.PATUA_ONE_SMALL, core.PauseBar.WIDTH, cc.TEXT_ALIGNMENT_CENTER);
            lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY, true));
            lblTitle.setScale(0.85);
            this.addChild(lblTitle);
            lblTitle.setPosition(this._layoutingVars.centerX, this._layoutingVars.currentY);
            this._layoutingVars.currentY -= 120;
        }

        this._positionButtons(buttons);
    },

    /**
     * @param {core.SpriteButton[]} buttons
     * @private
     */
    _positionButtons: function (buttons) {
        let amountOfButtons = buttons.length;
        let offset = 175 - amountOfButtons*12.5;

        for(let i = 0 ; i < amountOfButtons ; i++) {
            let button = buttons[i];
            button.setPosition(this._layoutingVars.centerX + (i - amountOfButtons/2 + 0.5)*offset, this._layoutingVars.currentY);
        }

        this._layoutingVars.currentY -= 130;
    },

    /**
     * @param {core.SpriteButton[]} buttons
     * @private
     */
    _repositionButtons: function (buttons) {
        let amountOfButtons = buttons.length;
        let offset = 175 - amountOfButtons*12.5;

        for(let i = 0 ; i < amountOfButtons ; i++) {
            let button = buttons[i];
            button.setPosition(this._layoutingVars.centerX + (i - amountOfButtons/2 + 0.5)*offset, buttons[0].getPositionY());
        }
    },

    /**
     * @public
     */
    tweenIn: function () {
        this.stopAllActions();
        this.setPosition(this.targetPosition.x - core.PauseBar.WIDTH, this.targetPosition.y);

        this.getInteractiveLayer().lock();
        this._tweenCompletionCallback = this._onTweenInComplete;

        this.runAction(cc.sequence(
            cc.moveTo(0.3, 0, 0).easing(cc.easeSineOut()),
            cc.callFunc(this.onTweenCompleted, this)
        ))
    },

    /**
     * @private
     */
    _onTweenInComplete: function () {
        this.getInteractiveLayer().unlock();
    },

    /**
     * @public
     * @param {String} cbEvent
     */
    tweenOut: function (cbEvent) {
        this.stopAllActions();
        this.setPosition(this.targetPosition);

        this.getInteractiveLayer().lock();
        this._tweenOutCbEvent = cbEvent;
        this._tweenCompletionCallback = this._onTweenOutComplete;

        this.runAction(cc.sequence(
            cc.moveTo(0.3, -core.PauseBar.WIDTH, 0).easing(cc.easeSineOut()),
            cc.callFunc(this.onTweenCompleted, this)
        ))
    },

    /**
     * @private
     */
    _onTweenOutComplete: function () {
        this.destroy();
        this.sceneNotifier.dispatch(this._tweenOutCbEvent);
        this._tweenOutCbEvent = null;
    },

    /**
     * @override
     * @param event
     */
    onMouseDown: function (event) {
        this._super(event);
        if(event.getLocationX() > core.PauseBar.WIDTH) {
            this.tweenOut(core.GameViewEvent.Types.REQUESTED_RESUME);
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_CANCEL_WHOOSH);
        }
    },

    /**
     * @override
     * @param {core.SpriteButton} button
     */
    onButtonPressed: function (button) {
        switch (button) {
            case this.btnRestart:
                this.tweenOut(core.GameViewEvent.Types.REQUESTED_RESTART_CONFIRMATION);
                break;

            case this.btnPlay:
                this.tweenOut(core.GameViewEvent.Types.REQUESTED_RESUME);
                break;

            case this.btnShare:
                this.sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.CLICKED_ON_SHARE_GAME);
                break;

            case this.btnMusic:
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.TOGGLED_MUSIC_ENABLED);
                break;

            case this.btnSfx:
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.TOGGLED_SFX_ENABLED);
                break;

            case this.btnPolicy:
                this.sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.CLICKED_ON_PRIVACY_POLICY);
                break;

            case this.btnDeveloper:
                this.sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.CLICKED_ON_DEVELOPER_SITE_LINK);
                break;

            case this.btnStats:
                this.tweenOut(core.GameViewEvent.Types.OPENED_STATS);
                break;

            case this.btnAchievements:
                this.tweenOut(core.GameViewEvent.Types.OPENED_ACHIEVEMENTS);
                break;

            case this.btnTheme:
                this.tweenOut(core.GameViewEvent.Types.OPENED_THEME_SHOP);
                break;
        }
    },

    /**
     * @private
     */
    _updateStatus: function () {
        this.btnMusic.setSprites(this.audioManager.getMusicEnabled() ?
            core.SpriteFrameBundles.MUSIC_BUTTON : core.SpriteFrameBundles.MUSIC_DISABLED_BUTTON);

        this.btnSfx.setSprites(this.audioManager.getSfxEnabled() ?
            core.SpriteFrameBundles.SOUNDS_BUTTON : core.SpriteFrameBundles.SOUNDS_DISABLED_BUTTON);
    },

    /**
     * @public
     */
    destroy: function () {
        this.audioManager.notifier.removeSubscription(this);
    }
})


/**
 * @type {number}
 */
core.PauseBar.WIDTH = 500;