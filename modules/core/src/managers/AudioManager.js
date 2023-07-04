/**
 * Created by Ryan Balieiro on 22/08/20.
 * @class
 * @extends {cc.Class}
 */
core.AudioManager = cc.Class.extend({
    /** @type {core.Notifier} **/
    notifier:null,

    /** @type {Boolean} **/
    _audioContextActivated: false,

    /** @type {String[]} **/
    _effectsToPreload: null,

    /** @type {Boolean} **/
    _musicEnabled: true,

    /** @type {Boolean} **/
    _sfxEnabled: true,

    /** @type {String} **/
    _currentBgmUrl: null,

    /**
     * @constructs
     */
    ctor: function () {
        this.notifier = new core.Notifier();
        cc.audioEngine.setMusicVolume(0.2);
    },

    /**
     * @public
     * @param {Boolean} ignorePersistence
     */
    init: function (ignorePersistence) {
        let preferences = JSON.parse(cc.sys.localStorage.getItem(core.AudioManager.LOCAL_STORAGE_KEY));

        if(preferences && !ignorePersistence) {
            this._musicEnabled = preferences.musicEnabled;
            this._sfxEnabled = preferences.sfxEnabled;
        }
    },

    /**
     * @public
     */
    setAudioContextActivated: function () {
        this._audioContextActivated = true;
        this._updateBgmStatus();

        if(this._effectsToPreload) {
            for(let i = 0 ; i < this._effectsToPreload.length ; i++) {
                this.preloadEffect(this._effectsToPreload[i]);
            }
        }
    },

    /**
     * @param {Boolean} musicEnabled
     */
    setMusicEnabled: function (musicEnabled) {
        this._musicEnabled = musicEnabled;
        this._updateBgmStatus();

        this._savePreferences();
    },

    /**
     * @returns {Boolean}
     */
    getMusicEnabled: function () {
        return this._musicEnabled;
    },

    /**
     * @param {Boolean} sfxEnabled
     */
    setSfxEnabled: function (sfxEnabled) {
        this._sfxEnabled = sfxEnabled;
        if(!this._sfxEnabled) {
            cc.audioEngine.stopAllEffects();
        }

        this._savePreferences();
    },

    /**
     * @returns {Boolean}
     */
    getSfxEnabled: function () {
        return this._sfxEnabled;
    },

    /**
     * @public
     * @param {String|*} url
     */
    changeBgm: function (url) {
        if(this._currentBgmUrl === url)
            return;

        this._currentBgmUrl = url;
        this._updateBgmStatus();
    },

    /**
     * @public
     */
    stopBgm: function () {
        this._currentBgmUrl = null;
        this._updateBgmStatus();
    },

    /**
     * @param {String|*} url
     */
    preloadEffect: function (url) {
        if(this._audioContextActivated) {
            cc.audioEngine.preloadEffect(url);
        }
        else {
            this._effectsToPreload = this._effectsToPreload || [];
            this._effectsToPreload.push(url);
        }
    },

    /**
     * @public
     * @param {String|*} url
     */
    playEffect: function (url) {
        if(!this._sfxEnabled || !this._audioContextActivated)
            return;

        cc.audioEngine.playEffect(url, false);
    },

    /**
     * @param {Number} current
     * @param {Number} total
     */
    playScoreEffect: function (current, total) {
        if(total <= 1) {
            this.playEffect(core.Sounds.SFX_SCORE);
            return;
        }

        current = core.mathHelpers.clamp(current, 0, total);
        this.playEffect(core.Sounds["SFX_SCORE_SCALE_" + current]);
    },

    /**
     * @private
     */
    _updateBgmStatus: function () {
        if(this._musicEnabled && this._currentBgmUrl && this._audioContextActivated) {
            cc.audioEngine.playMusic(this._currentBgmUrl, true);
        }
        else {
            cc.audioEngine.stopMusic();
        }
    },

    /**
     * @private
     */
    _savePreferences: function () {
        let preferences = {
            musicEnabled: this._musicEnabled,
            sfxEnabled: this._sfxEnabled
        };

        cc.sys.localStorage.setItem(core.AudioManager.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
        this.notifier.dispatch(core.AudioManager.Events.PREFERENCES_CHANGED, preferences);
    }
})

/**
 * @type {string}
 */
core.AudioManager.LOCAL_STORAGE_KEY = "core.audio.prefs";

/**
 * @enum
 */
core.AudioManager.Events = {
    PREFERENCES_CHANGED: "eventAudioManagerPreferencesChanged"
}