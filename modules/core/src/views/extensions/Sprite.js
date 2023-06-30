/**
 * Created by Ryan Balieiro on 20/04/20.
 * @class
 * @extends {cc.Sprite}
 */
core.Sprite = cc.Sprite.extend({
    /** @type {core.HitTestChecker} **/
    hitTestChecker: null,

    /**
     * @param {String} fileName
     * @param {cc.Rect} rect
     * @param {Boolean} rotated
     */
    ctor: function (fileName, rect, rotated) {
        this._super(fileName, rect, rotated);
        this.hitTestChecker = new core.HitTestChecker(this);
    },
})