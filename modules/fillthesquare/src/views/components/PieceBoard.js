/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {core.InteractiveNode}
 */
fts.PieceBoard = core.InteractiveNode.extend({
    /** @type {core.Sprite[]} **/
    _sprSlots: null,

    /** @type {fts.Piece[]} **/
    _pieces: null,
    
    /** @type {fts.Piece} **/
    _lastSelectedPiece: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     * @param {Number} amountOfPieces
     */
    ctor: function (sceneNotifier, amountOfPieces) {
        this._super(sceneNotifier);

        this._sprSlots = [];
        this._pieces = [];

        this._createElements(amountOfPieces);
    },

    /**
     * @private
     * @param {int} amountOfPieces
     */
    _createElements: function (amountOfPieces) {
        for(let i = 0 ; i < amountOfPieces ; i++) {
            let slot = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.WHITE_RECT));
            slot.setScale(fts.PieceBoard.SLOT_SIZE/50);
            slot.setColor(core.colorHelpers.get(core.ColorHelpers.BLACK));
            slot.setOpacity(0);
            slot.setLocalZOrder(1);
            this.addChild(slot);
            this._sprSlots.push(slot);

            let piece = new fts.Piece();
            piece.setLocalZOrder(2);
            this.addChild(piece);
            this._pieces.push(piece);
        }
    },

    /**
     * @public
     */
    updateLayout: function () {
        if(core.layoutHelpers.isMdOrHigher()) {
            this._setAmountOfRows(1);
        }
        else {
            this._setAmountOfRows(3);
        }
        
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            piece.cleanUpAndReset();
            piece.setOpacity(255);
        }
    },

    /**
     * @param {Number} amountOfRows
     */
    _setAmountOfRows: function (amountOfRows) {
        let spacing = fts.Tile.SPACING*4 + 180;
        let totalSlots = this._sprSlots.length;
        let totalLines = Math.ceil(totalSlots/amountOfRows);

        for(let i = 0 ; i < totalSlots ; i++) {
            let slot = this._sprSlots[i];
            let piece = this._pieces[i];
            let row = i % amountOfRows;
            let line = Math.floor(i / amountOfRows);

            let position = cc.p(
                (row - amountOfRows / 2 + 0.5) * spacing,
                (totalLines/2 - line - 0.5) * spacing
            );

            slot.setPosition(position);
            piece.setPosition(position);
            piece.setInitialPosition(position);
        }
    },

    /**
     * @param {String} themeName
     */
    skin: function (themeName) {
        for(let i = 0 ; i < this._pieces.length; i++) {
            let piece = this._pieces[i];
            piece.skin(themeName, i, this.sceneNotifier);
        }
    },

    /**
     * @public
     * @param {fts.PieceModel[]} pieceModels
     */
    updateFromModels: function (pieceModels) {
        let uuidPositionHash = {};

        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            let currentPieceModel = piece.getModel();
            if(currentPieceModel) {
                uuidPositionHash[currentPieceModel.uuid] = piece.getPosition();
            }
        }

        this._updatePieces(pieceModels, uuidPositionHash, 0);
    },

    /**
     * @public
     * @param {fts.PieceModel[]} pieceModels
     */
    updateFromModelsWithCascadeEntrance: function (pieceModels) {
        this._updatePieces(pieceModels, null, 0.3);
    },

    /**
     * @param {fts.PieceModel[]} pieceModels
     * @param {Object} [positionHash]
     * @param {Number} [cascadeDelay=0]
     * @private
     */
    _updatePieces: function (pieceModels, positionHash, cascadeDelay) {
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            let newPieceModel = pieceModels[i];
            piece.initWithModel(newPieceModel);
            piece.setVisible(true);

            let slotPosition = piece.getInitialPosition();
            if(slotPosition && piece.getPosition() !== slotPosition) {
                piece.tweenToInitialPosition(
                    positionHash ? positionHash[newPieceModel.uuid] : null,
                    cascadeDelay*i,
                    cascadeDelay ? this.sceneNotifier : null
                );
            }
        }
    },

    /**
     * @param {cc.Point} globalCoords
     */
    getTouchedPiece: function (globalCoords) {
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            if(piece.hitTestChecker.contains(globalCoords, 70)) {
                this._lastSelectedPiece = piece;
                return piece;
            }
        }

        return null;
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @return {fts.Piece}
     */
    getPieceWithModel: function (pieceModel) {
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            if(piece.getModel() === pieceModel) {
                return piece;
            }
        }

        return null;
    },

    getSlotGlobalPositionWithModel: function (pieceModel) {
        let piece = this.getPieceWithModel(pieceModel);
        if(!piece) {
            return cc.p(0, 0);
        }

        let index = this._pieces.indexOf(piece);
        return this.convertToWorldSpace(this._sprSlots[index].getPosition());
    },

    /**
     * @return {fts.Piece}
     */
    getLastSelectedPiece: function () {
        return this._lastSelectedPiece;  
    },

    /**
     * @param {core.ItemButton} itemButton
     * @return {boolean}
     */
    draggingItemAppliesToPieces: function (itemButton) {
        let itemModel = itemButton.getItemModel();
        return itemModel.getId() === fts.FillTheSquareGameManager.Items.ROTATOR
    },

    /**
     * @param {core.ItemButton} itemButton
     */
    updateItemPreview: function (itemButton) {
        if(!this.draggingItemAppliesToPieces(itemButton)) {
            return;
        }

        let targetPiece = this.getTouchedPiece(itemButton.getPosition());
        if(targetPiece) {
            this._highlightOnePieceAndStopOthers(targetPiece);
        }
        else {
            this._stopHighlightEffects();
        }
    },

    /**
     * @param {core.ItemButton} itemButton
     */
    finishItemPreview: function (itemButton) {
        this._stopHighlightEffects();
    },

    /**
     * @param {core.ItemButton} itemButton
     */
    canDraggingItemBeUsed: function (itemButton) {
        let targetPiece = this.getTouchedPiece(itemButton.getPosition());
        let itemModel = itemButton.getItemModel();

        return targetPiece && !targetPiece.getModel().isSquare() && itemModel.getId() === fts.FillTheSquareGameManager.Items.ROTATOR;
    },

    /**
     * @param {core.ItemButton} itemButton
     */
    usePreviewingItem: function (itemButton) {
        let targetPiece = this.getTouchedPiece(itemButton.getPosition());
        if(!this.canDraggingItemBeUsed(itemButton))
            return;

        let itemModel = itemButton.getItemModel();
        if(itemModel.getId() === fts.FillTheSquareGameManager.Items.ROTATOR) {
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.USED_ITEM, itemModel);
            this._rotatePiece(targetPiece);
        }
    },

    /**
     * @param {fts.Piece} piece
     * @private
     */
    _rotatePiece: function (piece) {
        let time = 0.6;
        piece.rotate(time);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, fts.Sounds.SFX_FLIP);
        this.runAction(cc.sequence(
            cc.delayTime(time),
            cc.callFunc(function () {
                this.sceneNotifier.dispatch(fts.FillTheSquareLayer.Events.ROTATED_PIECE, piece.getModel());
            }, this)
        ))
    },

    /**
     * @public
     */
    _stopHighlightEffects: function () {
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            piece.cleanUpAndReset();
        }
    },

    /**
     * @param {fts.Piece} targetPiece
     * @private
     */
    _highlightOnePieceAndStopOthers: function (targetPiece) {
        for(let i = 0 ; i < this._pieces.length ; i++) {
            let piece = this._pieces[i];
            if(piece === targetPiece) {
                piece.flick(0.6);
            }
            else {
                piece.cleanUpAndReset();
            }
        }
    }
})

/**
 * @type {number}
 */
fts.PieceBoard.SLOT_SIZE = 750;