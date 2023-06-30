/**
 * Created by Ryan Balieiro on 30/08/20.
 * @class
 * @extends {cc.Node}
 */
fts.Piece = cc.Node.extend({
    /** @type {fts.Tile[]} **/
    _tiles: null,

    /** @type {fts.PieceModel} **/
    _model: null,

    /** @type {Number} **/
    _displayingModelUuid: null,

    /** @type {cc.Point} **/
    _initialPosition: null,

    /** @type {String} **/
    _themeName: null,

    /** @type {Boolean} **/
    _animating: false,

    /** @type {Boolean} **/
    _locked: false,

    /** @type {core.HitTestChecker} **/
    hitTestChecker: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
        this.setCascadeOpacityEnabled(true);
        this.hitTestChecker = new core.HitTestChecker(this);
    },

    /**
     * @returns {fts.PieceModel}
     */
    getModel: function () {
        return this._model;
    },

    /**
     * @return {String}
     */
    getThemeName: function () {
        return this._themeName;
    },

    /**
     * @param {String} themeName
     * @param {Number} [animationDelayMultiplier=undefined]
     * @param {core.Notifier} [sceneNotifier]
     */
    skin: function (themeName, animationDelayMultiplier, sceneNotifier) {
        if(this._themeName === themeName) {
            return;
        }

        let hasTheme = this._themeName;
        this._themeName = themeName;

        if(!hasTheme || animationDelayMultiplier === undefined || animationDelayMultiplier === null) {
            this._updateTilesTheme();
            return;
        }

        this.cleanUpAndReset();
        this._setAnimating(true);

        this.runAction(cc.sequence(
            cc.delayTime(0.01 + 0.25*animationDelayMultiplier),
            cc.callFunc(function () {
                if(sceneNotifier) {
                    sceneNotifier.dispatchAfter(0.1, core.GameViewEvent.Types.PLAY_EFFECT, fts.Sounds.SFX_FLIP);
                }
            }),
            cc.rotateBy(0.3, 180).easing(cc.easeSineIn()),
            cc.callFunc(this._updateTilesTheme, this),
            cc.rotateBy(0.3, 180).easing(cc.easeSineOut()),
            cc.callFunc(function () {
                this._setAnimating(false);
            }, this)
        ))
    },

    /**
     * @returns {Boolean}
     */
    isAnimating: function () {
        return this._animating;
    },

    /**
     * @param {Boolean} animating
     * @private
     */
    _setAnimating: function (animating) {
        if(!animating) {
            this.setRotation(0);
            this.setTilesWhiteOverlayVisible(false);
        }

        this._animating = animating;
    },

    /**
     * @return {Boolean}
     */
    isLockedForInteractions: function () {
        return this._locked;
    },

    /**
     * @param {Boolean} locked
     * @private
     */
    _setLocked: function (locked) {
        this._locked = locked;
    },

    /**
     * @private
     */
    _updateTilesTheme: function () {
        for(let i = 0 ; i < this._tiles.length; i++) {
            let tile = this._tiles[i];
            tile.setTheme(this._themeName);
        }
    },

    /**
     * @param {fts.PieceModel} pieceModel
     */
    initWithModel: function (pieceModel) {
        if(this._displayingModelUuid === pieceModel.uuid)
            return;

        this.destroy();
        this._tiles = [];
        this._model = pieceModel;
        this._displayingModelUuid = pieceModel.uuid;
        let lines = pieceModel.tiles;

        for(let i = 0 ; i < lines.length ; i++) {
            let line = lines[i];

            for(let j = 0 ; j < line.length ; j++) {
                let field = line[j];
                if(field > 0) {
                    let tile = new fts.Tile();
                    tile.setColorId(field);
                    tile.setTheme(this._themeName);
                    this.addChild(tile);

                    tile.x = (j - line.length/2 + 0.5) * fts.Tile.SPACING;
                    tile.y = (lines.length/2 - i - 0.5) * fts.Tile.SPACING;

                    this._tiles.push(tile);
                }
            }
        }

        this.hitTestChecker.emptyCache();
    },

    /**
     * @param {cc.Point|Object} position
     */
    setInitialPosition: function (position) {
        this._initialPosition = position;
    },

    /**
     * @returns {cc.Point}
     */
    getInitialPosition: function () {
        return this._initialPosition;
    },

    /**
     * @param {cc.Point} startPosition
     * @param {Number} [delay=0]
     * @param {core.Notifier} sceneNotifier
     */
    tweenToInitialPosition: function (startPosition, delay, sceneNotifier) {
        this.cleanUpAndReset();
        let movingAction;

        if(!startPosition) {
            this.setPosition(this._initialPosition.x + cc.winSize.width/2, this._initialPosition.y);
            this.setOpacity(0);
            movingAction = cc.spawn(
                cc.callFunc(function () {
                    if(sceneNotifier) {
                        sceneNotifier.dispatch(core.GameViewEvent.Types.PLAY_EFFECT, fts.Sounds.SFX_THROW);
                    }
                }),
                cc.jumpTo(0.4, this._initialPosition.x, this._initialPosition.y, 300, 1).easing(cc.easeSineOut()),
                cc.fadeIn(0.2)
            )
        }
        else {
            this.setPosition(startPosition);
            movingAction = cc.spawn(
                cc.moveTo(0.2, this._initialPosition).easing(cc.easeSineOut()),
                cc.scaleTo(0.4, 1).easing(cc.easeBackOut())
            );
        }

        this._setAnimating(true);
        this.runAction(cc.sequence(
            delay ? cc.delayTime(delay) : cc.show(),
            movingAction,
            cc.callFunc(function () {
                this._setAnimating(false);
            }, this)
        ))
    },

    /**
     * @public
     */
    cleanUpAndReset: function () {
        this.cleanup();
        this.setRotation(0);
        this._setAnimating(false);
        this._setLocked(false);

        if(this._initialPosition)
            this.setPosition(this._initialPosition);

        if(this._targetScale)
            this.setScale(this._targetScale);
    },

    /**
     * @public
     */
    shrinkTiles: function () {
        for(let i = 0 ; i < this._tiles.length ; i++) {
            let tile = this._tiles[i];
            tile.cleanup();
            tile.setScale(1);
            tile.runAction(cc.scaleTo(fts.Piece.SHRINK_ANIMATION_TIME, 0.75, 0.75).easing(cc.easeSineOut()));
            tile.setShadowVisible(true);
        }
    },

    /**
     * @public
     */
    growTiles: function () {
        for(let i = 0 ; i < this._tiles.length ; i++) {
            let tile = this._tiles[i];
            tile.cleanup();
            tile.setScale(0.75);
            tile.runAction(cc.scaleTo(fts.Piece.GROW_ANIMATION_TIME, 1, 1).easing(cc.easeSineOut()));
            tile.setShadowVisible(false);
        }
    },

    /**
     * @param {Boolean} visible
     */
    setTilesWhiteOverlayVisible: function (visible) {
        for(let i = 0 ; i < this._tiles.length ; i++) {
            let tile = this._tiles[i];
            tile.setWhiteOverlayVisible(visible);
        }
    },

    /**
     * @public
     * @param {Number} time
     */
    flick: function (time) {
        if(this._animating)
            return;

        this._setAnimating(true);
        this.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(time / 2, 10, 10).easing(cc.easeSineOut()),
            cc.rotateTo(time / 2, 0, 0).easing(cc.easeSineIn())
        )));
    },

    /**
     * @public
     * @param {Number} time
     */
    rotate: function (time) {
        this.cleanUpAndReset();
        this._setAnimating(true);
        this._setLocked(true);

        this.runAction(cc.sequence(
            cc.rotateBy(time, 90).easing(cc.easeBackOut()),
            cc.callFunc(this.cleanUpAndReset, this)
        ));
    },

    /**
     * @public
     */
    blink: function () {
        this.cleanUpAndReset();
        this._setAnimating(true);

        this.setTilesWhiteOverlayVisible(true);

        this.setOpacity(0);
        this.runAction(cc.repeatForever(cc.sequence(
            cc.fadeTo(0.5, 25),
            cc.fadeTo(0.5, 45),
        )))
    },

    /**
     * @public
     */
    destroy: function () {
        if(!this._tiles)
            return;

        for(let i = 0 ; i < this._tiles.length ; i++) {
            this.removeChild(this._tiles[i]);
        }

        this._model = null;
        this._tiles = null;
    }
})

fts.Piece.GROW_ANIMATION_TIME = 0.05;
fts.Piece.SHRINK_ANIMATION_TIME = 0.15;