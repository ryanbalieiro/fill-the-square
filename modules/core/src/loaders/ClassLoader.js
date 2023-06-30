/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ClassLoader = cc.Class.extend({

    /** @type {Function} **/
    _completionCb: null,

    /**
     * @public
     * @param {Function} completionCb
     */
    loadAllClasses: function (completionCb) {
        this._completionCb = completionCb;
        this._loadCore();
    },

    /**
     * @private
     */
    _loadCore: function () {
        let self = this;
        cc.loader.loadJson(cc.game.config['coreRootPath'] + "/src/classes.json", function (err, fileList) {
            if(err) {
                throw new Error("Couldn't load class list!");
            }

            cc.loader.loadJs(cc.game.config['coreRootPath'], fileList, function () {
                self._loadGame();
            })
        });
    },

    /**
     * @private
     */
    _loadGame: function () {
        let self = this;
        cc.loader.loadJson(cc.game.config['gameRootPath'] + "/src/classes.json", function (err, fileList) {
            if(err) {
                throw new Error("Couldn't load game files!");
            }

            cc.loader.loadJs(cc.game.config['gameRootPath'], fileList, function () {
                self._onAllClassesLoaded();
            })
        });
    },

    /**
     * @private
     */
    _onAllClassesLoaded: function () {
        this._completionCb();
    }
})