/**
 * Created by Ryan Balieiro on 21/08/20.
 * @class
 * @extends {cc.Layer}
 */
core.InteractiveLayer = cc.Layer.extend({
    /** @type {core.Notifier} **/
    sceneNotifier: null,

    /** @type {core.InteractiveLayer.InteractionStatus} **/
    status: null,

    /** @type {core.InteractiveNode[]} **/
    _interactiveNodes:null,

    /** @type {cc.Node} **/
    _draggingObject: null,

    /** @type {cc.Point} **/
    _touchCoords: null,

    /**
     * @public
     */
    ctor: function () {
        this._super();
        this.notifier = new core.Notifier();
        this._touchCoords = new cc.Point(0, 0);
        this._interactiveNodes = [];
    },

    /**
     * @public
     */
    enable: function () {
        this.status = core.InteractiveLayer.InteractionStatus.ENABLED;
    },

    /**
     * @public
     */
    disable: function () {
        this.status = core.InteractiveLayer.InteractionStatus.DISABLED;
    },

    /**
     * @public
     */
    lock: function () {
        if(this.status === core.InteractiveLayer.InteractionStatus.ENABLED) {
            this.status = core.InteractiveLayer.InteractionStatus.LOCKED;
        }
    },

    /**
     * @public
     */
    unlock: function () {
        if(this.status === core.InteractiveLayer.InteractionStatus.LOCKED) {
            this.status = core.InteractiveLayer.InteractionStatus.ENABLED;
        }
    },

    /**
     * @return {boolean}
     */
    isDragging: function () {
        return this._draggingObject !== null;
    },

    /**
     * @param event
     * @return {Boolean}
     */
    onMouseDown: function (event) {
        this._updateMouseCoords(event);
        if(this.status !== core.InteractiveLayer.InteractionStatus.ENABLED)
            return false;

        for(let i = 0 ; i < this._interactiveNodes.length ; i++) {
            let interactiveNode = this._interactiveNodes[i];
            interactiveNode.onMouseDown(event);
        }

        return true;
    },

    /**
     * @param event
     * @return {Boolean}
     */
    onMouseMove: function (event) {
        if(this.status !== core.InteractiveLayer.InteractionStatus.ENABLED)
            return false;

        this._updateMouseCoords(event);
        for(let i = 0 ; i < this._interactiveNodes.length ; i++) {
            let interactiveNode = this._interactiveNodes[i];
            interactiveNode.onMouseMove(event);
        }

        this.updateDrag();

        return true;
    },

    /**
     * @param event
     * @return {Boolean}
     */
    onMouseUp: function (event) {
        this._updateMouseCoords(event);
        if(this.status !== core.InteractiveLayer.InteractionStatus.ENABLED)
            return false;

        for(let i = 0 ; i < this._interactiveNodes.length ; i++) {
            let interactiveNode = this._interactiveNodes[i];
            interactiveNode.onMouseUp(event);
        }

        this.updateDrag();
        this.stopDrag();

        return true;
    },

    /**
     * @param event
     * @private
     */
    _updateMouseCoords: function (event) {
        this._touchCoords.x = event.getLocationX();
        this._touchCoords.y = event.getLocationY();
    },

    /**
     * @param {cc.Node} node
     */
    startDrag: function (node) {
        this._draggingObject = node;
        this._draggingObject.cleanup();
        this._draggingObject.setLocalZOrder(99);
        this._draggingObject.setVisible(true);
        this.updateDrag();
    },

    /**
     * @public
     */
    updateDrag: function () {
        if(!this.isDragging())
            return;

        this._draggingObject.setPosition(this._touchCoords);
    },

    /**
     * @public
     */
    stopDrag: function () {
        this.cancelDrag();
    },

    /**
     * @public
     */
    cancelDrag: function () {
        if(!this._draggingObject)
            return;

        this._draggingObject.cleanup();
        this._draggingObject.setVisible(false);
        this._draggingObject = null;
    }
})

/** @enum **/
core.InteractiveLayer.InteractionStatus = {
    ENABLED: "interactionStatusEnabled",
    LOCKED: "interactionStatusLocked",
    DISABLED: "interactionStatusDisabled"
}