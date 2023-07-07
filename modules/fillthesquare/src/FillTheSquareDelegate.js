/**
 * @namespace
 */
fts = {};

/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {core.GameDelegate}
 */
fts.FillTheSquareDelegate = core.GameDelegate.extend({

    /** @type {Number} **/
    _roundsSinceLastNoMovesAlert: 0,

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
        this._gameNamespace = fts;
        this._classGameManager = fts.FillTheSquareGameManager;
        this._classGameLayer = fts.FillTheSquareLayer;
        this._classTutorialManager = fts.FillTheSquareTutorialManager;

        this._roundsSinceLastNoMovesAlert = fts.FillTheSquareDelegate.MINIMUM_ROUNDS_TO_SHOW_NO_MOVES_ALERT - 1;
    },

    /**
     * @override
     * @private
     */
    _createGameView: function () {
        this._super();

        let actionButton = new core.LongButton(
            core.colorHelpers.get(core.ColorHelpers.DARK_GOLD, true),
            core.colorHelpers.get(core.ColorHelpers.DARK_GOLD, false),
            "Finish!"
        );

        this._gameScene.getHudLayer().getActionHud().setActionButton(actionButton);

        let _this = this;
        setTimeout(function () {
            _this.audioManager.changeBgm(fts.Sounds.BGM_MAIN_THEME);
        }, 1000);
    },

    /**
     * @override
     * @private
     */
    _showInitialConfirmation: function () {
        this._super();
        this._gameScene.getHudLayer().setHudEnabled(true);
        this.onGridChanged();
    },

    /**
     * @param {String} event
     * @param {*} parameter
     * @override
     */
    _onGameSceneEvent: function (event, parameter) {
        this._super(event, parameter);

        switch(event) {
            case core.GameViewEvent.Types.GAME_OVER_ANIMATION_COMPLETE:
                this._onGameOverAnimationComplete();
                break;

            case fts.FillTheSquareLayer.Events.PLACED_PIECE:
                this._onPiecePlaced(parameter.model, parameter.i, parameter.j, parameter.position);
                break;

            case fts.FillTheSquareLayer.Events.WILL_CLEAR_TILES:
                this._onTileSequenceWillClear(parameter.sequence, parameter.position);
                break;

            case fts.FillTheSquareLayer.Events.CLEARED_TILES:
                this._onTileSequenceCleared(parameter.sequence, parameter.position);
                break;

            case fts.FillTheSquareLayer.Events.FINISHED_CLEARING_TILES:
                this._onAllTileSequencesCleared();
                break;

            case fts.FillTheSquareLayer.Events.EXPLODED_TILES:
                this._onTileSequenceExploded(parameter.model, parameter.i, parameter.j, parameter.position);
                break;

            case fts.FillTheSquareLayer.Events.ROTATED_PIECE:
                this._onPieceRotated(parameter);
                break;

            case core.GameViewEvent.Types.PRESSED_ACTION_HUD_BUTTON:
                this._onGameOver();
                break;
        }
    },

    /**
     * @private
     */
    _onGameOverAnimationComplete: function () {
        this.audioManager.changeBgm(fts.Sounds.BGM_GAME_OVER);
    },

    /**
     * @private
     * @override
     */
    _restartGame: function () {
        this._super();
        this.audioManager.changeBgm(fts.Sounds.BGM_MAIN_THEME);
        this.onGridChanged();
    },

    /**
     * @private
     * @override
     */
    _onGameOver: function () {
        this._super();
        this.audioManager.changeBgm(fts.Sounds.BGM_GAME_OVER);
        this.audioManager.stopBgm();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     * @param {cc.Point} position
     * @private
     */
    _onPiecePlaced: function (pieceModel, i, j, position) {
        this.gameManager.placePiece(pieceModel, i, j);
        this.onGridChanged();

        if(!this.tutorialManager.isComplete()) {
            this._gameScene.disableAll();
        }
    },

    /**
     * @param {Object} tileSequence
     * @param {cc.Point} position
     * @private
     */
    _onTileSequenceWillClear: function (tileSequence, position) {
        let hudLayer = this._gameScene.getHudLayer();
        hudLayer.createCoinAnimation(tileSequence.coins/10, tileSequence.coins, position);
        hudLayer.createPoppingTextAnimation("x" + tileSequence.combo, position, tileSequence.combo);
    },

    /**
     * @param {Object} tileSequence
     * @param {cc.Point} position
     * @private
     */
    _onTileSequenceCleared: function (tileSequence, position) {
        this.gameManager.commitClearedTileSequence(tileSequence);
    },

    /**
     * @private
     */
    _onAllTileSequencesCleared: function () {
        this.tutorialManager.advance();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @param {Number} i
     * @param {Number} j
     * @param {cc.Point} position
     * @private
     */
    _onTileSequenceExploded: function (pieceModel, i, j, position) {
        this.gameManager.explodeWithPieceModel(pieceModel, i, j);

        let gameLayer = this._gameScene.getGameLayer();
        gameLayer.playExplosionBurst(position);

        this.onGridChanged();
    },

    /**
     * @param {fts.PieceModel} pieceModel
     * @private
     */
    _onPieceRotated: function (pieceModel) {
        this.gameManager.rotatePieceModel(pieceModel);
    },

    /**
     * @public
     */
    onGridChanged: function () {
        let possibleMove = this.gameManager.getPossibleMove();
        this._roundsSinceLastNoMovesAlert++;

        if(!possibleMove) {
            this._gameScene.getHudLayer().setActionHudActive(true);

            if(this._roundsSinceLastNoMovesAlert > fts.FillTheSquareDelegate.MINIMUM_ROUNDS_TO_SHOW_NO_MOVES_ALERT && this.tutorialManager.isComplete()) {
                this._showNoMovesAlert();
            }
        }
        else {
            this._gameScene.getHudLayer().setActionHudActive(false);
        }
    },

    /**
     * @private
     */
    _showNoMovesAlert: function () {
        let alert = new core.Alert(this._gameScene.sceneNotifier);
        let hasItems = this.userManager.hasAnyConsumable();

        let message;
        if(hasItems) {
            message = "No more valid moves! Either use an item or restart!";
            alert.setCallbackEvent(core.GameViewEvent.Types.REQUESTED_RESUME);
        }
        else {
            message = "It seems like there are no more valid moves!";
            alert.setCallbackEvent(core.GameViewEvent.Types.GAME_OVER);
        }

        alert.build(
            "Uh Oh!",
            message,
            core.MetadataSpriteFrames.EMOJI_SAD,
            3
        );

        this._gameScene.disableAll();

        let scene = this._gameScene;
        setTimeout(function () {
            scene.getPopUpLayer().setTargetNode(alert, core.PopUpLayer.ContentPosition.CENTERED);
            scene.showPopUp();
        }, 300);
    }
})

/**
 * @type {number}
 */
fts.FillTheSquareDelegate.MINIMUM_ROUNDS_TO_SHOW_NO_MOVES_ALERT = 10;