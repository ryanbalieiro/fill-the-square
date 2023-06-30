/**
 * Created by Ryan Balieiro on 03/09/20.
 * @class
 * @extends {core.Sprite}
 */
core.Hand = core.Sprite.extend({
    /**
     * @constructs
     */
    ctor: function () {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.HAND));
        this.setAnchorPoint(cc.p(0.8, 0.9))
    },

    /**
     * @param {cc.Point} from
     * @param {cc.Point} to
     */
    drag: function (from, to) {
        this.cleanup();
        this.setVisible(true);

        this.runAction(cc.repeatForever(cc.sequence(
            cc.place(from.x, from.y),
            cc.delayTime(0.4),
            cc.callFunc(this.setPressed, this),
            cc.delayTime(0.1),
            cc.moveTo(1, to.x, to.y).easing(cc.easeSineOut()),
            cc.delayTime(0.1),
            cc.callFunc(this.setReleased, this),
            cc.delayTime(0.4)
        )))
    },

    /**
     * @public
     */
    setPressed: function () {
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.HAND_PRESSED));
    },

    /**
     * @public
     */
    setReleased: function () {
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.HAND));
    },

    /**
     * @public
     */
    stop: function () {
        this.cleanup();
        this.setReleased();
        this.setVisible(false);
    }
})