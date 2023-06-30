/**
 * Created by Ryan Balieiro on 29/08/20.
 * @class
 * @extends {cc.Node}
 */
core.Toast = cc.Node.extend({
    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.Label} **/
    _lblMessage:null,

    /** @type {core.Sprite} **/
    _icon: null,

    /** @type {core.Toast.Status} **/
    _status: null,

    /** @type {Number} **/
    _autoHideTime:2,
    
    /**
     * @constructs
     */
    ctor: function () {
        this._super();

        this._scale9Bg = new ccui.Scale9Sprite(cc.spriteFrameCache.getSpriteFrame(
            core.SpriteFramePatterns.POP_UP_BACKGROUND.replace("${palette}", core.ColorHelpers.Palettes.DARK)
        ));

        this._scale9Bg.setCapInsets(cc.rect(80, 80, 80, 80));
        this._scale9Bg.setContentSize(cc.size(1000, 220));

        this._lblTitle = new core.Label("Title", core.Fonts.PATUA_ONE_SMALL, 900, cc.TEXT_ALIGNMENT_CENTER);
        this._lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));

        this._lblMessage = new core.Label("Message", core.Fonts.PATUA_ONE_SMALL, 900, cc.TEXT_ALIGNMENT_CENTER);
        this._lblMessage.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));

        this.addChild(this._scale9Bg);
        this.addChild(this._lblTitle);
        this.addChild(this._lblMessage);

        this.setCascadeOpacityEnabled(true);
        this.setOpacity(240);

        this._lblTitle.setPositionY(40);
        this._lblMessage.setPositionY(-25);
        this._lblMessage.setScale(0.8);

        this.setInactive();
    },

    /**
     * @param {Number} time
     */
    setAutoHideTime: function (time) {
        this._autoHideTime = time;
    },

    /**
     * @public
     */
    setInactive: function () {
        this.cleanup();
        this._status = core.Toast.Status.INACTIVE;
        this.setVisible(false);
    },

    /**
     * @public
     */
    setReady: function () {
        this.cleanup();
        this._status  = core.Toast.Status.READY;
    },

    /**
     * @public
     * @param {Boolean} autoHide
     */
    show: function (autoHide) {
        this.updateLayout();
        this.setVisible(true);
        this.y -= 400;

        if(autoHide) {
            this._status = core.Toast.Status.SHOWING_AUTO_HIDE;
            this.runAction(cc.sequence(
                cc.moveBy(0.3, 0, 400).easing(cc.easeBackOut()),
                cc.delayTime(this._autoHideTime),
                cc.callFunc(this.hide, this)
            ));
        }
        else {
            this._status = core.Toast.Status.SHOWING_FIXED;
            this.runAction(cc.sequence(
                cc.moveBy(0.3, 0, 400).easing(cc.easeBackOut())
            ));
        }
    },

    /**
     * @public
     */
    hide: function () {
        if(this._status !== core.Toast.Status.SHOWING_FIXED && this._status !== core.Toast.Status.SHOWING_AUTO_HIDE) {
            this.setInactive();
            return;
        }

        this._status = core.Toast.Status.HIDING;
        this.updateLayout();

        this.runAction(cc.sequence(
            cc.moveBy(0.3, 0, -400).easing(cc.easeBackIn()),
            cc.callFunc(this.setInactive, this)
        ));
    },

    /**
     * @return {core.Toast.Status}
     */
    getStatus: function () {
        return this._status;
    },

    /**
     * @public
     */
    updateLayout: function () {
        this.cleanup();

        let scaleFactor = core.layoutHelpers.getAdaptiveScaleFactorForSmallScreens();
        if(scaleFactor < 1)
            scaleFactor *= 0.9;

        this.setPosition(cc.winSize.width/2, 200);
        this.setScale(scaleFactor);
    },

    /**
     * @param {String} title
     * @param {String} message
     */
    setMessage: function (title, message) {
        this._centerMessage();
        this._lblTitle.setString(title);
        this._lblMessage.setString(message);
        this._deleteIcon();
    },

    /**
     * @param {String} iconSpriteFrame
     * @param {String} title
     * @param {String} message
     */
    setSpriteIconAndMessage: function (iconSpriteFrame, title, message) {
        this._makeRoomForIcon();
        this._lblTitle.setString(title);
        this._lblMessage.setString(message);
        this._deleteIcon();

        this._icon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(iconSpriteFrame));
        this.addChild(this._icon);
        this._positionIcon();
    },

    /**
     * @param {core.AchievementModel} achievementModel
     * @param {Number} currentValueForAchievement
     */
    setAchievementUnlockedFeedback: function (achievementModel, currentValueForAchievement) {
        this._makeRoomForIcon();
        this._lblTitle.setString("Achievement Unlocked!");
        this._lblMessage.setString(achievementModel.getName() + " - Lv." + achievementModel.calculateProgress(currentValueForAchievement).level);
        this._deleteIcon();

        this._icon = new core.AchievementBadge();
        this._icon.setIcon(achievementModel.getId());
        this.addChild(this._icon);
        this._positionIcon();
    },

    /**
     * @private
     */
    _centerMessage: function () {
        this._lblTitle.setPositionX(0);
        this._lblTitle.setAnchorPoint(cc.p(0.5, 0.5));
        this._lblTitle.setAlignment(cc.TEXT_ALIGNMENT_CENTER);

        this._lblMessage.setPositionX(0);
        this._lblMessage.setAnchorPoint(cc.p(0.5, 0.5));
        this._lblMessage.setAlignment(cc.TEXT_ALIGNMENT_CENTER);
    },

    /**
     * @private
     */
    _makeRoomForIcon: function () {
        this._lblTitle.setPositionX(-280);
        this._lblTitle.setAnchorPoint(cc.p(0, 0.5));
        this._lblTitle.setAlignment(cc.TEXT_ALIGNMENT_LEFT);

        this._lblMessage.setPositionX(-280);
        this._lblMessage.setAnchorPoint(cc.p(0, 0.5));
        this._lblMessage.setAlignment(cc.TEXT_ALIGNMENT_LEFT);
    },

    /**
     * @private
     */
    _positionIcon: function () {
        if(!this._icon)
            return;

        this._icon.setScale(120/this._icon.getBoundingBox().width);
        this._icon.setPosition(-380, 0);
    },

    /**
     * @private
     */
    _deleteIcon: function () {
        if(this._icon) {
            this._icon.removeFromParent(true);
            this.removeChild(this._icon);
            this._icon = null;
        }
    }
})

/**
 * @enum {String}
 */
core.Toast.Status = {
    INACTIVE: "inactive",
    READY: "ready",
    SHOWING_AUTO_HIDE: "showingAutoHide",
    SHOWING_FIXED: "showingFixed",
    HIDING: "hiding"
}