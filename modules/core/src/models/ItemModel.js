/**
 * Created by Ryan Balieiro on 25/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ItemModel = cc.Class.extend({

    /** @type {int|null} **/
    _id:  null,

    /** @type {String} **/
    _name: null,

    /** @type {String} **/
    _description: null,

    /** @type {Number} **/
    _startAmount: null,

    /** @type {Number} **/
    _price: 0,

    /** @type {core.ItemModel.Types} **/
    _type: null,

    /** @type {String} **/
    _category: null,

    /**
     * @constructs
     * @param {int} id
     * @param {String} name
     * @param {String} description
     * @param {Number} startAmount
     * @param {Number} category
     * @param {core.ItemModel.Types} type
     * @param {String} category
     */
    ctor: function (id, name, description, price, startAmount, type, category) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._startAmount = startAmount;
        this._price = price;
        this._type = type;
        this._category = category;
    },

    /**
     * @returns {Number}
     */
    getId: function () {
        return this._id;
    },

    /**
     * @returns {String}
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
     * @returns {Number}
     */
    getPrice: function () {
        return this._price;
    },

    /**
     * @returns {Number}
     */
    getStartAmount: function () {
        return this._startAmount;
    },

    /**
     * @returns {core.ItemModel.Types}
     */
    getType: function () {
        return this._type;
    },

    /**
     * @returns {String}
     */
    getCategory: function () {
        return this._category;
    }
})

/**
 * @enum
 */
core.ItemModel.Types = {
    CONSUMABLE: "consumable",
    SELECTABLE: "selectable"
}
