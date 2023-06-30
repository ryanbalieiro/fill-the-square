/**
 * Created by Ryan Balieiro on 26/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ItemCollectionModel = cc.Class.extend({

    /** @type {Object} **/
    _categoriesHash: null,

    /**
     * @constructs
     * @param {Object} categories
     */
    ctor: function (categories) {
        this._categoriesHash = {};

        let type;
        for(type in categories) {
            let typeCategories = categories[type];

            for(let category in typeCategories) {
                let categoryItems = typeCategories[category];
                this._categoriesHash[category] = [];

                for(let i in categoryItems) {
                    let item = categoryItems[i];
                    this._categoriesHash[category].push(
                        new core.ItemModel(item.id, item.name, item.description, item.price, item.startAmount, type, category)
                    )
                }
            }
        }
    },

    /**
     * @returns {Object}
     */
    getCategories() {
        return this._categoriesHash;
    },

    /**
     * @param {String|core.ItemCollectionModel.PresetCategories} category
     */
    getCategoryList: function (category) {
        return this._categoriesHash[category];
    }
})

/**
 * @type {{THEMES: string, BOOSTS: string}}
 */
core.ItemCollectionModel.PresetCategories = {
    BOOSTS: "boosts",
    THEMES: "themes"
}