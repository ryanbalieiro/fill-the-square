/**
 * Created by Ryan Balieiro on 29/08/20.
 * @class
 * @extends {cc.Node}
 */
core.AchievementCard = cc.Node.extend({
    /** @type {core.Label} **/
    _lblTitle:null,

    /** @type {core.Label} **/
    _lblValue:null,

    /** @type {core.AchievementBadge} **/
    _badge: null,
    
    /** @type {core.ProgressBar} **/
    _progressBar: null,

    /** @type {core.Sprite} **/
    _sprSeparator: null,

    /**
     * @constructs
     * @param {cc.Size} dimensions
     */
    ctor: function (dimensions) {
        this._super();

        this._lblTitle = new core.Label("CATEGORY - LV. 1", core.Fonts.PATUA_ONE_SMALL, dimensions.width, cc.TEXT_ALIGNMENT_LEFT);
        this._lblTitle.setColor(core.colorHelpers.get(core.ColorHelpers.PRIMARY));
        this._lblTitle.setScale(0.7);
        this._lblTitle.setAnchorPoint(cc.p(0, 0));

        this._lblValue = new core.Label("NEXT LEVEL: 40/100", core.Fonts.PATUA_ONE_SMALL, dimensions.width, cc.TEXT_ALIGNMENT_LEFT);
        this._lblValue.setColor(core.colorHelpers.get(core.ColorHelpers.SECONDARY));
        this._lblValue.setScale(0.55);
        this._lblValue.setAnchorPoint(cc.p(0, 0));

        this._badge = new core.AchievementBadge();

        this._progressBar = new core.ProgressBar(dimensions.width*0.7, 20);

        this.addChild(this._lblTitle);
        this.addChild(this._lblValue);
        this.addChild(this._badge);
        this.addChild(this._progressBar);

        this._badge.setPosition(-dimensions.width/2 + 80, -10);
        this._lblTitle.setPosition(-dimensions.width/2 + 170, dimensions.height/2 - 65);
        this._lblValue.setPosition(-dimensions.width/2 + 180, this._lblTitle.y - 45);
        this._progressBar.setPosition(50, this._lblValue.y - 40);
    },

    /**
     * @param {core.AchievementModel} achievementModel
     * @param {Number} currentValue
     */
    setModel: function (achievementModel, currentValue) {
        let progress = achievementModel.calculateProgress(currentValue);
        let progressDisplay = Math.round(currentValue);

        if(!achievementModel.isPercentage()) {
            this._lblTitle.setString(achievementModel.getName().toUpperCase() + " - LV. " + progress.level);
            if(progress.totalValue > currentValue) {
                progressDisplay += "/" + progress.totalValue;
            }
        }
        else {
            this._lblTitle.setString(achievementModel.getName().toUpperCase());
            progressDisplay += "%";
        }

        this._lblValue.setString(achievementModel.getDescription() + ": " + progressDisplay);
        this._badge.setIcon(achievementModel.getId());
        this._progressBar.setPercentage(currentValue*100/progress.totalValue);
    }
})