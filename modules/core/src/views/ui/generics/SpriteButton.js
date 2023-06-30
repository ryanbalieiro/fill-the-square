/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {core.Button}
 */
core.SpriteButton = core.Button.extend({
    /** @type {String} **/
    _idleSpriteFrameName:null,

    /** @type {String} **/
    _hoverSpriteFrameName:null,

    /** @type {String} **/
    _pressedSpriteFrameName:null,

    /** @type {Number} **/
    _idleOpacity: 230,

    /**
     * @param {String} [idleSpriteFrameNameOrSpriteFrameBundle]
     * @param {String} hoverSpriteFrameName
     * @param {String} pressedSpriteFrameName
     */
    ctor: function (idleSpriteFrameNameOrSpriteFrameBundle, hoverSpriteFrameName, pressedSpriteFrameName) {
        this._super(cc.spriteFrameCache.getSpriteFrame(core.SpriteFrames.PARTICLE_TEXTURE));
        this._status = core.Button.Status.IDLE;

        this.setSprites(idleSpriteFrameNameOrSpriteFrameBundle, hoverSpriteFrameName, pressedSpriteFrameName);
    },

    /**
     * @param {String|*} [idleSpriteFrameNameOrSpriteFrameBundle]
     * @param {String|*} hoverSpriteFrameName
     * @param {String|*} pressedSpriteFrameName
     */
    setSprites: function (idleSpriteFrameNameOrSpriteFrameBundle, hoverSpriteFrameName, pressedSpriteFrameName) {
        if(typeof idleSpriteFrameNameOrSpriteFrameBundle === 'string') {
            this._idleSpriteFrameName = idleSpriteFrameNameOrSpriteFrameBundle;
            this._hoverSpriteFrameName = hoverSpriteFrameName;
            this._pressedSpriteFrameName = pressedSpriteFrameName;
        }
        else {
            this._idleSpriteFrameName = idleSpriteFrameNameOrSpriteFrameBundle[0];
            this._hoverSpriteFrameName = idleSpriteFrameNameOrSpriteFrameBundle[1];
            this._pressedSpriteFrameName = idleSpriteFrameNameOrSpriteFrameBundle[2];
        }

        this.setStatus(this._status);
    },

    /**
     * @param {Number} opacity
     */
    setIdleOpacity: function (opacity) {
        this._idleOpacity = opacity;
    },

    /**
     * @param {String} status
     */
    setStatus: function (status) {
        this._super(status);
        switch(status) {
            case core.Button.Status.IDLE:
                this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._idleSpriteFrameName));
                this.setOpacity(this._idleOpacity);
                break;

            case core.Button.Status.HOVERED:
                this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._hoverSpriteFrameName));
                this.setOpacity(255);
                break;

            case core.Button.Status.PRESSED:
                this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._pressedSpriteFrameName));
                this.setOpacity(255);
                break;

            case core.Button.Status.SELECTED:
            case core.Button.Status.DISABLED:
                this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(this._idleSpriteFrameName));
                this.setOpacity(155);
                break;
        }
    }
})