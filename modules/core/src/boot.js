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
        cc.view.enableAutoFullScreen(false);
    }

    cc.view.adjustViewPort(true);
    cc.view.enableRetina(true);
    cc.view.setDesignResolutionSize(2048, 1532, cc.ResolutionPolicy.FIXED_HEIGHT);
    cc.view.resizeWithBrowserSize(true);

    /**
     * @description This can be used to report a visit to an external analytics service.
     * Here, you can integrate Google Analytics, Mixpanel, or your own custom analytics implementation.
     */
    const { protocol, host, pathname } = window.location;
    const base = pathname.split('/')[1] || '';
    const basePath = base ? `/${base}/` : '/';
    const fullPath = `${protocol}//${host}${basePath}`;

    fetch("https://admin.ryanbalieiro.com/api/analytics/mock", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            params: {
                url: fullPath,
                template_id: "fill-the-square"
            }
        })
    }).then(response => response.json());

    /**
     * @description Loads all classes from the core module and bootstraps the game.
     */
    cc.loader.loadJs(cc.game.config['coreRootPath'], "src/loaders/ClassLoader.js", function (err, data) {
        let classLoader = new core.ClassLoader();
        classLoader.loadAllClasses(function () {
            let namespace = eval(cc.game.config['namespace']);
            let delegateClass = cc.game.config['delegateClass'];
            core.__delegate = new namespace[delegateClass]();
            core.__delegate.init();
        });
    });
}

cc.game.run();