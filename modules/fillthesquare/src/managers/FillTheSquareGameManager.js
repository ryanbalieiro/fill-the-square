/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {core.GameManager}
 */
fts.FillTheSquareGameManager = core.GameManager.extend({
    /** @type {fts.TileGridModel} **/
    gridModel: null,

    /** @type {fts.PieceModel[]} **/
    availablePieces: null,

    /** @type {{type:fts.FillTheSquareGameManager.TileSequenceTypes, index:Number, coins:Number, combo:Number}[]} **/
    clearedTileSequences:null,

    /** @type {fts.PieceGenerator} **/
    _pieceGenerator: null,

    /** @type {{i:Number[], j:Number[]}|null} **/
    _clearanceCountHash: null,

    /**
     * @constructs
     * @param {core.UserManager} userManager
     * @param {Boolean} ignorePersistence
     */
    ctor: function (userManager, ignorePersistence) {
        this.gridModel = new fts.TileGridModel(fts.FillTheSquareGameManager.GRID_SIZE);
        this.availablePieces = [];
        this.clearedTileSequences = [];
        this._pieceGenerator = new fts.PieceGenerator();
        this._super(userManager, ignorePersistence);
    },

    /**
     * @private
     */
    _setInitialState: function () {
        this.gridModel.reset();

        this.availablePieces = [];
        for(let i = 0 ; i < fts.FillTheSquareGameManager.MAX_PIECES ; i++) {
            this._generatePiece();
        }

        this._super();
    },

    /**
     * @override
     * @param {Object} gameState
     */
    onGameStateLoaded: function (gameState) {
        this._super(gameState);
        this.gridModel.loadDataFrom(gameState.gridModel);

        this.availablePieces = [];
        for(let i = 0 ; i < gameState.pieceModels.length ; i++) {
            let pieceModelData = gameState.pieceModels[i];
            let pieceModel = new fts.PieceModel(0);
            pieceModel.loadDataFrom(pieceModelData);
            this.availablePieces.push(pieceModel);
        }
    },

    /**
     * @param {Number[][]} gridMatrix
     * @param {Number[]} piecePresets
     */
    setCustomState: function (gridMatrix, piecePresets) {
        this.gridModel.loadDataFrom(gridMatrix);

        this.availablePieces = [];
        for(let i = 0 ; i < fts.FillTheSquareGameManager.MAX_PIECES ; i++) {
            let pieceModel = new fts.PieceModel(piecePresets[i]);
            this.availablePieces.push(pieceModel);
        }
        this.notifier.dispatch(fts.FillTheSquareGameManager.Events.LOADED_CUSTOM_GAME_STATE);
    },

    /**
     * @param {fts.PieceModel} pieceModel
     */
    getScoreForPlacing: function (pieceModel) {
        return pieceModel.getTileCount();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     * @private
     */
    placePiece: function (pieceModel, i, j) {
        const success = this.gridModel.fit(pieceModel, i, j);
        if(success) {
            this.addToScore(this.getScoreForPlacing(pieceModel));
        }

        let pieceIndex = this.availablePieces.lastIndexOf(pieceModel);
        if(pieceIndex >= 0) {
            this.availablePieces.splice(pieceIndex, 1);
            this._generatePiece();
        }

        this.notifier.dispatch(fts.FillTheSquareGameManager.Events.USER_ACTION_PERFORMED);
        this._checkTiles();
        this._saveGameState();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     * @private
     */
    explodeWithPieceModel: function (pieceModel, i, j) {
        this.gridModel.erase(pieceModel, i, j);
        this.notifier.dispatch(fts.FillTheSquareGameManager.Events.USER_ACTION_PERFORMED);
        this._saveGameState();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @private
     */
    rotatePieceModel: function (pieceModel) {
        pieceModel.rotate(true);
        this.notifier.dispatch(fts.FillTheSquareGameManager.Events.USER_ACTION_PERFORMED);
        this._saveGameState();
    },

    /**
     * @private
     */
    _generatePiece: function () {
        if(this.availablePieces.length >= fts.FillTheSquareGameManager.MAX_PIECES)
            return;

        this.availablePieces.push(this._pieceGenerator.makePieceModel());
    },

    /**
     * @override
     * @returns {Object}
     */
    parseForSaving: function () {
        let object = this._super();
        object.gridModel = this.gridModel.getDataForSaving();

        object.pieceModels = [];
        for(let i = 0 ; i < this.availablePieces.length ; i++) {
            object.pieceModels.push(this.availablePieces[i].getDataForSaving());
        }

        return object;
    },

    /**
     * @return {null|{pieceModel:core.PieceModel, i:Number, j:Number}}
     */
    getPossibleMove: function () {
        let gridSize = this.gridModel.getSize();
        this._possibleMove = this._possibleMove || {};

        for(let m = 0 ; m < this.availablePieces.length ; m++) {
            let pieceModel = this.availablePieces[m];
            for(let i = 0 ; i < gridSize ; i++) {
                for(let j = 0; j < gridSize ; j++) {
                    if(this.gridModel.canFit(pieceModel, i, j)) {
                        this._possibleMove.pieceModel = pieceModel;
                        this._possibleMove.i = i;
                        this._possibleMove.j = j;
                        return this._possibleMove;
                    }
                }
            }
        }

        return null;
    },

    /**
     * @private
     */
    _resetCountHash: function () {
        let gridSize = this.gridModel.getSize();
        this._clearanceCountHash = this._clearanceCountHash || {i:[], j:[]};
        for(let k = 0 ; k < gridSize ; k++) {
            this._clearanceCountHash.i[k] = 0;
            this._clearanceCountHash.j[k] = 0;
        }
    },

    /**
     * @private
     */
    _checkTiles: function () {
        let gridSize = this.gridModel.getSize();
        this._resetCountHash();

        for(let i = 0 ; i < gridSize ; i++) {
            for(let j = 0; j < gridSize ; j++) {
                let tile = this.gridModel.getFieldValue(i, j);
                if(tile > 0) {
                    this._clearanceCountHash.i[i]++;
                    this._clearanceCountHash.j[j]++;
                }
            }
        }

        for(let k = 0 ; k < gridSize ; k++) {
            if(this._clearanceCountHash.i[k] === gridSize) {
                this._clearLine(k);
            }

            if(this._clearanceCountHash.j[k] === gridSize) {
                this._clearRow(k);
            }
        }

        this.notifier.dispatch(fts.FillTheSquareGameManager.Events.CHECKED_GRID);
    },

    /**
     * @param {Number} i
     * @private
     */
    _clearLine: function (i) {
        let gridSize = this.gridModel.getSize();
        for(let j = 0 ; j < gridSize ; j++) {
            this.gridModel.clearField(i, j);
        }

        this._addClearedTileSequence(fts.FillTheSquareGameManager.TileSequenceTypes.LINE, i);
    },

    /**
     * @param {Number} j
     * @private
     */
    _clearRow: function (j) {
        let gridSize = this.gridModel.getSize();
        for(let i = 0 ; i < gridSize ; i++) {
            this.gridModel.clearField(i, j);
        }

        this._addClearedTileSequence(fts.FillTheSquareGameManager.TileSequenceTypes.ROW, j);
    },

    /**
     * @param {fts.FillTheSquareGameManager.TileSequenceTypes} type
     * @param {Number} index
     * @private
     */
    _addClearedTileSequence(type, index) {
        let coins = (this.clearedTileSequences.length + 1) * 20;
        this.clearedTileSequences.push({
            type: type,
            index: index,
            coins: coins,
            combo: this.clearedTileSequences.length + 1
        });
    },

    /**
     * @param {Object} tileSequence
     */
    commitClearedTileSequence: function (tileSequence) {
        let index = this.clearedTileSequences.lastIndexOf(tileSequence);
        if(index === -1) {
            return;
        }

        this.clearedTileSequences.splice(index, 1);
    }
})

/**
 * @type {number}
 */
fts.FillTheSquareGameManager.GRID_SIZE = 8;

/**
 * @type {number}
 */
fts.FillTheSquareGameManager.MAX_PIECES = 3;

/**
 * @enum
 */
fts.FillTheSquareGameManager.Events = {
    USER_ACTION_PERFORMED: "fillTheSquareEventUserActionPerformed",
    CHECKED_GRID: "fillTheSquareEventCheckedGrid",
    LOADED_CUSTOM_GAME_STATE: "fillTheSquareLoadedCustomGameState"
}

/**
 * @enum
 */
fts.FillTheSquareGameManager.TileSequenceTypes = {
    LINE: "line",
    ROW: "row"
}

/**
 * @enum
 */
fts.FillTheSquareGameManager.Items = {
    BOMB: "item-bomb",
    ROTATOR: "item-swap",
    SINGLE_BLOCK: "item-piece"
}
