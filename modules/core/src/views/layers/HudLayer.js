/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {core.ResponsiveLayer}
 */
core.HudLayer = core.ResponsiveLayer.extend({
    /** @type {Object} **/
    _layoutVars: null,

    /** @type {core.OptionsHud} **/
    _optionsHud: null,

    /** @type {core.ActionHud} **/
    _actionHud: null,

    /** @type {core.ScoreHud} **/
    _scoreHud: null,

    /** @type {core.CoinHud} **/
    _coinHud: null,

    /** @type {core.BoostsHud} **/
    _boostsHud: null,

    /** @type {core.Magnet[]} **/
    _coinAnimations: null,

    /** @type {core.AnimatedText[]} **/
    _poppingTexts: null,

    /** @type {core.Toast} **/
    _achievementsToast: null,

    /** @type {core.Toast} **/
    _feedbackToast: null,
    
    /** @type {core.InteractiveNode} **/
    _topLeftVisibleHud: null,

    /** @type {Boolean} **/
    _hudButtonsEnabled: false,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     * @param {core.OptionsHud} optionsHud
     * @param {core.ScoreHud} scoreHud
     * @param {core.CoinHud} coinHud
     * @param {core.ActionHud} actionHud
     * @param {core.BoostsHud} boostsHud
     */
    ctor: function (sceneNotifier, optionsHud, scoreHud, coinHud, actionHud, boostsHud) {
        this._super();

        this.sceneNotifier = sceneNotifier;
        this._optionsHud = optionsHud;
        this._scoreHud = scoreHud;
        this._coinHud = coinHud;
        this._actionHud = actionHud;
        this._boostsHud = boostsHud;

        this.addChild(this._optionsHud);
        this.addChild(this._coinHud);
        this.addChild(this._scoreHud);
        this.addChild(this._actionHud);
        this.addChild(this._boostsHud);

        this._topLeftVisibleHud = this._optionsHud;

        this._coinAnimations = [];
        for(let i = 0 ; i < 3 ; i++) {
            let coinAnimation = new core.Magnet(core.SpriteFrames.COIN);
            this._coinAnimations.push(coinAnimation);
            this.addChild(coinAnimation);
        }

        this._poppingTexts = [];
        for(let i = 0 ; i < 3 ; i++) {
            let poppingText = new core.AnimatedText();
            this._poppingTexts.push(poppingText);
            this.addChild(poppingText);
        }

        this._achievementsToast = new core.Toast();
        this.addChild(this._achievementsToast);

        this._feedbackToast = new core.Toast();
        this.addChild(this._feedbackToast);
        this._feedbackToast.setAutoHideTime(4);

        this.setFocus(false);
    },

    /**
     * @override
     */
    layoutElements: function () {
        this._super();

        this._layoutVars = this._layoutVars || {};

        let scaleFactor = core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens();
        let paddingY = core.mathHelpers.clamp((this.winProportion - 1.33)*100, 0, 50);

        this._layoutVars.coinHud = {x:this.winWidth, y:this.winHeight - paddingY, scaleX:scaleFactor, scaleY:scaleFactor};
        this._layoutVars.scoreHud = {x:this.winWidth/2, y:this.winHeight - paddingY, scaleX:scaleFactor, scaleY:scaleFactor};
        this._layoutVars.optionsHud = {x:0, y:this.winHeight - paddingY, scaleX:scaleFactor, scaleY:scaleFactor};
        this._layoutVars.boostsHud = {x:cc.winSize.width - 160, y:80, scaleX:scaleFactor, scaleY:scaleFactor};
        if(core.layoutHelpers.isLgOrHigher() || core.layoutHelpers.isSmOrLower()) {
            this._layoutVars.boostsHud.x = 0;
        }

        this._coinHud.attr(this._layoutVars.coinHud);
        this._scoreHud.attr(this._layoutVars.scoreHud);

        this._optionsHud.cleanup();
        this._optionsHud.attr(this._layoutVars.optionsHud);
        this._optionsHud.updateLayout();
        this._optionsHud.setVisible(false);
        this._optionsHud.x -= cc.winSize.width/2;

        this._actionHud.cleanup();
        this._actionHud.attr(this._layoutVars.optionsHud);
        this._actionHud.setVisible(false);
        this._actionHud.x -= cc.winSize.width/2;

        if(this._hudButtonsEnabled) {
            this._topLeftVisibleHud.setVisible(true);
            this._topLeftVisibleHud.x += cc.winSize.width/2;
        }

        this._boostsHud.cleanup();
        this._boostsHud.attr(this._layoutVars.boostsHud);
        this._boostsHud.setOpacity(this._hudButtonsEnabled ? 255 : 0);
        this._boostsHud.updateLayout();

        this._setInteractiveNodes();

        for(let i = 0 ; i < this._coinAnimations.length ; i++) {
            this._coinAnimations[i].destroy();
        }

        for(let i = 0 ; i < this._poppingTexts.length ; i++) {
            this._poppingTexts[i].destroy();
        }

        if(this._achievementsToast.getStatus() !== core.Toast.Status.INACTIVE) {
            this._achievementsToast.setInactive();
        }

        if(this._feedbackToast.getStatus() === core.Toast.Status.SHOWING_FIXED) {
            this._feedbackToast.updateLayout();
        }
        else {
            this._feedbackToast.setInactive();
        }
    },

    /**
     * @param {Boolean} enabled
     */
    setHudEnabled: function (enabled) {
        this._hudButtonsEnabled = enabled;
        if(enabled) {
            this._tweenTopLeftHudIn(this._topLeftVisibleHud, 0.5);
            this._boostsHud.runAction(cc.fadeIn(0.5));
            this.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.callFunc(this._setInteractiveNodes, this)
            ));
        }
        else {
            this._tweenTopLeftHudOut(this._topLeftVisibleHud, 0.5);
            this._boostsHud.runAction(cc.fadeOut(0.5));
            this._setInteractiveNodes();
        }
    },

    /**
     * @param {Boolean} enabled
     */
    setActionHudActive: function (enabled) {
        if(enabled && this._topLeftVisibleHud !== this._actionHud) {
            this._toggleTopLeftHud();
        }
        else if(!enabled && this._topLeftVisibleHud === this._actionHud) {
            this._toggleTopLeftHud();
        }
    },

    /**
     * @param {core.InteractiveNode} hud
     * @param {Number} time
     * @private
     */
    _tweenTopLeftHudIn: function (hud, time) {
        let offset = cc.winSize.width/2;

        hud.cleanup();
        hud.attr(this._layoutVars.optionsHud);
        hud.setVisible(true);

        hud.setPositionX(hud.getPositionX() - offset);
        hud.runAction(cc.sequence(
            cc.moveBy(time, offset, 0).easing(cc.easeSineOut())
        ));
    },

    /**
     * @param {core.InteractiveNode} hud
     * @param {Number} time
     * @private
     */
    _tweenTopLeftHudOut: function (hud, time) {
        let offset = cc.winSize.width/2;
        hud.cleanup();
        hud.runAction(cc.sequence(
            cc.moveTo(time, this._layoutVars.optionsHud.x - offset, this._layoutVars.optionsHud.y).easing(cc.easeBackIn()),
            cc.hide()
        ));
    },

    /**
     * @private
     */
    _toggleTopLeftHud: function () {
        let currentHud = this._topLeftVisibleHud;
        let targetHud = currentHud === this._optionsHud ? this._actionHud : this._optionsHud;

        this._topLeftVisibleHud = targetHud;
        if(!this._hudButtonsEnabled) {
            return;
        }

        this._tweenTopLeftHudOut(currentHud, 0.5);
        this.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(function () {
                this._tweenTopLeftHudIn(targetHud, 0.5)
            }, this),
            cc.delayTime(0.5),
            cc.callFunc(this._setInteractiveNodes, this)
        ));
    },

    /**
     * @private
     */
    _setInteractiveNodes: function () {
        if(this._hudButtonsEnabled) {
            this._interactiveNodes = [this._boostsHud];
            if(this._topLeftVisibleHud)
                this._interactiveNodes.push(this._topLeftVisibleHud);
        }
        else {
            this._interactiveNodes = [];
        }
    },

    /**
     * @public
     */
    enable: function () {
        this._super();

        if(this._achievementsToast.getStatus() === core.Toast.Status.READY) {
            this._showAchievementsToast();
        }
    },

    /**
     * @returns {core.ActionHud}
     */
    getActionHud: function () {
        return this._actionHud;
    },

    getBoostsHud: function () {
        return this._boostsHud;
    },

    /**
     * @param {Number} amountOfCoins
     * @param {Number} totalAmount
     * @param {cc.Point} initialPosition
     */
    createCoinAnimation: function (amountOfCoins, totalAmount, initialPosition) {
        let self = this;
        let coinAnimation = this._coinAnimations.shift();
        this._coinAnimations.push(coinAnimation);

        coinAnimation.build(
            amountOfCoins,
            initialPosition,
            this._coinHud.getCoinGlobalPosition(),
            core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens(),
            function (coinAnimation, coinsEarned) {
                self._onCoinParticleCompleted(coinAnimation, coinsEarned);
            }
        );

        coinAnimation.setCustomCounter(totalAmount);
        coinAnimation.play();
    },

    /**
     * @private
     * @param {core.Magnet} coinAnimation
     * @param {Number} coinsEarned
     */
    _onCoinParticleCompleted: function (coinAnimation, coinsEarned) {
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.EARNED_COINS, coinsEarned);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_SCORE_COUNTER_SOFT);
    },

    /**
     * @param {String} text
     * @param {cc.Point} initialPosition
     * @param {Number} factor
     */
    createPoppingTextAnimation: function (text, initialPosition, factor) {
        let poppingText = this._poppingTexts.shift();
        this._poppingTexts.push(poppingText);

        poppingText.buildForPopping(
            text,
            initialPosition,
            core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens(),
            200,
            core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens()*(1 + (factor - 1)*0.3)
        );

        poppingText.play();
    },

    /**
     * @param {core.AchievementModel} achievementModel
     * @param {Number} currentValueForAchievement
     */
    showAchievementUnlockedFeedback: function (achievementModel, currentValueForAchievement) {
        this._achievementsToast.setAchievementUnlockedFeedback(achievementModel, currentValueForAchievement);
        this._achievementsToast.setReady();

        if(this.status === core.InteractiveLayer.InteractionStatus.ENABLED) {
            this._showAchievementsToast();
        }
    },

    /**
     * @private
     */
    _showAchievementsToast: function () {
        this._achievementsToast.show(true);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_ACHIEVEMENT);
    },

    /**
     * @param {String} iconSpriteFrame
     * @param {String} title
     * @param {String} message
     * @param {Boolean} autoHide
     */
    showFeedbackMessage: function (iconSpriteFrame, title, message, autoHide) {
        this._feedbackToast.setSpriteIconAndMessage(iconSpriteFrame, title, message);
        this._feedbackToast.setReady();
        this._feedbackToast.show(autoHide);
    },

    /**
     * @public
     */
    hideFeedbackMessage: function () {
        this._feedbackToast.hide();
    },

    /**
     * @public
     */
    forceHideAllFeedbacks: function () {
        this._feedbackToast.hide();
        this._achievementsToast.hide();
    }
})