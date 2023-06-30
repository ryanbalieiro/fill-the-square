/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {cc.Scene}
 */
core.GameScene = cc.Scene.extend({
    /** @type {core.Notifier} **/
    sceneNotifier: null,

    /** @type {core.GameLayer} **/
    _gameLayer: null,

    /** @type {core.HudLayer} **/
    _hudLayer: null,

    /** @type {core.PopUpLayer} **/
    _popUpLayer: null,

    /** @type {core.InteractiveLayer[]} **/
    _allLayers: null,

    /** @type {cc.EventListener} **/
    _touchEvent: null,

    /** @type {cc.EventListener} **/
    _mouseEvent: null,

    /** @type {Boolean} **/
    _firstTouchPerformed: false,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     * @param {core.GameLayer} gameLayer
     * @param {core.HudLayer} hudLayer
     * @param {core.PopUpLayer} popUpLayer
     */
    ctor: function (sceneNotifier, gameLayer, hudLayer, popUpLayer) {
        this._super();

        this.sceneNotifier = sceneNotifier;
        this._gameLayer = gameLayer;
        this._hudLayer = hudLayer;
        this._popUpLayer = popUpLayer;

        this.addChild(this._gameLayer);
        this.addChild(this._hudLayer);
        this.addChild(this._popUpLayer);

        this._allLayers = [this._gameLayer, this._hudLayer, this._popUpLayer];
    },

    /**
     * @returns {core.GameLayer|*}
     */
    getGameLayer: function () {
        return this._gameLayer;
    },

    /**
     * @returns {core.HudLayer}
     */
    getHudLayer: function () {
        return this._hudLayer;
    },

    /**
     * @returns {core.PopUpLayer}
     */
    getPopUpLayer: function () {
        return this._popUpLayer;
    },

    /**
     * @public
     */
    onEnter: function () {
        this._super();
        core.api.nativeViewport.hideFullScreenLoader();

        for(let i = 0 ; i < this._allLayers.length ; i++) {
            let layer = this._allLayers[i];
            layer.disable();
        }

        this._addEventListeners();
        this.scheduleUpdate();
        this.update(1/60);
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.READY);
    },

    /**
     * @public
     */
    showPopUp: function () {
        this._hudLayer.disable();
        this._gameLayer.disable();
        this._popUpLayer.enable();
    },

    /**
     * @public
     */
    hidePopUp: function () {
        this._hudLayer.enable();
        this._gameLayer.enable();
        this._popUpLayer.disable();
    },

    /**
     * @public
     */
    disableAll: function () {
        this._hudLayer.disable();
        this._gameLayer.disable();
        this._popUpLayer.disable();
    },

    /**
     * @private
     */
    _addEventListeners: function () {
        let self = this;

        if(!cc.sys.isMobile) {
            this._mouseEvent = cc.EventListener.create({
                event: cc.EventListener.MOUSE,
                onMouseDown: (event) => {self._onMouseDown(event)},
                onMouseMove: (event) => {self._onMouseMove(event)},
                onMouseUp: (event) => {self._onMouseUp(event)}
            });

            cc.eventManager.addListener(this._mouseEvent, this);
        }
        else {
            this._touchEvent = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                onTouchBegan: (touch,event) => {if(touch.getID() === 0) {self._onMouseDown(touch); return true;}},
                onTouchMoved: (touch,event) => {if(touch.getID() === 0) {self._onMouseMove(touch); return true;}},
                onTouchEnded: (touch,event) => {if(touch.getID() === 0) {self._onMouseUp(touch); return true;}}
            });

            cc.eventManager.addListener(this._touchEvent, this);
        }
    },

    /**
     * @private
     */
    _removeEventListeners: function () {
        if(this._mouseEvent) {
            cc.eventManager.removeListener(this._mouseEvent);
        }

        if(this._touchEvent) {
            cc.eventManager.removeListener(this._touchEvent);
        }

        this._mouseEvent = null;
        this._touchEvent = null;
    },

    /**
     * @param event
     * @returns {boolean}
     * @private
     */
    _onMouseDown: function (event) {
        for(let i = 0 ; i < this._allLayers.length ; i++) {
            let layer = this._allLayers[i];
            layer.onMouseDown(event);
        }

        if(!this._firstTouchPerformed) {
            this._firstTouchPerformed = true;
            this.sceneNotifier.dispatch(core.GameViewEvent.Types.FIRST_TOUCH_PERFORMED);
        }

        return true;
    },

    /**
     * @param event
     * @returns {boolean}
     * @private
     */
    _onMouseMove: function (event) {
        for(let i = 0 ; i < this._allLayers.length ; i++) {
            let layer = this._allLayers[i];
            layer.onMouseMove(event);
        }

        return true;
    },

    /**
     * @param event
     * @returns {boolean}
     * @private
     */
    _onMouseUp: function (event) {
        for(let i = 0 ; i < this._allLayers.length ; i++) {
            let layer = this._allLayers[i];
            layer.onMouseUp(event);
        }

        return true;
    },

    /**
     * @override
     * @param {Number} dt
     */
    update: function (dt) {
        for(let i = 0 ; i < this._allLayers.length ; i++) {
            let layer = this._allLayers[i];
            layer.update(dt);
        }
    },

    /**
     * @override
     */
    onExit: function () {
        this._super();
        this._removeEventListeners();
        this.unscheduleUpdate();
    }
})