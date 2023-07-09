/**
 * Created by Ryan Balieiro on 27/08/20.
 * @class
 * @extends {core.PopUpBoard}
 */
core.GameOverWindow = core.PopUpBoard.extend({
    /** @type {ccui.Scale9Sprite} **/
    _scale9Bg: null,

    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.ScoreHud} **/
    _scoreHud:null,

    /** @type {core.Label} **/
    _lblShare:null,

    /** @type {core.UserManager} **/
    userManager: null,

    /** @type {core.GameManager} **/
    gameManager: null,

    /** @type {core.SpriteButton} **/
    _btnTweet:null,

    /** @type {core.LongButton} **/
    _btnClose: null,

    /** @type {core.Burst} **/
    _feedbackBurst: null,

    /** @type {Number} **/
    _previousBestScore: 0,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.UserManager} userManager
     * @param {core.GameManager} gameManager
     */
    ctor: function (notifier, userManager, gameManager) {
        let dimensions = cc.size(900, 860);
        this.userManager = userManager;
        this.gameManager = gameManager;
        
        this._super(notifier, dimensions, "Game Over");
        this.createConfirmButton(
            "Retry",
            core.colorHelpers.get(core.ColorHelpers.SUCCESS, true),
            core.colorHelpers.get(core.ColorHelpers.SUCCESS)
        );

        this._createElements();
        this._positionElements();

        this._previousBestScore = this.userManager.getPreviousBestScore();
        this._scoreHud.setLblPlusAnimationEnabled(false);
        this._scoreHud.setScore(0, 0);
        this._scoreHud.setBestScore(this._previousBestScore, 0);
    },

    /**
     * @private
     */
    _createElements: function () {
        this._scoreHud = new core.ScoreHud();

        this._lblShare = new core.Label("SHARE", core.Fonts.PATUA_ONE_SMALL, 1200, cc.TEXT_ALIGNMENT_CENTER);
        this._lblShare.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));

        this._btnTweet = new core.SpriteButton(core.SpriteFrameBundles.TWITTER_BUTTON);
        this._btnTweet.setSoundUrl(core.Sounds.SFX_CLICK);

        this._feedbackBurst = new core.Burst();
        this._feedbackBurst.build(18, 1.6, 1200, 600);
        this._feedbackBurst.cacheActions(18, true);
        this._feedbackBurst.setParticleColor(core.colorHelpers.get(core.ColorHelpers.GOLD));
        this._feedbackBurst.setLocalZOrder(99);

        this.addChild(this._scoreHud);
        this.addChild(this._lblShare);
        this.addChild(this._btnTweet);
        this.addChild(this._feedbackBurst);

        this.buttons.push(this._btnTweet);
    },

    /**
     * @private
     */
    _positionElements: function () {
        this._scoreHud.setPositionY(this._lblTitle.y - 100);
        this._lblShare.setScale(0.9);
        this._lblShare.setPositionY(this._scoreHud.y - 300);
        this._btnTweet.setPositionY(this._lblShare.y - 120);
        this._feedbackBurst.setPosition(0, this._scoreHud.y - 140);
    },

    /**
     * @override
     */
    onEnter: function () {
        this._super();
        this._lblShare.setVisible(false);
        this._btnTweet.setVisible(false);
        this._btnClose.setVisible(false);
    },

    /**
     * @override
     */
    tweenIn: function () {
        this._tweenCompletionCallback = this._onTweenInComplete;
        this._super();
    },

    /**
     * @public
     */
    onParentLayerResize: function () {
        this._super();
        if(!this._isAnimationComplete) {
            this._onTweenInComplete();
        }
    },

    /**
     * @private
     */
    _onTweenInComplete: function () {
        this.setOpacity(255);

        this._score = this._score || this.gameManager.getScore();
        let scoreAnimationDuration = core.mathHelpers.clamp(this._score, 1, 10)/10;
        let scoreAnimationSoundIterations = core.mathHelpers.clamp(this._score, 1, 8);

        this._scoreHud.setScore(this._score, scoreAnimationDuration);
        if(this._score > 0) {
            this.runAction(cc.repeat(cc.sequence(
                cc.callFunc(function () {
                    this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_SCORE_COUNTER_SOFT);
                }, this),
                cc.delayTime(scoreAnimationDuration/scoreAnimationSoundIterations)
            ), scoreAnimationSoundIterations))
        }

        let newBestScore = this._previousBestScore !== this.userManager.getBestScore();
        this.gameManager.reset(true);

        this.runAction(cc.sequence(
            cc.delayTime(scoreAnimationDuration),
            cc.callFunc(function () {
                if(newBestScore) {
                    this._scoreHud.setBestScore(this.userManager.getBestScore(), 0);
                    this.runAction(cc.sequence(
                        cc.callFunc(function () {
                            this._scoreHud.animateNewBestScore();
                            this._feedbackBurst.play();
                            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_NEW_BEST);
                        }, this),
                        cc.delayTime(0.15),
                        core.actionHelpers.flutter(0.3, 2, 10, 0),
                    ))
                }
            }, this),

            cc.delayTime(newBestScore ? 0.3 : 0.01),
            cc.callFunc(function () {
                this._lblShare.setVisible(true);
                this._lblShare.setOpacity(0);
                this._lblShare.runAction(cc.fadeIn(0.3));

                this._btnTweet.setVisible(true);
                this._btnTweet.setScale(1.5);
                this._btnTweet.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_CLICK_DROP);
            }, this),

            cc.delayTime(0.3),
            cc.callFunc(function () {
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.GAME_OVER_ANIMATION_COMPLETE);
                this._btnClose.setVisible(true);
                this._btnClose.setScale(1.5);
                this._btnClose.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
                this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_CLICK_DROP);
            }, this),

            cc.delayTime(0.3),
            cc.callFunc(function () {
                this.getInteractiveLayer().unlock();
                this._isAnimationComplete = true;
            }, this)
        ))
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        if(button === this._btnClose) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.REQUESTED_RESTART);
        }
        else if(button === this._btnTweet) {
            this.sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.CLICKED_ON_SHARE_SCORE, this.gameManager.getScore())
        }
    },

    /**
     * @abstract
     */
    destroy: function () {
        this.userManager.notifier.removeSubscription(this);
        this.gameManager.notifier.removeSubscription(this);
    }
})