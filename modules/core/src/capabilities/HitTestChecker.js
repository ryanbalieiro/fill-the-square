/**
 * Created by Ryan Balieiro on 01/09/20.
 * @class
 * @extends {cc.Class}
 */
core.HitTestChecker = cc.Class.extend({
    /** @type {cc.Node} **/
    _target: null,

    /** @type {cc.Rect} **/
    _cachedWorldBoundingBox: null,

    /** @type {Object} **/
    _stateForCachedBoundingBox: null,

    /** @type {Boolean} **/
    _autoCache: true,

    /**
     * @constructs
     * @param {cc.Node} target
     */
    ctor: function (target) {
        this._target = target;
    },

    /**
     * @param {cc.Point} globalCoords
     * @param {Number} offset
     */
    contains: function (globalCoords, offset) {
        let rect = this.getCachedWorldBoundingBox(offset);
        return cc.rectContainsPoint(rect, globalCoords);
    },

    /**
     * @param {Number} offset
     * @returns {cc.Rect}
     */
    getCachedWorldBoundingBox: function (offset) {
        if(!this._validateCachedBoundingBox() && this._autoCache)
            this.emptyCache();

        if(!this._cachedWorldBoundingBox)
            this._cacheWorldBoundingBox(offset);

        return this._cachedWorldBoundingBox;
    },

    /**
     * @public
     */
    emptyCache: function () {
        this._cachedWorldBoundingBox = null;
    },

    /**
     * @param {Boolean} enabled
     */
    setAutoCacheEnabled: function (enabled) {
        this._autoCache = enabled;
    },

    /**
     * @private
     */
    _validateCachedBoundingBox: function () {
        if(!this._stateForCachedBoundingBox)
            return false;

        return  this._target.x              === this._stateForCachedBoundingBox.x &&
                this._target.y              === this._stateForCachedBoundingBox.y &&
                this._target.getParent().x  === this._stateForCachedBoundingBox.parentX &&
                this._target.getParent().y  === this._stateForCachedBoundingBox.parentY
    },

    /**
     * @param {Number} offset
     * @private
     */
    _cacheWorldBoundingBox: function (offset) {
        this._cachedWorldBoundingBox = this._target.getBoundingBoxToWorld();

        this._cachedWorldBoundingBox.x -= offset;
        this._cachedWorldBoundingBox.y -= offset;
        this._cachedWorldBoundingBox.width += offset*2;
        this._cachedWorldBoundingBox.height += offset*2;

        this._stateForCachedBoundingBox = {};
        this._stateForCachedBoundingBox.x = this._target.x;
        this._stateForCachedBoundingBox.y = this._target.y;
        this._stateForCachedBoundingBox.parentX = this._target.getParent().x;
        this._stateForCachedBoundingBox.parentY = this._target.getParent().y;
    }
})