/**
 * Created by Ryan Balieiro on 30/07/19.
 */

/**
 * @enum {Function}
 */
core.mathHelpers = {
    /**
     * @param {Number} value
     * @param {Number} min
     * @param {Number} max
     */
    clamp: function (value, min, max) {
        if (value < min)
            return min;
        else if (value > max)
            return max;
        else
            return value;
    },

    /**
     * @param {Number} val
     * @param {Number} min
     * @param {Number} max
     * @returns {boolean}
     */
    isBetween: function (val, min, max) {
        return val > min && val < max;
    },

    /**
     * @param {Number} val
     * @param {Number} min
     * @param {Number} max
     * @returns {boolean}
     */
    isEqualOrBetween: function (val, min, max) {
        return val >= min && val <= max;
    },

    /**
     * @returns {Number}
     */
    generateUniqueIdentifier: function () {
        core.mathHelpers.uuidCount = core.mathHelpers.uuidCount || 0;
        core.mathHelpers.uuidCount++;
        return core.mathHelpers.uuidCount + Math.random();
    }
};
