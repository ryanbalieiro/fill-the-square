/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ResourceLoader = cc.Class.extend({
    /** @type {core.Notifier} **/
    notifier:null,

    /**
     * @constructs
     */
    ctor: function () {
        this.notifier = new core.Notifier();
    },

    /**
     * @param {String} rootPath
     * @param {Object} plistEnum
     * @param {Object} pngEnum
     * @param {Object} fontEnum
     * @param {Object} soundsEnum
     */
    preload: function (rootPath, plistEnum, pngEnum, fontEnum, soundsEnum) {
        let notifier = this.notifier;

        let filePaths = [];
        let enums = [plistEnum, pngEnum, fontEnum, soundsEnum];

        for(let i in enums) {
            let _enum = enums[i];
            for(let path in _enum) {
                _enum[path] = rootPath + "/" + _enum[path];
                filePaths.push(_enum[path]);
            }
        }

        cc.loader.load(filePaths, function () {}, function () {
            for(let i in plistEnum) {
                cc.spriteFrameCache.addSpriteFrames(plistEnum[i]);
            }

            for(let i in soundsEnum) {
                if(soundsEnum[i].lastIndexOf("sfx") !== -1) {
                    cc.audioEngine.preloadEffect(soundsEnum[i]);
                }
            }

            notifier.dispatch(core.ResourceLoader.Events.LOADED);
        });
    }
})

/** @enum **/
core.ResourceLoader.Events = {
    LOADED: "resourceManagerLoadedResources"
}


