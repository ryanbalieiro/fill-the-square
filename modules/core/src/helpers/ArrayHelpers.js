/**
 * Created by Ryan Balieiro on 30/07/19.
 */

/**
 * @enum {Function}
 */
core.arrayHelpers = {
    /**
     * @param {Array} array
     * @returns {Array}
     */
    shuffle: function(array) {
        for(let j, x, i = array.length; i; j = Math.floor(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
        return array;
    },

    /**
     * @param {Array} array
     * @returns {Array}
     */
    clone: function(array) {
        const cloned = [];
        for(let i in array)
            cloned[i] = array[i];
        return cloned;
    },

    /**
     * @param {Object} object
     * @returns {Array}
     */
    fromObject: function(object) {
        const array = [];
        for(let i in object)
            array.push(object[i]);
        return array;
    }
};
