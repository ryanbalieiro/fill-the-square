/**
 * Created by Ryan Balieiro on 26/08/20.
 */

/**
 * @enum {Function}
 */
core.layoutHelpers = {

    /**
     * @returns {number}
     */
    getWinProportion: function () {
        return cc.winSize.height / cc.winSize.width;
    },

    /**
     * @returns {Number}
     */
    getAdaptiveScaleFactorForSmallScreens: function () {
        return core.mathHelpers.clamp(cc.winSize.width/1000, 0.5, 1);
    },

    /**
     * @Boolean
     */
    isXs: function () {
        return this.getWinProportion() >= core.layoutHelpers.BreakPoints.XS;
    },

    /**
     * @Boolean
     */
    isSmOrLower: function () {
        return this.getWinProportion() >= core.layoutHelpers.BreakPoints.SM;
    },

    /**
     * @Boolean
     */
    isMdOrLower: function () {
        return this.getWinProportion() >= core.layoutHelpers.BreakPoints.MD;
    },

    /**
     * @Boolean
     */
    isLgOrLower: function () {
        return this.getWinProportion() >= core.layoutHelpers.BreakPoints.LG;
    },

    /**
     * @Boolean
     */
    isSmOrHigher: function () {
        return this.getWinProportion() <= core.layoutHelpers.BreakPoints.SM;
    },

    /**
     * @Boolean
     */
    isMdOrHigher: function () {
        return this.getWinProportion() <= core.layoutHelpers.BreakPoints.MD;
    },

    /**
     * @Boolean
     */
    isLgOrHigher: function () {
        return this.getWinProportion() <= core.layoutHelpers.BreakPoints.LG;
    }
};

/**
 * @enum
 */
core.layoutHelpers.BreakPoints = {
    XS: 1.5,
    SM: 1.33,
    MD: 1,
    LG: 0.75
}
