/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {cc.Node}
 */
core.ScoreHud = cc.Node.extend({
    /** @type {core.Label} **/
    _lblScore:null,

    /** @type {core.Sprite} **/
    _sprCrown:null,

    /** @type {core.Sprite} **/
    _sprNewBest:null,

    /** @type {core.Label} **/
    _lblBest:null,

    /** @type {core.Label} **/
    _lblPlus: null,

    /** @type {Boolean} **/
    _lblPlusAnimationEnabled: true,

    /** @type {core.GameManager} **/
    gameManager:null,

    /** @type {core.UserManager} **/
    userManager:null,

    /**
     * @constructs
     * @param {core.GameManager} [gameManager]
     * @param {core.UserManager} [userManager]
     */
    ctor: function (gameManager, userManager) {
        this._super();

        this._createElements();
        this._positionElements();

        this.gameManager = gameManager;
        this.userManager = userManager;

        if(gameManager) {
            this.setScore(this.gameManager.getScore());
            this.gameManager.notifier.addSubscription(this, this.onGameManagerEvent);
        }

        if(userManager) {
            this.setBestScore(this.userManager.getBestScore());
            this.userManager.notifier.addSubscription(this, this.onUserManagerEvent);
        }
    },

    /**
     * @private
     */
    _createElements: function () {
        this._lblScore = new core.Label("-", core.Fonts.PATUA_ONE_LARGE, 950, cc.TEXT_ALIGNMENT_CENTER);
        this._lblScore.setDataType(core.Label.DataType.INT);

        this._sprCrown = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.CROWN));
        this._sprNewBest = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.NEW_LABEL));

        this._lblBest = new core.Label("-", core.Fonts.PATUA_ONE_SMALL, 400, cc.TEXT_ALIGNMENT_LEFT);
        this._lblBest.setColor(core.colorHelpers.get(core.ColorHelpers.YELLOW));
        this._lblBest.setDataType(core.Label.DataType.INT);

        this._lblPlus = new core.Label("+0", core.Fonts.PATUA_ONE_SMALL, 400, cc.TEXT_ALIGNMENT_LEFT);
        this._lblPlus.setColor(core.colorHelpers.get(core.ColorHelpers.SUCCESS));

        this.addChild(this._lblScore);
        this.addChild(this._sprCrown);
        this.addChild(this._lblBest);
        this.addChild(this._lblPlus);
        this.addChild(this._sprNewBest);
    },

    /**
     * @private
     */
    _positionElements: function () {
        this._lblScore.y -= 60;
        this._sprCrown.y -= 175;
        this._lblBest.y -= 170;
        this._sprNewBest.y -= 155;
        this._sprNewBest.setVisible(false);
        this._lblPlus.setVisible(false);
        this._lblPlus.setAnchorPoint(cc.p(0, 0.5));
    },

    /**
     * @param {Boolean} enabled
     */
    setLblPlusAnimationEnabled: function (enabled) {
        this._lblPlusAnimationEnabled = enabled;
    },

    /**
     * @param {Number} newScore
     * @param {Number} [duration=0.3]
     */
    setScore: function (newScore, duration) {
        if(duration === null || duration === undefined)
            duration = 0.2;

        let currentScore = parseInt(this._lblScore.getString());
        if(newScore !== currentScore) {
            this._animateLblScore(newScore, duration);
            if(this._lblPlusAnimationEnabled) {
                this._animateLblPlus(newScore, currentScore);
            }
        }
    },

    /**
     * @param {Number} newScore
     * @param {Number} duration
     * @private
     */
    _animateLblScore: function (newScore, duration) {
        if(duration > 0) {
            this._lblScore.setStringWithAnimation(newScore.toString(), duration);
            this._lblScore.stopAllActions();
            this._lblScore.runAction(cc.sequence(
                cc.scaleTo(0.3, 1.1, 1.1).easing(cc.easeSineOut()),
                cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())
            ))
        }
        else {
            this._lblScore.setString(newScore);
        }
    },

    /**
     * @param {Number} newScore
     * @param {Number} currentScore
     * @private
     */
    _animateLblPlus: function (newScore, currentScore) {
        let difference = newScore - currentScore;
        if(difference > 0) {
            this._lblPlus.cleanup();
            this._lblPlus.setString("+" + difference);

            this._lblPlus.setVisible(true);
            this._lblPlus.setOpacity(255);
            this._lblPlus.setPosition(this._lblScore.x + 35 + 30*(newScore.toString().length), this._lblScore.y);
            this._lblPlus.setScale(2);

            this._lblPlus.runAction(cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.2, 1, 1).easing(cc.easeSineOut()),
                    cc.moveBy(0.5, 0, 20).easing(cc.easeSineOut())
                ),
                cc.fadeOut(0.1)
            ));
        }
    },

    /**
     * @param {Number} score
     * @param {Number} [duration=0.3]
     */
    setBestScore: function (score, duration) {
        if(duration === null || duration === undefined)
            duration = 0.3;

        let scoreToString = score.toString();
        let offset = (scoreToString.length - 1)*14;
        this._sprCrown.x = -20 - offset;
        this._lblBest.x = 40;
        this._sprNewBest.x = 100 + offset;

        if(duration > 0) {
            this._lblBest.setStringWithAnimation(scoreToString, 0.3);
        }
        else {
            this._lblBest.setString(scoreToString);
        }
    },

    /**
     * @public
     */
    animateNewBestScore: function () {
        this._sprNewBest.setVisible(true);
        this._sprNewBest.setScale(3);
        this._sprNewBest.runAction(cc.sequence(
            cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this._sprNewBest.runAction(cc.repeatForever(
                    cc.sequence(
                        cc.scaleTo(0.3, 1.1),
                        cc.scaleTo(0.3, 1),
                    )
                ))
            }, this)
        ));
    },
    /**
     * @param {core.UserManager.Events} event
     * @param {Number} parameter
     */
    onGameManagerEvent: function (event, parameter) {
        if(event === core.GameManager.Events.SCORE_CHANGED) {
            this.setScore(this.gameManager.getScore());
        }
    },

    /**
     * @param {core.UserManager.Events} event
     */
    onUserManagerEvent: function (event) {
        if(event === core.UserManager.Events.BEST_SCORE_CHANGED) {
            this.setBestScore(this.userManager.getBestScore());
        }
    }
})