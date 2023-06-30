/**
 * Created by Ryan Balieiro on 26/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ItemWalletModel = cc.Class.extend({

    /** @type {Object} **/
    _itemStatusHash: null,

    /** @type {Object} **/
    _selectedItemIdsHash: null,

    /** @type {String[]} **/
    _consumableItemKeys: null,

    /** @type {String[]} **/
    _featureItemKeys: null,

    /**
     * @constructs
     * @param {core.ItemCollectionModel} itemCollectionModel
     */
    ctor: function (itemCollectionModel) {
        let categories = itemCollectionModel.getCategories();

        this._itemStatusHash = {};
        this._selectedItemIdsHash = {};

        this._consumableItemKeys = [];
        this._featureItemKeys = [];

        for(let i in categories) {
            for(let j = 0 ; j < categories[i].length ; j++) {
                let item = categories[i][j];
                let id = item.getId();

                if(this._itemStatusHash.hasOwnProperty(id)) {
                    throw new Error("Duplicated item! All itemIDs must be unique!");
                }

                switch(item.getType()) {
                    case core.ItemModel.Types.CONSUMABLE:
                        this._itemStatusHash[id] = item.getStartAmount();
                        this._consumableItemKeys.push(id);
                        break;
                    case core.ItemModel.Types.SELECTABLE:
                        this._itemStatusHash[id] = core.ItemWalletModel.SelectableItemStatus.LOCKED;
                        this._featureItemKeys.push(id);
                        if(j === 0) {
                            this._itemStatusHash[id] = core.ItemWalletModel.SelectableItemStatus.UNLOCKED;
                            this.select(item);
                        }
                        break;
                }
            }
        }
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    getItemAmount: function(itemModel) {
        if(itemModel.getType() !== core.ItemModel.Types.CONSUMABLE) {
            return -1;
        }

        return this._itemStatusHash[itemModel.getId()];
    },

    /**
     * @param itemModel
     * @returns {core.ItemWalletModel.SelectableItemStatus|null}
     */
    getItemStatus: function (itemModel) {
        if(itemModel.getType() === core.ItemModel.Types.CONSUMABLE) {
            return null;
        }

        return this._itemStatusHash[itemModel.getId()];
    },

    /**
     * @param itemCategory
     */
    getSelectedItem: function (itemCategory) {
        return this._selectedItemIdsHash[itemCategory];
    },

    /**
     * @param {core.ItemModel} itemModel
     * @param {Number} amount
     */
    transact: function (itemModel, amount) {
        if(itemModel.getType() !== core.ItemModel.Types.CONSUMABLE) {
            return;
        }

        this._itemStatusHash[itemModel.getId()] += amount;
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    unlock: function (itemModel) {
        if(itemModel.getType() === core.ItemModel.Types.CONSUMABLE) {
            return;
        }

        let id = itemModel.getId();
        if(this._itemStatusHash[id] === core.ItemWalletModel.SelectableItemStatus.SELECTED)
            return;
        this._itemStatusHash[id] = core.ItemWalletModel.SelectableItemStatus.UNLOCKED;
    },

    /**
     * @param {core.ItemModel} itemModel
     */
    select: function (itemModel) {
        if(itemModel.getType() === core.ItemModel.Types.CONSUMABLE) {
            return;
        }

        let id = itemModel.getId();
        if(this._itemStatusHash[id] === core.ItemWalletModel.SelectableItemStatus.LOCKED)
            return;

        let category = itemModel.getCategory();
        if(this._selectedItemIdsHash[category])
            this._itemStatusHash[this._selectedItemIdsHash[category]] = core.ItemWalletModel.SelectableItemStatus.UNLOCKED;

        this._itemStatusHash[id] = core.ItemWalletModel.SelectableItemStatus.SELECTED;
        this._selectedItemIdsHash[category] = id;
    },

    /**
     * @returns {number}
     */
    getPercentageOfItemsUnlocked: function () {
        let unlockedItems = 0;
        for(let i = 0 ; i < this._featureItemKeys.length ; i++) {
            let itemStatus = this._itemStatusHash[this._featureItemKeys[i]];
            if(itemStatus !== core.ItemWalletModel.SelectableItemStatus.LOCKED) {
                unlockedItems++;
            }
        }

        return unlockedItems*100/this._featureItemKeys.length;
    },

    /**
     * @public
     * @returns {*}
     */
    getHashForSaving: function () {
        return {hash: this._itemStatusHash, selectStatus: this._selectedItemIdsHash};
    },

    /**
     * @return {boolean}
     */
    hasAnyConsumable: function () {
        for(let id in this._itemStatusHash) {
            if(typeof this._itemStatusHash[id] !== 'string' && this._itemStatusHash[id] > 0) {
                return true;
            }
        }

        return false;
    },

    /**
     *  @public
      * @param {Object} object
     */
    loadFrom: function (object) {
        this._itemStatusHash = object.hash;
        this._selectedItemIdsHash = object.selectStatus;
    }
})

/**
 * @type {{UNLOCKED: number, SELECTED: number, LOCKED: number}}
 */
core.ItemWalletModel.SelectableItemStatus = {
    LOCKED: "locked",
    UNLOCKED: "unlocked",
    SELECTED: "selected"
}