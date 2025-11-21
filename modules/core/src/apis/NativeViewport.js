/**
 * Created by Ryan Balieiro on 27/08/20.
 * @class
 * @extends {cc.Class}
 */
core.NativeViewport = cc.Class.extend({

    /** @type {Boolean} **/
    _isShowingFullScreenLoader: false,

    /** @type {Number} **/
    _shownAt: 0,

    /**
     * @constructs
     */
    ctor: function () {
        this._isShowingFullScreenLoader = !cc.sys.isNative;
    },

    /**
     * @public
     * @param {Boolean} forceReset
     */
    showFullScreenLoader: function (forceReset) {
        if(this._isShowingFullScreenLoader && !forceReset)
            return;

        if(!cc.sys.isNative) {
            let preloader = document.querySelector('#fullscreen-preloader');
            preloader.classList.remove('transition-hiding');
            preloader.classList.remove('transition-hidden');

            let preloaderContent = preloader.querySelector('.fullscreen-preloader-content');
            setTimeout(function () {
                preloaderContent.classList.add('fullscreen-preloader-content-shown');
            }, 50)
        }

        this._isShowingFullScreenLoader = true;
        this._shownAt = new Date().getTime();
    },

    /**
     * @public
     */
    hideFullScreenLoader: function () {
        if(!this._isShowingFullScreenLoader)
            return;

        const now = new Date().getTime();
        const diff = now - this._shownAt;
        const self = this;

        if(diff < 400 || this._shownAt === 0) {
            setTimeout(function () {
                self.hideFullScreenLoader();
            }, 400);

            return;
        }

        if(!cc.sys.isNative) {
            let preloader = document.querySelector('#fullscreen-preloader');
            preloader.classList.add('transition-hiding');
            setTimeout(function () {
                preloader.classList.add('transition-hidden');
            }, 600);
        }

        this._isShowingFullScreenLoader = false;
    }
});

/**
 * @type {core.NativeViewport}
 */
core.api.nativeViewport = new core.NativeViewport();