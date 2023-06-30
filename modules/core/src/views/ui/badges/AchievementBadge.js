/**
 * Created by Ryan Balieiro on 29/08/20.
 * @class
 * @extends {core.Sprite}
 */
core.AchievementBadge = core.Sprite.extend({

    /** @type {core.Sprite} **/
    _sprIcon: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.ACHIEVEMENT_BADGE));

        this._sprIcon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.ACHIEVEMENT_BADGE));
        this._sprIcon.setAnchorPoint(cc.p(0, 0));
        this.addChild(this._sprIcon);
    },

    /**
     * @param {String} spriteFrameSuffix
     */
    setIcon: function (spriteFrameSuffix) {
        this._sprIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(
            core.SpriteFrameBundles.ACHIEVEMENT_ICONS[spriteFrameSuffix] || core.SpriteFrameBundles.ACHIEVEMENT_ICONS["score"]
        ));

        this._sprIcon.setScale(1);
        this._sprIcon.setScale(50/this._sprIcon.getBoundingBox().width);

        let iconBounds = this._sprIcon.getBoundingBox();
        this._sprIcon.setPosition((100 - iconBounds.width)/2, (115 - iconBounds.height)/2)
    }
})