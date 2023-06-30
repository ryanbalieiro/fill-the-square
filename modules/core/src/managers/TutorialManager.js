/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {cc.Class}
 */
core.TutorialManager = cc.Class.extend({

    /** @type {Number} **/
    _currentStep: null,

    /** @type {Boolean} **/
    _didAdvanceOnCurrentSection: false,

    /** @type {core.Notifier} **/
    notifier:null,

    /**
     * @constructs
     */
    ctor: function () {
        this.notifier = new core.Notifier();
    },

    /**
     * @public
     * @param {Boolean} ignorePersistence
     */
    init: function (ignorePersistence) {
        let preferences = JSON.parse(cc.sys.localStorage.getItem(core.TutorialManager.LOCAL_STORAGE_KEY));

        if(preferences && !ignorePersistence) {
            this._currentStep = preferences.currentStep || 0;
        }
        else {
            this._currentStep = 0;
        }
    },


    /**
     * @param {core.GameDelegate|*} gameDelegate
     * @param {core.GameScene|*} gameScene
     * @param {core.GameManager|*} gameManager
     * @virtual
     */
    config: function (gameDelegate, gameScene, gameManager) {},

    /**
     * @public
     */
    advance: function () {
        if(this.isComplete())
            return;
        
        this._currentStep++;
        this._didAdvanceOnCurrentSection = true;
        this.notifier.dispatch(core.TutorialManager.Events.COMPLETED_STEP);
        this._savePreferences();
    },

    /**
     * @return {boolean}
     */
    isComplete: function () {
        return true;
    },

    /**
     * @return {boolean}
     */
    hasBeenCompletedBefore: function () {
        return this.isComplete() && !this._didAdvanceOnCurrentSection;
    },

    /**
     * @public
     */
    forceComplete: function () {

    },

    /**
     * @private
     */
    _savePreferences: function () {
        let preferences = {
            currentStep: this._currentStep
        };

        cc.sys.localStorage.setItem(core.TutorialManager.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    }
})

/**
 * @type {string}
 */
core.TutorialManager.LOCAL_STORAGE_KEY = "core.tutorial.progress";

/**
 * @enum {String}
 */
core.TutorialManager.Events = {
    COMPLETED_STEP: "eventTutorialManagerCompletedStep"
}