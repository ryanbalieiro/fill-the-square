/**
 * @namespace
 */
core = {};

/**
 * @namespace
 */
core.api = {};

/**
 * Engine Initializer
 * Game entry point.
 */
cc.game.onStart = function () {
    let sys = cc.sys;

    if (sys.isMobile &&
        sys.browserType !== sys.BROWSER_TYPE_BAIDU &&
        sys.browserType !== sys.BROWSER_TYPE_WECHAT) {
        cc.view.enableAutoFullScreen(true);
    }

    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(2048, 1532, cc.ResolutionPolicy.FIXED_HEIGHT);
    cc.view.resizeWithBrowserSize(true);

    cc.loader.loadJs(cc.game.config['coreRootPath'], "src/loaders/ClassLoader.js", function (err, data) {
        let classLoader = new core.ClassLoader();
        classLoader.loadAllClasses(function () {
            let namespace = eval(cc.game.config['namespace']);
            let delegateClass = cc.game.config['delegateClass'];
            delegate = new namespace[delegateClass]();
            delegate.init();
        });
    });
}

cc.game.run();