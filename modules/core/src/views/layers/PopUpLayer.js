/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {core.ResponsiveLayer}
 */
core.PopUpLayer = core.ResponsiveLayer.extend({
    /** @type {cc.LayerColor} **/
    _lyrBackdrop: null,

    /** @type {core.PopUpNode} **/
    _popUpNode: null,

    /** @type {core.PopUpLayer.ContentPosition} **/
    _popUpPosition: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     */
    ctor: function (sceneNotifier) {
        this._super();
        this.sceneNotifier = sceneNotifier;
        this._lyrBackdrop.setVisible(true);
    },

    /**
     * @override
     */
    layoutElements: function () {
        this._super();
        this._layoutPopUpNode();
    },

    /**
     * @private
     */
    _layoutPopUpNode: function () {
        if(!this._popUpNode)
            return;

        switch(this._popUpPosition) {
            case core.PopUpLayer.ContentPosition.ABSOLUTE:
                this._popUpNode.targetPosition = cc.p(0, 0);
                this._popUpNode.targetScale = 1.0;
                this._popUpNode.onParentLayerWillResize();
                break;

            case core.PopUpLayer.ContentPosition.CENTERED:
                this._popUpNode.targetPosition = cc.p(cc.winSize.width/2, cc.winSize.height/2);

                this._popUpNode.onParentLayerWillResize();
                let originalWidth = this._popUpNode.getBoundingBoxToWorld().width/this._popUpNode.getScaleX();
                let maxWidth = cc.winSize.width - 50;
                this._popUpNode.targetScale = Math.min(maxWidth/originalWidth, 1.0);

                if(this._popUpNode.getBoundingBoxToWorld().height/cc.winSize.height > 0.66)
                    this._popUpNode.targetPosition.y -= cc.winSize.height*0.03;
                
                break;
        }

        this._popUpNode.onParentLayerResize();
    },

    /**
     * @param {core.PopUpNode} popUpNode
     * @param {core.PopUpLayer.ContentPosition} popUpPosition
     */
    setTargetNode: function (popUpNode, popUpPosition) {
        this._destroyPopUpNode();

        this._popUpNode = popUpNode;
        this._popUpPosition = popUpPosition;

        this._layoutPopUpNode();
        this.addChild(this._popUpNode);
        this._interactiveNodes.push(this._popUpNode);
    },

    /**
     * @override
     */
    enable: function () {
        this._super();
        this.setVisible(true);

        if(this._popUpNode) {
            this._popUpNode.tweenIn();
        }
    },

    /**
     * @override
     */
    disable: function () {
        this._super();
        this.setVisible(false);

        if(this._popUpNode) {
            this._destroyPopUpNode();
        }
    },

    /**
     * @private
     */
    _destroyPopUpNode: function () {
        if(this._popUpNode) {
            this._popUpNode.cleanup();
            this._popUpNode.destroy();
            this.removeChild(this._popUpNode);
            this._interactiveNodes.splice(this._interactiveNodes.lastIndexOf(this._popUpNode), 1);
        }
    }
})

/**
 * @enum
 */
core.PopUpLayer.ContentPosition = {
    ABSOLUTE: "contentPositionAbsolute",
    CENTERED: "contentPositionCentered"
}