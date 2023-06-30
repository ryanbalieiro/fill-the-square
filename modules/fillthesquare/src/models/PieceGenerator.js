/**
 * Created by Ryan Balieiro on 02/09/20.
 * @class
 * @extends {cc.Class}
 */
fts.PieceGenerator = cc.Class.extend({
    /** @type {Number} **/
    _count: null,

    /** @type {Number[]} **/
    _recentPresets: null,

    /** @type {Number} **/
    _roundsSinceLastStandAloneBlock: 0,

    /**
     * @constructs
     */
    ctor: function () {
        this._count = -1;
        this._recentPresets = [];
    },

    /**
     * @return {fts.PieceModel}
     */
    makePieceModel: function () {
        this._count++;
        if(this._count === fts.PieceGenerator.RandMultipliers.length)
            this._count = 0;

        let presetId;
        if(this._roundsSinceLastStandAloneBlock > 5 && Math.random() > 0.5) {
            presetId = 0;
        }
        else {
            presetId = this._getRandomPresetId();
        }

        if(presetId === 0)
            this._roundsSinceLastStandAloneBlock = 0;
        else
            this._roundsSinceLastStandAloneBlock++;

        this._addToRecentPresets(presetId);

        let pieceModel = new fts.PieceModel(presetId);
        let randomRotations = Math.floor(Math.random()*4);
        for(let i = 0 ; i < randomRotations ; i++) {
            pieceModel.rotate();
        }

        return pieceModel;
    },

    /**
     * @private
     */
    _getRandomPresetId: function () {
        let randLimit = fts.PieceModel.PRESETS.length*fts.PieceGenerator.RandMultipliers[this._count];
        let randomPresetId = Math.floor(Math.random()*randLimit);

        while(this._recentPresets.indexOf(randomPresetId) !== -1) {
            randomPresetId = core.mathHelpers.clamp(randomPresetId + 1, 0, fts.PieceModel.PRESETS.length);
            if(randomPresetId === fts.PieceModel.PRESETS.length)
                randomPresetId = 0;
        }

        return randomPresetId;
    },

    /**
     * @param {Number} presetId
     * @private
     */
    _addToRecentPresets: function (presetId) {
        if(presetId === 0)
            return;

        this._recentPresets.push(presetId);
        if(this._recentPresets.length === 7) {
            this._recentPresets.splice(0, 1);
        }
    }
})

/**
 * @type {number[]}
 */
fts.PieceGenerator.RandMultipliers = [
    0.25,
    0.5,
    1,
    0.3,
    0.8,
    0.6
]