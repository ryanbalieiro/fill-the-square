/**
 * Created by Ryan Balieiro on 03/09/20.
 * @class
 * @extends {core.InteractiveNode}
 */
core.ActionHud = core.InteractiveNode.extend({
    /** @type {core.LongButton} **/
    _actionButton: null,

    /**
     * @constructs
     * @param {core.Notifier} sceneNotifier
     */
    ctor: function (sceneNotifier) {
        this._super(sceneNotifier);
    },

    /**
     * @param {core.LongButton} longButton
     */
    setActionButton: function (longButton) {
        this._actionButton = longButton;
        this.addChild(this._actionButton);
        this._actionButton.setPosition(168, -88);
        this._actionButton.setScale(0.9);
        this.buttons.push(this._actionButton);
    },

    /**
     * @override
     * @param {core.Button} button
     */
    onButtonPressed: function (button) {
        this.sceneNotifier.dispatch(core.GameViewEvent.Types.PRESSED_ACTION_HUD_BUTTON);
        button.setStatus(core.Button.Status.IDLE);
    },
})