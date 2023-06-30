/**
 * Created by Ryan Balieiro on 30/07/19.
 */

/**
 * @enum {Function}
 */
core.actionHelpers = {
    /**
     * @param {Number} time - o tempo da animação.
     * @param {Number} cycles - o número de ciclos da animação.
     * @param {Number} initialRotation - a rotação inicial do objeto.
     * @param {Number} strength - a 'força' da rotação (em pixels).
     * @returns {cc.Sequence}
     */
    shake: function(time, cycles, initialRotation, strength) {
        var sequenceSteps = [];
        for(var i = 0 ; i < cycles ; i++) {
            sequenceSteps.push(
                cc.rotateTo(time/(cycles*4), initialRotation - strength),
                cc.rotateTo(time/(cycles*2), initialRotation + strength),
                cc.rotateTo(time/(cycles*4), initialRotation)
            )
        }

        return cc.sequence(sequenceSteps);
    },

    /**
     * @param {Number} time - o tempo da animação.
     * @param {Number} flicks - o número de piscadas.
     * @param {cc.Color} initialColor - a cor inicial.
     * @param {cc.Color} targetColor - a cor final.
     * @returns {cc.Sequence}
     */
    flicker: function(time, flicks, initialColor, targetColor) {
        var sequenceSteps = [];
        for(var i = 0 ; i < flicks ; i++) {
            sequenceSteps.push(
                cc.tintTo(time/(flicks*2), targetColor.r, targetColor.g, targetColor.b),
                cc.tintTo(time/(flicks*2), initialColor.r, initialColor.g, initialColor.b)
            );
        }
        return cc.sequence(sequenceSteps);
    },

    /**
     * @param {Number} time
     * @param {Number} cycles
     * @param {Number} dx
     * @param {Number} dy
     */
    flutter : function(time, cycles, dx, dy) {
        dx = dx || 0;
        dy = dy || 0;

        var sequenceSteps = [];
        for(var i = 0 ; i < cycles ; i++) {
            sequenceSteps.push(
                cc.moveBy(time/(cycles*4), -dx, -dy),
                cc.moveBy(time/(cycles*2), 2*dx, 2*dy),
                cc.moveBy(time/(cycles*4), -dx, -dy)
            )
        }

        return cc.sequence(sequenceSteps);
    }
};