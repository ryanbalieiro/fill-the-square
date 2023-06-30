/**
 * Created by Ryan Balieiro on 08/09/20.
 * @class
 * @extends {cc.Class}
 */
core.DisplayState = cc.Class.extend({
    /** @type {cc.Point} **/
    position: null,

    /** @type {Number} **/
    scale: 1,

    /** @type {Number} **/
    opacity: 255,

    /** @type {Boolean} **/
    visible: false,

    /**
     * @param {cc.Node} node
     */
    applyTo: function (node) {
        if(this.position !== null) {
            node.setPosition(this.position);
        }

        node.setScale(this.scale);
        node.setOpacity(this.opacity);
        node.setVisible(this.visible);
    }
})