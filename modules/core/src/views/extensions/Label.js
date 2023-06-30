/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {cc.LabelBMFont}
 */
core.Label = cc.LabelBMFont.extend({
    /** @type {core.Label.DataType} **/
    _dataType: null,

    /**
     * @param str
     * @param fntFile
     * @param width
     * @param alignment
     * @param imageOffset
     */
    ctor: function (str, fntFile, width, alignment, imageOffset) {
        this._super(str, fntFile, width, alignment, imageOffset);
        this._dataType = core.Label.DataType.ANY;
    },

    /**
     * @param {core.Label.DataType} dataType
     */
    setDataType: function (dataType) {
        this._dataType = dataType;
    },

    /**
     * @param {String|Number|int} newString
     * @param {Number} duration
     */
    setStringWithAnimation: function (newString, duration) {
        this.unscheduleAllCallbacks();
        switch(this._dataType) {
            case core.Label.DataType.INT:
                this._performNumberInterpolation(newString, duration);
                break;
            default:
                this.setString(newString);
                break;
        }
    },

    /**
     * @param {String|Number|int} newString
     * @param {Number} duration
     * @private
     */
    _performNumberInterpolation: function (newString, duration) {
        let initialValue = parseInt(this.getString()) || 0;
        let finalValue = parseInt(newString);

        let diff = finalValue - initialValue;
        let totalElapsed = 0;

        let self = this;
        self.setString(initialValue);

        this.update = function (dt) {
            totalElapsed += dt;
            if(totalElapsed >= duration) {
                totalElapsed = duration;
                this.unscheduleUpdate();
            }

            let currentValue = initialValue + Math.round(diff*totalElapsed/duration);
            self.setString(currentValue);
        };

        this.scheduleUpdate();
    }
})

/**
 * @enum
 */
core.Label.DataType = {
    ANY: "dataTypeAny",
    INT: "dataTypeInt"
}