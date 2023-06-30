/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {cc.Node}
 */
fts.TileGrid = core.InteractiveNode.extend({
    /** @type {fts.Tile[][]} **/
    _tiles: null,

    /** @type {Number} **/
    _animatingTiles: 0,

    /** @type {Boolean} **/
    _animatingPiece: false,

    /** @type {String} **/
    _themeName: null,

    /** @type {fts.TileGridModel} **/
    _displayingModel: null,

    /** @type {{type:fts.FillTheSquareGameManager.TileSequenceTypes, index:Number, coins:Number, combo:Number}[]} **/
    _clearingTiles: null,

    /** @type {Number} **/
    _currentClearingComboTotal: 0,

    /** @type {Boolean} **/
    _shouldAnimateWithTransition: false,

    /** @type {{i:Number, j:Number, model:core.ItemModel|fts.PieceModel}|null} **/
    previewStatus: null,

    /** @type {fts.Piece} **/
    _previewPiece: null,

    /** @type {fts.Piece} **/
    _highlightFeedbackPiece: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     * @param {fts.TileGridModel} gridModel
     */
    ctor: function (sceneNotifier, gridModel) {
        this._super(sceneNotifier);
        this._createGrid(gridModel.getSize());

        this._highlightFeedbackPiece = new fts.Piece();
        this.addChild(this._highlightFeedbackPiece);
        this._highlightFeedbackPiece.setVisible(false);

        this._previewPiece = new fts.Piece();
        this.addChild(this._previewPiece);
        this._previewPiece.setVisible(false);
        this.previewStatus = {i: -1, j: -1, model:null};

        this.updateFromModel(gridModel, false);
    },

    /**
     * @private
     * @param {Number} size
     */
    _createGrid: function (size) {
        this._tiles = [];

        for(let i = 0 ; i < size; i++) {
            let line = [];
            for(let j = 0 ; j < size ; j++) {
                let tile = new fts.Tile();
                this.addChild(tile);
                line.push(tile);

                tile.x = (j - size/2 + 0.5)*fts.Tile.SPACING;
                tile.y = (size/2 - i - 0.5)*fts.Tile.SPACING;
            }

            this._tiles.push(line);
        }
    },

    /**
     * @returns {Boolean}
     */
    isAnimating: function () {
        return this._animatingTiles > 0 || this._animatingPiece;
    },

    /**
     * @param {String} themeName
     */
    skin: function (themeName) {
        let oldTheme = this._themeName;
        this._themeName = themeName;

        let presetFunc = function (tile) {
            tile.setScale(1, 1);
            tile.setTheme(oldTheme);
            if(tile.getColorId() <= 0) {
                tile.setOpacity(30);
            }
        };

        let refactorFunc = function (tile) {
            tile.setTheme(themeName);
            tile.setOpacity(255);
        };

        if(!oldTheme) {
            this._refactorTilesWithoutAnimation(refactorFunc);
            return;
        }

        this._animatingTiles = 0;
        this._refactorTilesWithAnimation(presetFunc, refactorFunc);
    },

    /**
     * @public
     * @param {fts.TileGridModel} gridModel
     * @param {Boolean} withTransition
     */
    updateFromModel: function (gridModel, withTransition) {
        this._displayingModel = gridModel;
        this._shouldAnimateWithTransition = withTransition;

        if(this._shouldAnimateWithTransition) {
            this._refactorTilesWithAnimation(function (tile) {
                tile.setScale(1, 1);
            }, function (tile, i, j) {
                tile.setColorId(gridModel.getFieldValue(i, j));
            });
        }
        else {
            this._refactorTilesWithoutAnimation(function (tile, i, j) {
                tile.setColorId(gridModel.getFieldValue(i, j));
            });
        }
    },

    /**
     * @param {Function} presetFunc
     * @param {Function} refactorFunc
     * @private
     */
    _refactorTilesWithAnimation: function (presetFunc, refactorFunc) {
        for(let i = 0 ; i < this._tiles.length ; i++) {
            for (let j = 0; j < this._tiles[i].length; j++) {
                let tile = this._tiles[i][j];
                tile.cleanup();
                if(presetFunc) {
                    presetFunc(tile, i, j);
                }

                this._animatingTiles++;
                tile.runAction(cc.sequence(
                    cc.delayTime(0.01 + (i+j)*0.08),
                    cc.spawn(
                        cc.scaleTo(0.1, 0, 1),
                        cc.fadeTo(0.1, 40),
                    ),
                    cc.callFunc(function () {
                        refactorFunc(tile, i, j);
                    }, this),
                    cc.spawn(
                        cc.scaleTo(0.2, 1, 1),
                        cc.fadeIn(0.2)
                    ),
                    cc.callFunc(function () {
                        this._animatingTiles--;
                    }, this)
                ));
            }
        }
    },

    /**
     * @param {Function} refactorFunc
     * @private
     */
    _refactorTilesWithoutAnimation: function (refactorFunc) {
        for(let i = 0 ; i < this._tiles.length ; i++) {
            for(let j = 0 ; j < this._tiles[i].length ; j++) {
                let tile = this._tiles[i][j];
                refactorFunc(tile, i, j);
            }
        }
    },

    /**
     * @param {{type:fts.FillTheSquareGameManager.TileSequenceTypes, index:Number, coins:Number, combo:Number}[]} [tileSequences]
     */
    playClearAnimations: function (tileSequences) {
        this._clearingTiles = [];
        for(let i = 0 ; i < tileSequences.length ; i++) {
            this._clearingTiles.push(tileSequences[i]);
        }
        this._currentClearingComboTotal = tileSequences.length;

        this._playNextClearAnimation();
    },

    /**
     * @private
     */
    _playNextClearAnimation: function () {
        if(this._clearingTiles.length === 0) {
            this.updateFromModel(this._displayingModel, this._shouldAnimateWithTransition);
            this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.FINISHED_CLEARING_TILES);
            return;
        }

        let clearAnimation = this._clearingTiles[0];
        if(clearAnimation.type === fts.FillTheSquareGameManager.TileSequenceTypes.LINE) {
            this._animateClearedLine(clearAnimation.index);
        }
        else {
            this._animateClearedRow(clearAnimation.index);
        }
    },

    /**
     * @param {Number} i
     * @private
     */
    _animateClearedLine: function (i) {
        let tiles = [];
        for(let j = 0 ; j < this._tiles[i].length ; j++) {
            tiles.push(this._tiles[i][j]);
        }

        this._animateClearedTiles(tiles);
    },

    /**
     * @param {Number} j
     * @private
     */
    _animateClearedRow: function (j) {
        let tiles = [];
        for(let i = 0 ; i < this._tiles.length ; i++) {
            tiles.push(this._tiles[i][j]);
        }

        this._animateClearedTiles(tiles);
    },

    /**
     * @param {fts.Tile[]} tiles
     * @private
     */
    _animateClearedTiles: function (tiles) {
        this._animatingTiles = tiles.length;

        let middleTileIndex = Math.round(tiles.length/2);

        this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.WILL_CLEAR_TILES, {
            sequence: this._clearingTiles[0],
            position: this.convertToWorldSpace(tiles[middleTileIndex].getPosition())
        });

        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_SCORE_EFFECT, {
            current: this._currentClearingComboTotal - this._clearingTiles.length + 1,
            total: this._currentClearingComboTotal
        })

        for(let i = 0 ; i < tiles.length ; i++) {
            let tile = tiles[i];
            tile.runAction(cc.sequence(
                cc.callFunc(function () {
                    tile.glowDown(0.3);
                }, this),
                cc.delayTime(0.32),
                cc.callFunc(this._onClearAnimationComplete, this, tile)
            ));
        }
    },

    /**
     * @private
     * @param {fts.Tile} tile
     */
    _onClearAnimationComplete: function (tile) {
        this._animatingTiles--;
        if(this._animatingTiles > 0)
            return;

        this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.CLEARED_TILES, {
            sequence: this._clearingTiles[0],
            position: this.convertToWorldSpace(tile.getPosition())
        });

        this._clearingTiles.shift();
        this._playNextClearAnimation();
    },

    /**
     * @param {fts.Piece} piece
     * @return {{i:Number, j:Number}}
     * @private
     */
    _getPieceMatrixPosition: function (piece, pieceModel) {
        let pieceRowsOffset = pieceModel.getTotalRows()/2 - 0.5;
        let pieceLinesOffset = pieceModel.getTotalLines()/2 - 0.5;

        let piece0x0TileCoords = this.convertToNodeSpace(piece.getPosition());
        piece0x0TileCoords.x -= fts.Tile.SPACING * pieceRowsOffset;
        piece0x0TileCoords.y += fts.Tile.SPACING * pieceLinesOffset;

        let i = Math.round((this._tiles[0][0].y - piece0x0TileCoords.y)/fts.Tile.SPACING);
        let j = Math.round((piece0x0TileCoords.x - this._tiles[0][0].x)/fts.Tile.SPACING);

        piece0x0TileCoords.i = i;
        piece0x0TileCoords.j = j;
        return piece0x0TileCoords;
    },

    /**
     * @param {fts.Piece} piece
     * @param {Number} i
     * @param {Number} j
     * @private
     */
    _setPieceMatrixPosition: function (piece, pieceModel, i, j) {
        let pieceRowsOffset = pieceModel.getTotalRows()/2 - 0.5;
        let pieceLinesOffset = pieceModel.getTotalLines()/2 - 0.5;

        piece.setPositionX(this._tiles[0][0].x + (j + pieceRowsOffset)*fts.Tile.SPACING);
        piece.setPositionY(this._tiles[0][0].y - (i + pieceLinesOffset)*fts.Tile.SPACING);
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     */
    startHighlight: function (pieceModel, i, j) {
        this._highlightFeedbackPiece.setVisible(true);
        this._highlightFeedbackPiece.initWithModel(pieceModel);
        this._highlightFeedbackPiece.skin(this._tiles[0][0].getThemeName());
        this._highlightFeedbackPiece.setOpacity(155);
        this._highlightFeedbackPiece.blink();

        this._setPieceMatrixPosition(this._highlightFeedbackPiece, pieceModel, i, j);
    },

    /**
     * @return {*}
     */
    getHighlightFeedbackGlobalPosition: function () {
        return this.convertToWorldSpace(this._highlightFeedbackPiece.getPosition());
    },

    /**
     * @public
     */
    stopHighlight: function () {
        this._highlightFeedbackPiece.cleanup();
        this._highlightFeedbackPiece.setVisible(false);
    },

    /**
     * @return {boolean}
     */
    isPreviewOnAValidPosition: function () {
        return this.previewStatus.i !== -1 && this.previewStatus.j !== -1 && !this.isAnimating();
    },

    /**
     * @param {fts.Piece} draggingPiece
     */
    updatePiecePreview: function (draggingPiece) {
        this._resetPreview();

        if(!draggingPiece || this.isAnimating()) {
            return;
        }

        let pieceModel = draggingPiece.getModel();
        this.previewStatus.model = pieceModel;
        this._updatePreview(draggingPiece, pieceModel, false);
    },

    /**
     * @param {core.ItemButton} itemButton
     */
    updateItemPreview: function (itemButton) {
        this._resetPreview();

        if(this.isAnimating()) {
            return;
        }

        let itemModel = itemButton.getItemModel();
        this.previewStatus.model = itemModel;
        if(itemModel.getId() === fts.FillTheSquareGameManager.Items.SINGLE_BLOCK) {
            this._updatePreview(itemButton, fts.PieceModel.SINGLE_BLOCK_PRESET, false);
        }
        else if(itemModel.getId() === fts.FillTheSquareGameManager.Items.BOMB) {
            this._updatePreview(itemButton, fts.PieceModel.BOMB_PRESET, true);
        }
    },

    /**
     * @private
     */
    _resetPreview: function () {
        this._previewPiece.setVisible(false);
        this.previewStatus.i = -1;
        this.previewStatus.j = -1;
        this.previewStatus.model = null;
    },

    /**
     * @param {cc.Node} draggingNode
     * @param {fts.PieceModel} pieceModel
     * @param {Boolean} overlapAllowed
     * @private
     */
    _updatePreview: function (draggingNode, pieceModel, overlapAllowed) {
        let draggingNodeMatrixPosition = this._getPieceMatrixPosition(draggingNode, pieceModel);

        if(!this._displayingModel.canFit(pieceModel, draggingNodeMatrixPosition.i, draggingNodeMatrixPosition.j, overlapAllowed)) {
            return;
        }

        this._previewPiece.initWithModel(pieceModel);
        this._previewPiece.skin(this._tiles[0][0].getThemeName());
        this._previewPiece.setVisible(true);
        this._previewPiece.setOpacity(155);

        this._setPieceMatrixPosition(this._previewPiece, pieceModel, draggingNodeMatrixPosition.i, draggingNodeMatrixPosition.j);
        this.previewStatus.i = draggingNodeMatrixPosition.i;
        this.previewStatus.j = draggingNodeMatrixPosition.j;
    },

    /**
     * @public
     */
    placePiecePreview: function () {
        this._previewPiece.setOpacity(255);
        this._previewPiece.growTiles();
        this.stopHighlight();

        this._animatingPiece = true;
        this.runAction(cc.sequence(
            cc.delayTime(fts.Piece.GROW_ANIMATION_TIME),
            cc.callFunc(this._onPiecePlaced, this)
        ));
    },

    /**
     * @private
     */
    _onPiecePlaced: function () {
        this._animatingPiece = false;
        this._previewPiece.setVisible(false);
        this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.PLACED_PIECE, {
            i:this.previewStatus.i,
            j:this.previewStatus.j,
            position:this.convertToWorldSpace(this._previewPiece.getPosition()),
            model:this._previewPiece.getModel()
        });
    },

    /**
     * @public
     */
    usePreviewingItem: function () {
        if(this.previewStatus.model.getId() === fts.FillTheSquareGameManager.Items.SINGLE_BLOCK) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.USED_ITEM, this.previewStatus.model);
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_DROP);
            this.placePiecePreview();
        }
        else if(this.previewStatus.model.getId() === fts.FillTheSquareGameManager.Items.BOMB) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.USED_ITEM, this.previewStatus.model);
            this._explodeFromPreview();
        }
    },

    /**
     * @private
     */
    _explodeFromPreview: function () {
        this._previewPiece.setOpacity(255);

        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, fts.Sounds.SFX_BEEP);
        this._animatingPiece = true;
        this.runAction(cc.sequence(
            cc.delayTime(fts.Piece.GROW_ANIMATION_TIME),
            cc.targetedAction(this._previewPiece, cc.blink(0.3, 4)),
            cc.callFunc(this._onTilesExploded, this)
        ));
    },

    /**
     * @private
     */
    _onTilesExploded: function () {
        this._animatingPiece = false;
        this._previewPiece.setVisible(false);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, fts.Sounds.SFX_BLAST);
        this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.EXPLODED_TILES, {
            i:this.previewStatus.i,
            j:this.previewStatus.j,
            position:this.convertToWorldSpace(this._previewPiece.getPosition()),
            model:this._previewPiece.getModel()
        });
    }
})