/**
 * Created by Ryan Balieiro on 30/07/19.
 */

/**
 * @enum {Function}
 */
core.stringHelpers = {
    /**
     * @param namePattern
     * @param {String|Number} suffixValue
     */
    getSpriteFrameNameWithSuffix: function (namePattern, suffixValue) {
        let parsedSuffix = core.stringHelpers.numberToString(parseInt(suffixValue), 4);
        return namePattern.replace("${suffix}", parsedSuffix);
    },

    /**
     * @param {Number} number
     * @param {int} minStringLength
     */
    numberToString: function (number, minStringLength) {
        let str = number.toString();
        while (str.length < minStringLength) {
            str = "0" + str;
        }

        return str;
    }
};
