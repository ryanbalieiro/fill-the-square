/**
 * Created by Ryan Balieiro on 03/09/20.
 * @class
 * @extends {cc.Class}
 */
core.Magnet = cc.Node.extend({
    /** @type {core.Sprite[]} **/
    _particles: null,

    /** @type {String} **/
    _particleTexture: null,

    /** @type {Number} **/
    _amount: null,

    /** @type {Number} **/
    _scaleFactor: null,

    /** @type {cc.Point} **/
    _initialPosition: null,

    /** @type {cc.Point} **/
    _targetPosition: null,

    /** @type {Function} **/
    _particleCompletionCallback: null,

    /** @type {Function} **/
    _totalCompletionCallback: null,

    /** @type {Number} **/
    _customCounter: 0,

    /**
     * @constructs
     * @param {String} particleTexture
     */
    ctor: function (particleTexture) {
        this._super();
        this._particles = [];
        this._particleTexture = particleTexture;
    },

    /**
     * @param {Number} amount
     * @param {cc.Point} initialPosition
     * @param {cc.Point} targetPosition
     * @param {Number} scaleFactor
     * @param {Function} [particleCompletionCallback]
     * @param {Function} [totalCompletionCallback]
     */
    build: function (amount, initialPosition, targetPosition, scaleFactor, particleCompletionCallback, totalCompletionCallback) {
        this.destroy();

        this._amount = amount;
        this._scaleFactor = scaleFactor;
        this._initialPosition = initialPosition;
        this._targetPosition = targetPosition;
        this._particleCompletionCallback = particleCompletionCallback;
        this._totalCompletionCallback = totalCompletionCallback;

        this.reset();
    },

    /**
     * @param {Number} total
     */
    setCustomCounter: function (total) {
        this._customCounter = total;
    },

    /**
     * @return {number}
     */
    getTotalAnimatingParticles: function () {
        return this._particles.length;
    },

    /**
     * @public
     */
    reset: function () {
        for(let i = 0 ; i < this._amount ; i++) {
            let particle = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(this._particleTexture));
            this.addChild(particle);
            this._particles.push(particle);
            particle.setPosition(this._initialPosition);
            particle.setScale(0.4*this._scaleFactor);
            particle.setVisible(false);
        }
    },

    /**
     * @public
     */
    play: function () {
        for(let i = 0 ; i < this._particles.length ; i++) {
            let particle = this._particles[i];

            particle.runAction(cc.sequence(
                cc.delayTime(0.01 + 0.1*i),
                cc.show(),
                cc.spawn(
                    cc.moveBy(0.3, Math.random()*200 - 100, Math.min(250, 200+50*i)).easing(cc.easeBackOut()),
                    cc.scaleTo(0.1, this._scaleFactor, this._scaleFactor)
                ),
                cc.delayTime(0.3),
                cc.spawn(
                    cc.moveTo(0.2, this._targetPosition),
                    cc.scaleTo(0.1, 0.8*this._scaleFactor, 0.8*this._scaleFactor)
                ),
                cc.spawn(
                    cc.scaleTo(0.1, 1.5*this._scaleFactor, 1.5*this._scaleFactor),
                    cc.fadeOut(0.1)
                ),
                cc.callFunc(function () {
                    this._onParticleAnimationCompleted(particle)
                }, this)
            ));
        }
    },

    /**
     * @param {core.Sprite} particle
     * @private
     */
    _onParticleAnimationCompleted: function (particle) {
        particle.stopAllActions();
        particle.removeFromParent(true);
        this._particles.splice(this._particles.indexOf(particle), 1);

        let customCounterParcel = Math.ceil(this._customCounter/(this._particles.length + 1));
        this._customCounter -= customCounterParcel;

        if(this._particleCompletionCallback)
            this._particleCompletionCallback(this, customCounterParcel);

        if(this._totalCompletionCallback && this.getTotalAnimatingParticles() === 0)
            this._totalCompletionCallback(this);
    },

    /**
     * @public
     */
    destroy: function () {
        while(this._particles.length > 0) {
            this._onParticleAnimationCompleted(this._particles[0]);
        }
    }
})