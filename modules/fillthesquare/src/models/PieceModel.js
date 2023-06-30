/**
 * Created by Ryan Balieiro on 21/08/20.
 * @class
 * @extends {cc.Class}
 */
fts.PieceModel = cc.Class.extend({
    /** @type {int} **/
    uuid: -1,

    /** @type {int} **/
    presetId: -1,

    /** @type {int[][]} **/
    tiles: null,

    /**
     * @constructs
     */
    ctor: function (presetId) {
        this.uuid = core.mathHelpers.generateUniqueIdentifier();

        if(presetId !== undefined)
            this.setFromPreset(presetId);
    },

    /**
     * @return {number}
     */
    getTotalLines: function () {
        return this.tiles.length;
    },

    /**
     * @return {number}
     */
    getTotalRows: function () {
        return this.tiles[0].length;
    },

    /**
     * @return {boolean}
     */
    isSquare: function () {
        if(this.getTotalLines() !== this.getTotalRows()) {
            return false;
        }

        const rows = this.tiles.length;
        const columns = this.tiles[0].length;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (this.tiles[i][j] === 0) {
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * @return {number}
     */
    getTileCount: function () {
        let tileCount = 0;

        const rows = this.tiles.length;
        const columns = this.tiles[0].length;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if(this.tiles[i][j] !== 0) {
                    tileCount++;
                }
            }
        }

        return tileCount;
    },

    /**
     * @param {int} presetId
     */
    setFromPreset: function (presetId) {
        this.presetId = presetId;

        let preset = fts.PieceModel.PRESETS[presetId];
        this.tiles = [];

        for(let i = 0 ; i < preset.length ; i++) {
            this.tiles[i] = core.arrayHelpers.clone(preset[i]);
        }
    },

    /**
     * @param {Number[][]} matrix
     */
    setCustomMatrix: function (matrix) {
        this.presetId = -1;
        this.tiles = [];

        for(let i = 0 ; i < matrix.length ; i++) {
            this.tiles[i] = core.arrayHelpers.clone(matrix[i]);
        }
    },

    /**
     * @param [clockwise=false]
     */
    rotate: function (clockwise) {
        clockwise = clockwise || false;

        const rows = this.tiles.length;
        const columns = this.tiles[0].length;

        const rotatedMatrix = Array(columns)
            .fill(null)
            .map(() => Array(rows));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (clockwise) {
                    rotatedMatrix[j][rows - 1 - i] = this.tiles[i][j];
                }
                else {
                    rotatedMatrix[columns - 1 - j][i] = this.tiles[i][j];
                }
            }
        }

        this.tiles = rotatedMatrix;
        this.uuid = core.mathHelpers.generateUniqueIdentifier();
    },

    /**
     * @public
     * @returns {*}
     */
    getDataForSaving: function () {
        return {presetId: this.presetId, tiles:this.tiles};
    },

    /**
     *  @public
     * @param {Object} savedPieceData
     */
    loadDataFrom: function (savedPieceData) {
        this.presetId = savedPieceData.presetId;
        this.tiles = savedPieceData.tiles;
    }
})

/**
 * @static
 * @returns {fts.PieceModel}
 */
fts.PieceModel.getRandom = function () {
    let randomPresetId = Math.floor(Math.random()*fts.PieceModel.PRESETS.length);
    return new fts.PieceModel(randomPresetId);
}

/**
 * @constant
 * @type {int[][][]}
 */
fts.PieceModel.PRESETS = [
    /** Preset 001 **/
    [
        [2]
    ],

    /** Preset 002 **/
    [
        [1, 1]
    ],

    /** Preset 003 **/
    [
        [3, 3, 3]
    ],

    /** Preset 004 **/
    [
        [4, 4, 4, 4]
    ],

    /** Preset 005 **/
    [
        [5, 5],
        [5, 5]
    ],

    /** Preset 006 **/
    [
        [6, 6],
        [6, 0]
    ],

    /** Preset 007 **/
    [
        [7, 0],
        [7, 0],
        [7, 7]
    ],

    /** Preset 008 **/
    [
        [0, 8],
        [0, 8],
        [8, 8]
    ],

    /** Preset 009 **/
    [
        [9, 0],
        [9, 9],
        [9, 0],
    ],

    /** Preset 010 **/
    [
        [1, 1],
        [1, 0],
        [1, 1],
    ],

    /** Preset 011 **/
    [
        [0, 3],
        [3, 3],
        [3, 3],
    ],

    /** Preset 012 **/
    [
        [4, 0],
        [4, 4],
        [4, 4],
    ],

    /** Preset 013 **/
    [
        [0, 5],
        [5, 5],
        [5, 0],
    ],

    /** Preset 014 **/
    [
        [6, 0],
        [6, 6],
        [0, 6],
    ],

    /** Preset 015 **/
    [
        [7, 0],
        [7, 7],
        [7, 7],
        [7, 0],
    ],

    /** Preset 016 **/
    [
        [8, 0],
        [8, 0],
        [8, 8],
        [8, 0],
    ],

    /** Preset 017 **/
    [
        [9, 0, 0],
        [9, 9, 0],
        [0, 9, 9],
    ],

    /** Preset 018 **/
    [
        [0, 1, 1],
        [0, 1, 0],
        [1, 1, 0],
    ],

    /** Preset 019 **/
    [
        [0, 3, 0],
        [3, 3, 3],
        [0, 3, 0],
    ],

    /** Preset 020 **/
    [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 4],
    ],

    /** Preset 021 **/
    [
        [5, 5, 5],
        [5, 5, 5],
        [5, 5, 5]
    ]
];

/**
 * @type {fts.PieceModel}
 */
fts.PieceModel.SINGLE_BLOCK_PRESET = new fts.PieceModel(0);

/**
 * @type {fts.PieceModel}
 */
fts.PieceModel.BOMB_PRESET = new fts.PieceModel();
fts.PieceModel.BOMB_PRESET.setCustomMatrix([
    [11, 11, 11],
    [11, 11, 11],
    [11, 11, 11]
])