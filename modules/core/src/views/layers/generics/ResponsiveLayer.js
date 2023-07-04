/**
 * Created by Ryan Balieiro on 21/08/20.
 * @class
 * @extends {core.InteractiveLayer}
 */
core.ResponsiveLayer = core.InteractiveLayer.extend({
    /** @type {Number} **/
    winWidth:0,

    /** @type {Number} **/
    winHeight: 0,

    /** @type {Number} **/
    winProportion: 0,

    /** @type {cc.LayerColor} **/
    _lyrBackdrop: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
        this._lyrBackdrop = new cc.LayerColor(core.colorHelpers.get(core.ColorHelpers.BLACK));
        this._lyrBackdrop.setOpacity(155);
        this._lyrBackdrop.setVisible(false);
        this.addChild(this._lyrBackdrop);
    },

    /**
     * @public
     */
    init: function () {
        this._super();
        this._checkViewPortSize();
    },

    /**
     * @override
     * @param {Number} dt
     */
    update: function (dt) {
        this._super(dt);
        this._checkViewPortSize();
    },

    /**
     * @public
     * @abstract
     */
    layoutElements: function () {
        this._lyrBackdrop.changeWidth(this.winWidth);
        this._lyrBackdrop.changeHeight(this.winHeight);
    },

    /**
     * @param {Boolean} enabled
     * @param {cc.Node[]|null} [targets]
     */
    setFocus: function (enabled, targets) {
        this._lyrBackdrop.setVisible(enabled);
        if(!targets) {
            this._lyrBackdrop.setLocalZOrder(-1);
            return;
        }

        this._lyrBackdrop.setLocalZOrder(99);

        for(let i = 0 ; i < targets.length ; i++) {
            let target = targets[i];
            if(enabled) {
                target.__savedZOrder = target.getLocalZOrder();
                target.setLocalZOrder(100);
            }
            else if(target.__savedZOrder !== undefined) {
                target.setLocalZOrder(target.__savedZOrder);
            }
        }
    },

    /**
     * @return {cc.LayerColor._visible|boolean}
     */
    hasFocus: function () {
        return this.isVisible() && this._lyrBackdrop.isVisible();
    },

    /**
     * @param {cc.Node} node
     * @param {Number} containerX
     * @param {Number} containerY
     * @param {Number} containerWidth
     * @param {Number} containerHeight
     * @param {core.ResponsiveLayer.Alignment} [alignment=core.ResponsiveLayer.Alignment.CENTER]
     */
    fitInsideContainer: function (node, containerX, containerY, containerWidth, containerHeight, alignment) {
        alignment = alignment || core.ResponsiveLayer.Alignment.CENTER;
        
        node.setScale(1);
        let nodeWorldBounds = node.getBoundingBoxToWorld();
        let scaleToFitWidth = containerWidth/nodeWorldBounds.width;
        let scaleToFitHeight = containerHeight/nodeWorldBounds.height;

        let targetScale = Math.min(Math.min(scaleToFitWidth, scaleToFitHeight), 1);
        node.setScale(targetScale);
        nodeWorldBounds = node.getBoundingBoxToWorld();

        let diffX = containerWidth - nodeWorldBounds.width;
        let targetX = containerX + containerWidth/2 + diffX*(0.5-alignment.x);
        let diffY = containerHeight - nodeWorldBounds.height;
        let targetY = containerY + containerHeight/2 + diffY*(0.5-alignment.y);

        node.setPosition(targetX, targetY);
    },

    /**
     * @private
     */
    _checkViewPortSize: function () {
        if(this.winWidth !== cc.winSize.width) {
            this.winWidth = cc.winSize.width;
            this.winHeight = cc.winSize.height;
            this.winProportion = core.layoutHelpers.getWinProportion();
            this.layoutElements();
        }
    }
})

/**
 * @enum
 */
core.ResponsiveLayer.Alignment = {
    TOP_LEFT: {x:1, y:0},
    TOP_CENTER: {x:0.5, y:0},
    TOP_RIGHT: {x:0, y:0},
    CENTER_LEFT: {x:1, y:0.5},
    CENTER: {x:0.5, y:0.5},
    CENTER_RIGHT: {x:0, y:0.5},
    BOTTOM_LEFT: {x:1, y:1},
    BOTTOM_CENTER: {x:0.5, y:1},
    BOTTOM_RIGHT: {x:0, y:1}
}