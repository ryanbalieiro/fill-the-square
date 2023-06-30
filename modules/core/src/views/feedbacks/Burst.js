/**
 * Created by Ryan Balieiro on 09/03/19.
 * @class
 * @extends {cc.Node}
 */
core.Burst = cc.Node.extend({
    /** @lends core.Burst # **/

    /** @type {cc.Sprite[]} **/
    _particles: null,

    /** @type {String} **/
    _particleTexture: null,

    /** @type {Number} **/
    _amount: null,

    /** @type {Number} **/
    _time: null,

    /** @type {Number} **/
    _dx: null,

    /** @type {Number} **/
    _dy: null,

    /** @type {Number} **/
    _rotation: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
        this._particles = [];
    },

    /**
     * @param {Number} [_amount=20]
     * @param {Number} [_time=2]
     * @param {Number} [_dx=200]
     * @param {Number} [_dy=400]
     * @param {Number} [_rotation=720]
     * @param {String} [_particleTexture=core.SpriteFrames.PARTICLE_TEXTURE]
     */
    build: function (_amount, _time, _dx, _dy, _rotation, _particleTexture, ) {
        this._particleTexture = _particleTexture || core.SpriteFrames.PARTICLE_TEXTURE;
        this._amount = _amount || 20;
        this._time = _time || 2;
        this._dx = _dx || 200;
        this._dy = _dy || 400;
        this._rotation = _rotation || 720;

        for(let i = 0 ; i < this._amount ; i++) {
            let particle = new core.Sprite(cc.spriteFrameCache.getSpriteFrame(this._particleTexture));
            this.addChild(particle);
            this._particles.push(particle);
        }

        this.reset();
    },

    /**
     * @public
     * @param {Number} speed
     * @param {Boolean} [jumpOnly = false]
     */
    cacheActions: function (speed, jumpOnly) {
        for(let i = 0 ; i < this._amount ; i++) {
            let particle = this._particles[i];
            if(particle.action)
                particle.action.release(particle.action);

            let steps = [];
            let divider = speed/12;

            if(i % 4 === 0 || jumpOnly) {
                steps.push(cc.spawn(
                    cc.scaleTo((this._time - this._time * Math.random() * 0.4)/divider, 0, 0),
                    cc.rotateBy(this._time/divider, this._rotation),
                    cc.jumpBy(this._time/divider, -this._dx / 2 + this._dx / this._amount * i, -this._dy / 2, (this._dy / 2 + this._dy / 2 * Math.random()), 1)
                ));
            }
            else {
                steps.push(cc.spawn(
                    cc.scaleTo((this._time - this._time * Math.random() * 0.4)/divider, 0, 0),
                    cc.rotateBy(this._time/divider, this._rotation),
                    cc.moveBy(this._time/divider, Math.random() > 0.5 ? -this._dx/4 - this._dx*Math.random()/2 : this._dx/4 + this._dx*Math.random()/2, -this._dy*2*Math.random())
                ));
            }

            if(i === 0)
                steps.push(cc.targetedAction(this, cc.hide()));

            let action = cc.sequence(steps);
            action.retain();
            particle.action = action;
        }
    },

    /**
     * @param {String} particleTexture
     */
    setParticleTexture: function (particleTexture) {
        for(let i = 0 ; i < this._particles.length ; i++) {
            let particle = this._particles[i];
            particle.setSpriteFrame(particleTexture);
            this._particleTexture = particleTexture;
        }
    },

    /**
     * @param {cc.Color} color
     */
    setParticleColor: function (color) {
        for(let i = 0 ; i < this._particles.length ; i++) {
            let particle = this._particles[i];
            particle.setColor(color);
        }
    },

    /**
     * @public
     */
    reset: function () {
        this.setVisible(false);

        for(let i = 0 ; i < this._particles.length; i++) {
            let particle = this._particles[i];
            particle.cleanup();
            particle.x = -core.Burst.PARTICLE_SPACING + (i%3)*core.Burst.PARTICLE_SPACING;
            particle.y = -core.Burst.PARTICLE_SPACING + (Math.floor(i/3)%3)*core.Burst.PARTICLE_SPACING - core.Burst.PARTICLE_SPACING*2*Math.random();
            particle.setScale(0.5 + Math.random()*0.3);
            particle.setOpacity(255);
            particle.setRotation(0);
        }
    },

    /**
     * @public
     */
    play: function () {
        this.reset();
        this.visible = true;

        for(let i = 0 ; i < this._particles.length ; i++) {
            let particle = this._particles[i];
            particle.runAction(particle.action);
        }
    },

    /**
     * @public
     */
    destroy: function() {
        for(let i = 0 ; i < this._particles.length ; i++) {
            this._particles[i].cleanup();
            this._particles[i].action.release();
            this._particles[i].removeFromParent(true);
        }

        this._particles[i] = null;
    }
});

/*
 * @type {number}
 */
core.Burst.PARTICLE_SPACING = 25;