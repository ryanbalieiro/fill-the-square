/**
 * Created by Ryan Balieiro on 27/08/20.
 * @class
 * @extends {cc.Class}
 */
core.NativeViewport = cc.Class.extend({

    /** @type {Boolean} **/
    _isShowingFullScreenLoader: false,

    /**
     * @constructs
     */
    ctor: function () {
        this._isShowingFullScreenLoader = !cc.sys.isNative;
    },

    /**
     * @public
     */
    showFullScreenLoader: function () {
        if(this._isShowingFullScreenLoader)
            return;

        if(!cc.sys.isNative) {
            let preloader = document.querySelector('#fullscreen-preloader');
            preloader.classList.remove('transition-hiding');
            preloader.classList.remove('transition-hidden');
        }

        this._isShowingFullScreenLoader = true;
    },

    /**
     * @public
     */
    hideFullScreenLoader: function () {
        if(!this._isShowingFullScreenLoader)
            return;

        if(!cc.sys.isNative) {
            let preloader = document.querySelector('#fullscreen-preloader');
            preloader.classList.add('transition-hiding');
            setTimeout(function () {
                preloader.classList.add('transition-hidden')
            }, 600);
        }

        this._isShowingFullScreenLoader = false;
    }
});

/**
 * @type {core.NativeViewport}
 */
core.api.nativeViewport = new core.NativeViewport();