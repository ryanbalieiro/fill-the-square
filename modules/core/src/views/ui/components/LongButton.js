/**
 * Created by Ryan Balieiro on 24/08/20.
 * @class
 * @extends {core.Button}
 */
core.LongButton = core.Button.extend({
    /** @type {core.Sprite} **/
    _overlay: null,

    /** @type {cc.Color} **/
    _overlayColor: null,

    /** @type {cc.Color} **/
    _overlayHighlightedColor: null,

    /** @type {core.Label} **/
    _lbl:null,

    /** @type {core.Sprite} **/
    _sprIcon:null,

    /**
     * @constructs
     * @param {cc.Color} color
     * @param {cc.Color} highlightedColor
     * @param {String} text
     */
    ctor: function (color, highlightedColor, text) {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.LONG_BUTTON));
        this.setSoundUrl(core.Sounds.SFX_UI_CLAP);

        this.setColor(core.colorHelpers.get(core.ColorHelpers.BLACK));
        this.setOpacity(155);

        this._overlay = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.LONG_BUTTON));
        this._overlay.setAnchorPoint(cc.p(0,0));
        this._lbl = new core.Label("", core.Fonts.PATUA_ONE_SMALL, this.getBoundingBoxToWorld().width, cc.TEXT_ALIGNMENT_CENTER);

        this.addChild(this._overlay);
        this._overlay.addChild(this._lbl);

        this.setText(text);
        this.setColorSchema(color, highlightedColor);
        this.setStatus(core.Button.Status.IDLE);
    },

    /**
     * @param {cc.Color} color
     * @param {cc.Color} highlightedColor
     * @param highlightedColor
     */
    setColorSchema: function (color, highlightedColor) {
        this._overlayColor = color;
        this._overlayHighlightedColor = highlightedColor;
        this.setStatus(this._status);
    },

    /**
     * @param {String} text
     */
    setText: function (text) {
        this._lbl.setString(text.toUpperCase());
        this._updateLayout();
    },

    /**
     * @param {String} iconSpriteFrame
     */
    setIcon: function (iconSpriteFrame) {
        if(!this._sprIcon) {
            this._sprIcon = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(iconSpriteFrame));
            this._overlay.addChild(this._sprIcon);
        }

        this._updateLayout();
    },

    /**
     * @public
     */
    removeIcon: function () {
        if(this._sprIcon) {
            this._sprIcon.removeFromParent();
            this._sprIcon = null;
        }

        this._updateLayout();
    },

    /**
     * @private
     */
    _updateLayout: function () {
        this._lbl.setBoundingWidth(500);
        if(this._sprIcon) {
            this._sprIcon.setScale(1);
            this._sprIcon.setScale(80/this._sprIcon.getBoundingBox().width);

            let iconX = 60;
            if(this._lbl.getString().length < 4)
                iconX = 90;
            else if(this._lbl.getString().length === 4)
                iconX = 75;

            this._sprIcon.setPosition(iconX, 55);
            this._lbl.setPosition(195, 62);
        }
        else {
            this._lbl.setPosition(150, 62);
        }
    },

    /**
     * @param {String} status
     */
    setStatus: function (status) {
        this._super(status);

        this._overlay.y = 14;
        if(this._sprIcon) {
            this._sprIcon.setOpacity(255);
        }

        switch(status) {
            case core.Button.Status.IDLE:
                this._overlay.setColor(this._overlayColor);
                this._lbl.setOpacity(155);
                break;

            case core.Button.Status.HOVERED:
                this._overlay.setColor(this._overlayHighlightedColor);
                this._lbl.setOpacity(200);
                break;

            case core.Button.Status.PRESSED:
                this._overlay.y = 10;
                this._overlay.setColor(this._overlayHighlightedColor);
                this._lbl.setOpacity(255);
                break;

            case core.Button.Status.DISABLED:
                this._overlay.setColor(core.colorHelpers.get(core.ColorHelpers.BACKGROUND));
                this._lbl.setOpacity(55);
                if(this._sprIcon) {
                    this._sprIcon.setOpacity(155);
                }
                break;

            case core.Button.Status.SELECTED:
                this._overlay.setColor(core.colorHelpers.get(core.ColorHelpers.GOLD, true));
                this._lbl.setOpacity(255);
                break;
        }
    }
})