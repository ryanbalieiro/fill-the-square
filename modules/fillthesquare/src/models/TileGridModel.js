/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {cc.Class}
 */
fts.TileGridModel = cc.Class.extend({
    /** @type {Number[][]} **/
    _grid: null,

    /**
     * @constructs
     * @param {Number} gridSize
     */
    ctor: function (gridSize) {
        this._grid = [];

        for(let i = 0 ; i < gridSize ; i++) {
            let line = [];
            for(let j = 0 ; j < gridSize ; j++) {
                line.push(0);
            }
            this._grid.push(line);
        }
    },

    /**
     * @public
     */
    reset: function () {
        let gridSize = this.getSize();

        for(let i = 0 ; i < gridSize ; i++) {
            for(let j = 0 ; j < gridSize ; j++) {
                this._grid[i][j] = 0;
            }
        }
    },

    /**
     * @returns {number}
     */
    getSize: function () {
        return this._grid.length;
    },

    /**
     * @param {number} line
     * @param {number} column
     */
    getFieldValue: function (line, column) {
        return this._grid[line][column];
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     * @param {Boolean} overlapAllowed
     */
    canFit: function (pieceModel, i, j, overlapAllowed) {
        let gridSize = this.getSize();

        for(let mI = 0 ; mI < pieceModel.tiles.length ; mI++) {
            for(let mJ = 0 ; mJ < pieceModel.tiles[mI].length ; mJ++) {
                let pieceModelTile = pieceModel.tiles[mI][mJ];

                if(pieceModelTile !== 0) {
                    let gI = i + mI;
                    let gJ = j + mJ;

                    // out of bounds!
                    if(!core.mathHelpers.isEqualOrBetween(gI, 0, gridSize - 1) || !core.mathHelpers.isEqualOrBetween(gJ, 0, gridSize - 1)) {
                        return false;
                    }

                    // slot has been filled!
                    if(this._grid[gI][gJ] !== 0 && !overlapAllowed) {
                        return false;
                    }
                }
            }
        }

        return true;
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     */
    fit: function (pieceModel, i, j) {
        if(!this.canFit(pieceModel, i, j))
            return false;

        for(let mI = 0 ; mI < pieceModel.tiles.length ; mI++) {
            for(let mJ = 0 ; mJ < pieceModel.tiles[mI].length ; mJ++) {
                let pieceModelTile = pieceModel.tiles[mI][mJ];

                if(pieceModelTile !== 0) {
                    let gI = i + mI;
                    let gJ = j + mJ;
                    this._grid[gI][gJ] = pieceModelTile;
                }
            }
        }

        return true;
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     */
    erase: function (pieceModel, i, j) {
        for(let mI = 0 ; mI < pieceModel.tiles.length ; mI++) {
            for(let mJ = 0 ; mJ < pieceModel.tiles[mI].length ; mJ++) {
                let pieceModelTile = pieceModel.tiles[mI][mJ];

                if(pieceModelTile !== 0) {
                    let gI = i + mI;
                    let gJ = j + mJ;
                    this._grid[gI][gJ] = 0;
                }
            }
        }

        return true;
    },

    /**
     * @param {Number} i
     * @param {Number} j
     */
    clearField: function (i , j) {
        this._grid[i][j] = 0;
    },

    /**
     * @public
     * @returns {*}
     */
    getDataForSaving: function () {
        return this._grid;
    },

    /**
     *  @public
     * @param {Number[][]} savedGridData
     */
    loadDataFrom: function (savedGridData) {
        this._grid = savedGridData;
    }
})