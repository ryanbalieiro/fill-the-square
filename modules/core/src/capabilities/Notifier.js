/**
 * Created by Ryan Balieiro on 20/08/20.
 * @class
 * @extends {cc.Class}
 *
 * This object can be used to estabilish a subscriber-subscription communication type among objects in order to decouple dependencies.
 */
core.Notifier = cc.Class.extend({

    /** @type {Array} **/
    _subscriptions: null,

    /**
     * @constructs
     */
    ctor: function () {
        this._subscriptions = [];
    },

    /**
     * @param {*} subscriber
     * @param {Function} callback
     */
    addSubscription: function (subscriber, callback) {
        let index = this._getSubscriberIndex(subscriber);
        if(index !== -1)
            return;

        this._subscriptions.push({subscriber: subscriber, callback:callback});
    },

    /**
     * @param {*} subscriber
     */
    removeSubscription: function (subscriber) {
        let index = this._getSubscriberIndex(subscriber);
        if(index === -1)
            return;

        this._subscriptions.splice(index, 1);
    },

    /**
     * @public
     */
    removeAllSubscriptions: function () {
        this._subscriptions = [];
    },

    /**
     * @param {String|*} event
     * @param {*} [parameters]
     */
    dispatch: function (event, parameters) {
        for(let i = 0 ; i < this._subscriptions.length ; i++) {
            let subscriber = this._subscriptions[i].subscriber;
            let callback = this._subscriptions[i].callback;
            callback.apply(subscriber, [event, parameters]);
        }
    },

    /**
     * @param {Number} time
     * @param {String|*} event
     * @param {*} [parameters]
     */
    dispatchAfter: function (time, event, parameters) {
        let _this = this;
        if(this._timeout !== undefined)
            clearTimeout(this._timeout);

        this._timeout = setTimeout(function () {
            _this.dispatch(event, parameters);
        }, time*1000);
    },

    /**
     * @param {*} object
     * @returns {number}
     * @private
     */
    _getSubscriberIndex: function (object) {
        for(let i = 0 ; i < this._subscriptions.length ; i++) {
            if(this._subscriptions[i].subscriber === object) {
                return i;
            }
        }

        return -1;
    }
})
