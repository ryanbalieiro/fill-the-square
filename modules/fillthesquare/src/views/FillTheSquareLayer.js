/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {core.GameLayer}
 */
fts.FillTheSquareLayer = core.GameLayer.extend({
    /** @type {cc.LayerColor} **/
    _lyrBackground: null,

    /** @type {fts.TileGrid} **/
    _tileGrid: null,

    /** @type {fts.PieceBoard} **/
    _pieceBoard: null,

    /** @type {fts.FillTheSquareGameManager} **/
    gameManager: null,

    /** @type {fts.Piece} **/
    _pieceDragFeedback: null,

    /** @type {core.Burst} **/
    _explosionBurst: null,

    /** @type {core.Hand} **/
    _hand: null,

    /**
     * @constructs
     * @param {core.Notifier} notifier
     * @param {core.GameManager} gameManager
     * @param {core.UserManager} userManager
     */
    ctor: function (notifier, gameManager, userManager) {
        this._super(notifier, gameManager, userManager);

        this._lyrBackground = new cc.LayerColor(cc.color(0,0,0));
        this._tileGrid = new fts.TileGrid(this.sceneNotifier, this.gameManager.gridModel);
        this._pieceBoard = new fts.PieceBoard(this.sceneNotifier, fts.FillTheSquareGameManager.MAX_PIECES);

        this.addChild(this._lyrBackground);
        this.addChild(this._tileGrid);
        this.addChild(this._pieceBoard);

        this._tileGrid.setLocalZOrder(1);
        this._pieceBoard.setLocalZOrder(2);

        this.gameManager.notifier.addSubscription(this, this._onGameManagerEvent);
        this.refresh();
    },

    /**
     * @public
     */
    onEnter: function () {
        this._super();

        this._pieceDragFeedback = new fts.Piece();
        this._pieceDragFeedback.setVisible(false);
        this.addNodeToTopLayer(this._pieceDragFeedback);

        this._explosionBurst = new core.Burst();
        this._explosionBurst.build(24, 1.6, 1500, 800);
        this._explosionBurst.cacheActions(24, true);
        this._explosionBurst.setParticleColor(core.colorHelpers.get(core.ColorHelpers.RED));
        this._explosionBurst.setLocalZOrder(99);
        this.addNodeToTopLayer(this._explosionBurst);

        this._hand = new core.Hand();
        this._hand.setVisible(false);
        this.addNodeToTopLayer(this._hand);
    },

    /**
     * @override
     */
    layoutElements: function () {
        this._super();

        this._lyrBackground.changeWidth(this.winWidth);
        this._lyrBackground.changeHeight(this.winHeight);
        this._pieceBoard.updateLayout();

        if(core.layoutHelpers.isMdOrHigher()) {
            this._layoutGameForLandscape();
        }
        else {
            this._layoutGameForPortrait();
        }

        this._stopDragAndResetPiece();
        this._refreshTutorialHandAnimation();
        this._explosionBurst.reset();
    },

    /**
     * @private
     */
    _layoutGameForLandscape() {
        let maxHeight = this.winHeight*0.8;

        let horizontalPadding = 50;
        let verticalPadding = 50;
        let spacing = core.mathHelpers.clamp(this.winWidth/15, 100, 200);
        let availableWidth = this.winWidth - horizontalPadding*2 - spacing;

        let gridPercentage = 0.75;
        let gridContainerWidth = core.mathHelpers.clamp(availableWidth*gridPercentage, 0, maxHeight);
        let piecesContainerWidth = core.mathHelpers.clamp(availableWidth*(1 - gridPercentage), 200, 380);

        let usedWidth = gridContainerWidth + piecesContainerWidth + spacing;
        let offsetWidth = this.winWidth - usedWidth - horizontalPadding*2;

        horizontalPadding += offsetWidth/2;

        this.fitInsideContainer(
            this._tileGrid,
            horizontalPadding, //x
            verticalPadding, //y
            gridContainerWidth, //w
            maxHeight, //h
            core.ResponsiveLayer.Alignment.CENTER_RIGHT
        );

        this.fitInsideContainer(
            this._pieceBoard,
            horizontalPadding + gridContainerWidth + spacing, //x
            verticalPadding, //y
            piecesContainerWidth, //w
            maxHeight, //h
            core.ResponsiveLayer.Alignment.CENTER_RIGHT
        );
    },

    /**
     * @private
     */
    _layoutGameForPortrait() {
        let padding = this.winWidth*0.05;
        let spacingBetweenContainers = 70;
        let containerX = padding;
        let containerWidth = this.winWidth - padding*2;

        let piecesBoardContainerY = padding;
        let piecesBoardContainerHeight = this.winHeight*(core.layoutHelpers.isSmOrHigher() ? 0.2 : 0.275);
        this.fitInsideContainer(this._pieceBoard,containerX, piecesBoardContainerY, containerWidth, piecesBoardContainerHeight, core.ResponsiveLayer.Alignment.TOP_CENTER);

        let tileGridContainerY = piecesBoardContainerY + piecesBoardContainerHeight + spacingBetweenContainers;
        let tileGridContainerHeight = this.winHeight*0.8 - tileGridContainerY;
        this.fitInsideContainer(this._tileGrid, containerX, tileGridContainerY, containerWidth, tileGridContainerHeight, core.ResponsiveLayer.Alignment.TOP_CENTER);
    },

    /**
     * @param {Boolean} animated
     */
    skin: function (animated) {
        this._super();

        let selectedThemeId = this.userManager.getSelectedItem(core.ItemCollectionModel.PresetCategories.THEMES);
        let selectedThemeName = selectedThemeId.replace('theme-', '');
        let backgroundColor = fts.FillTheSquareLayer.THEME_COLORS[selectedThemeName];

        this._lyrBackground.setColor(backgroundColor);
        this._tileGrid.skin(selectedThemeName);
        this._pieceBoard.skin(selectedThemeName);

        core.colorHelpers.setPalette(selectedThemeName);
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     */
    setTutorialData: function (pieceModel, i, j) {
        this._tileGrid.startHighlight(pieceModel, i, j);
        this._hand.setVisible(true);

        this._tutorialTargetPieceModel = pieceModel;
        this._refreshTutorialHandAnimation();
    },

    /**
     * @public
     */
    clearTutorialData: function () {
        this._tutorialTargetPieceModel = null;
        this._hand.setVisible(false);
        this._hand.stop();
    },

    /**
     * @private
     */
    _refreshTutorialHandAnimation: function () {
        if(!this._hand.visible)
            return;

        let from = this._pieceBoard.getSlotGlobalPositionWithModel(this._tutorialTargetPieceModel);
        let to = this._tileGrid.getHighlightFeedbackGlobalPosition();

        this._hand.drag(from, to);
    },

    /**
     * @public
     */
    refresh: function () {
        this._pieceBoard.updateFromModels(this.gameManager.availablePieces);
        this._tileGrid.updateFromModel(this.gameManager.gridModel, false);
    },

    /**
     * @public
     */
    refreshWithTransition: function () {
        this._pieceBoard.updateFromModelsWithCascadeEntrance(this.gameManager.availablePieces);
        this._tileGrid.updateFromModel(this.gameManager.gridModel, true);
    },

    /**
     * @param event
     * @return {Boolean}
     */
    onMouseDown: function (event) {
        if(!this._super(event) || this.isDragging())
            return false;

        let touchedPiece = this._pieceBoard.getTouchedPiece(this._touchCoords);
        if(!touchedPiece || touchedPiece.isLockedForInteractions())
            return false;

        touchedPiece.setVisible(false);
        this._draggingObject = this._pieceDragFeedback;

        this._pieceDragFeedback.initWithModel(touchedPiece.getModel());
        this._pieceDragFeedback.skin(touchedPiece.getThemeName());
        this._pieceDragFeedback.setScale(this._tileGrid.getScale());
        this.startDrag(this._pieceDragFeedback);
        this._pieceDragFeedback.shrinkTiles();
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_GRAB);

        if(touchedPiece.getModel() === this._tutorialTargetPieceModel) {
            this._hand.setVisible(false);
        }

        return true;
    },

    /**
     * @param {cc.Node} node
     */
    startDrag: function (node) {
        this._super(node);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.FORCE_HIDE_FEEDBACKS);
        if(node === this._itemDragFeedback) {
            if(this._pieceBoard.draggingItemAppliesToPieces(this._itemDragFeedback)) {
                this.setFocus(true, [this._pieceBoard]);
            }
            else {
                this.setFocus(true, [this._tileGrid]);
            }
        }
    },

    /**
     * @public
     */
    updateDrag: function () {
        this._super();

        if(this._draggingObject === this._pieceDragFeedback) {

            if(cc.sys.capabilities.touches) {
                let offset = fts.Tile.SPACING*this._pieceDragFeedback.getScaleX()/2;
                let bounds = this._pieceDragFeedback.hitTestChecker.getCachedWorldBoundingBox(0);
                this._draggingObject.setPosition(this._touchCoords.x - bounds.width/2 - offset, this._touchCoords.y + bounds.height/2 + offset);
            }

            this._tileGrid.updatePiecePreview(this._pieceDragFeedback);
        }

        else if(this._draggingObject === this._itemDragFeedback) {
            if(cc.sys.capabilities.touches) {
                this._draggingObject.setPosition(this._touchCoords.x - 60, this._touchCoords.y + 60);
            }

            this._tileGrid.updateItemPreview(this._itemDragFeedback);
            this._pieceBoard.updateItemPreview(this._itemDragFeedback);
        }
    },

    /**
     * @public
     */
    stopDrag: function () {
        if(this._draggingObject === this._pieceDragFeedback) {
            if(this._tileGrid.isPreviewOnAValidPosition()) {
                this._stopDragAndPlacePiece();
            }
            else {
                this._stopDragAndResetPiece();
            }
        }

        else if(this._draggingObject === this._itemDragFeedback) {
            if(this._tileGrid.isPreviewOnAValidPosition()) {
                this._stopDragAndUseItemOnGrid();
            }
            else if(this._pieceBoard.canDraggingItemBeUsed(this._itemDragFeedback)) {
                this._stopDragAndUseItemOnPiece();
            }
            else {
                this._pieceBoard.finishItemPreview(this._itemDragFeedback);
                this._cancelDraggingItemUse();
            }

            this.setFocus(false, [this._pieceBoard, this._tileGrid]);
        }
    },

    /**
     * @public
     * @override
     */
    cancelDrag: function () {
        this._stopDragAndResetPiece(true);

        this._pieceBoard.finishItemPreview(this._itemDragFeedback);
        this._tileGrid.updatePiecePreview(null);
        this.setFocus(false, [this._pieceBoard, this._tileGrid]);

        this._super();
    },

    /**
     * @private
     */
    _stopDragAndPlacePiece: function () {
        if(this._draggingObject !== this._pieceDragFeedback)
            return;

        this._draggingObject = null;
        this._pieceDragFeedback.setVisible(false);
        this._tileGrid.placePiecePreview();
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_DROP);
    },

    /**
     * @private
     * @param {Boolean} [instant=false]
     */
    _stopDragAndResetPiece: function (instant) {
        if(this._draggingObject !== this._pieceDragFeedback)
            return;

        this._tileGrid.updatePiecePreview(null);
        this._pieceDragFeedback.setVisible(false);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, core.Sounds.SFX_CANCEL_WHOOSH);

        let touchedPiece = this._pieceBoard.getLastSelectedPiece();
        touchedPiece.setVisible(true);

        if(!instant) {
            touchedPiece.setScale(1.5);
            touchedPiece.tweenToInitialPosition(this._pieceBoard.convertToNodeSpace(this._pieceDragFeedback.getPosition()));
        }
        else {
            touchedPiece.setOpacity(255);
            touchedPiece.setScale(1);
            touchedPiece.setPosition(touchedPiece.getInitialPosition());
        }


        if(touchedPiece.getModel() === this._tutorialTargetPieceModel) {
            this._hand.setVisible(true);
            this._refreshTutorialHandAnimation();
        }

        this._draggingObject = null;
    },

    /**
     * @private
     */
    _stopDragAndUseItemOnGrid: function () {
        if(this._draggingObject !== this._itemDragFeedback)
            return;

        this._draggingObject = null;
        this._itemDragFeedback.setVisible(false);
        this._tileGrid.usePreviewingItem();
    },

    /**
     * @private
     */
    _stopDragAndUseItemOnPiece: function () {
        if(this._draggingObject !== this._itemDragFeedback)
            return;

        this._pieceBoard.usePreviewingItem(this._itemDragFeedback);
        this._draggingObject = null;
        this._itemDragFeedback.setVisible(false);
    },

    /**
     * @param {cc.Point} position
     * @public
     */
    playExplosionBurst: function (position) {
        this._explosionBurst.setPosition(position);
        this._explosionBurst.play();
    },

    /**
     * @param {String} event
     * @param {*} parameter
     * @private
     */
    _onGameManagerEvent: function (event, parameter) {
        switch (event) {
            case core.GameManager.Events.STARTED_GAME:
            case core.GameManager.Events.LOADED_GAME_STATE:
            case fts.FillTheSquareGameManager.Events.USER_ACTION_PERFORMED:
            case fts.FillTheSquareGameManager.Events.LOADED_CUSTOM_GAME_STATE:
                this.refresh();
                break;

            case fts.FillTheSquareGameManager.Events.CHECKED_GRID:
                this._tileGrid.playClearAnimations(this.gameManager.clearedTileSequences);
                break;

            case core.GameManager.Events.RESET_GAME:
                this.refreshWithTransition();
                break;
        }
    }
})

/**
 * @type {{light: (*|{a: number, r: number, b: number, g: number}|{a: number|*, r: *, b: *, g: *}|{a: number|*, r: *, b: *, g: *}), dark: (*|{a: number, r: number, b: number, g: number}|{a: number|*, r: *, b: *, g: *}|{a: number|*, r: *, b: *, g: *}), purple: (*|{a: number, r: number, b: number, g: number}|{a: number|*, r: *, b: *, g: *}|{a: number|*, r: *, b: *, g: *})}}
 */
fts.FillTheSquareLayer.THEME_COLORS = {
    dark: cc.color(21, 21, 21),
    purple: cc.color(32, 0, 53),
    blue: cc.color(0, 114*0.9, 190*0.9)
}

/**
 * @enum
 */
fts.FillTheSquareLayer.Events = {
    PLACED_PIECE: "fillTheSquareEventPlacePiece",
    WILL_CLEAR_TILES: "fillTheSquareEventWillClearTiles",
    CLEARED_TILES: "fillTheSquareEventClearedTiles",
    FINISHED_CLEARING_TILES: "fillTheSquareEventFinishedClearingTiles",
    EXPLODED_TILES: "fillTheSquareEventExplodedTiles",
    ROTATED_PIECE: "fillTheSquareEventRotatedPiece"
}
