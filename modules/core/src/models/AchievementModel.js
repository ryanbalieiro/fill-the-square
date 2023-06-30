/**
 * Created by Ryan Balieiro on 29/08/20.
 * @class
 * @extends {cc.Class}
 */
core.AchievementModel = cc.Class.extend({
    /** @type {String|null} **/
    _id:  null,

    /** @type {String} **/
    _name: null,

    /** @type {String} **/
    _description: null,

    /** @type {Number[]} **/
    _breakpoints: null,

    /**
     * @constructs
     * @param {String} id
     * @param {String} name
     * @param {String} description
     * @param {Number[]} breakpoints
     */
    ctor: function (id, name, description, breakpoints) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._breakpoints = breakpoints;
    },

    /**
     * @return {String}
     */
    getId: function () {
        return this._id;
    },

    /**
     * @return {String}
     */
    getName: function () {
        return this._name;
    },

    /**
     * @returns {String}
     */
    getDescription: function () {
        return this._description;
    },

    /**
     * @returns {boolean}
     */
    isPercentage: function () {
        return this._breakpoints.length === 1 && this._breakpoints[0] === 100;
    },

    /**
     * @param {Number} currentValue
     * @returns {{totalValue: Number, level: Number|String}}
     */
    calculateProgress: function (currentValue) {
        let totalValue = null;
        let level = null;

        for(let i = 0 ; i < this._breakpoints.length ; i++) {
            if(currentValue < this._breakpoints[i]) {
                totalValue = this._breakpoints[i];
                level = i + 1;
                break;
            }
        }

        if(totalValue === null) {
            totalValue = this._breakpoints[this._breakpoints.length - 1];
            level = "MAX";
        }

        return {
            totalValue: totalValue,
            level: level
        };
    }
})

core.AchievementModel.PresetCategories = {
    SCORE: "score",
    COINS: "coins",
    SESSIONS: "sessions",
    ITEMS: "items"
}