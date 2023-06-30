/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {cc.Class}
 */
core.DebugOptions = cc.Class.extend({
    /** @type {Boolean} **/
    _isProdMode: true,

    /**
     * @constructs
     */
    ctor: function () {
        this._isProdMode = cc.game.config['debugMode'] === 0;
    },

    /**
     * @param {core.DebugOptions.Flags} flag
     * @returns {Boolean}
     */
    getDebugFlag: function (flag) {
        return cc.game.config['debugFlags'][flag] && !this._isProdMode;
    }
})

/**
 * @enum
 */
core.DebugOptions.Flags = {
    IGNORE_PERSISTENCE: "ignorePersistence",
    SKIP_INTRO: "skipIntro"
}