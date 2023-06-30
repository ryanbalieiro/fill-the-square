/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.Sprite}
 */
core.Button = core.Sprite.extend({
    /** @type {String} **/
    _status: null,

    /** @type {String|core.Sounds|*} **/
    _soundUrl: null,

    /**
     * @param {String} status
     */
    setStatus: function (status) {
        this._status = status;
    },

    /**
     * @returns {String}
     */
    getStatus: function () {
        return this._status;
    },

    /**
     * @returns {boolean}
     */
    isEnabled: function () {
        return this._status !== core.Button.Status.DISABLED && this._status !== core.Button.Status.SELECTED;
    },

    /**
     * @param {String|*} soundUrl
     */
    setSoundUrl: function (soundUrl) {
        this._soundUrl = soundUrl;
    },

    /**
     * @return {String|core.Sounds|*}
     */
    getSoundUrl: function () {
        return this._soundUrl;
    }
})

core.Button.Status = {
    IDLE: "idle",
    HOVERED: "hovered",
    PRESSED: "pressed",
    DISABLED: "disabled",
    SELECTED: "selected"
}