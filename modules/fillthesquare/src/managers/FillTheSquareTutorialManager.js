/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {core.TutorialManager}
 */
fts.FillTheSquareTutorialManager = core.TutorialManager.extend({

    /**
     * @constructs
     */
    ctor: function () {
        this._super();
    },

    /**
     * @param {fts.FillTheSquareDelegate} gameDelegate
     * @param {core.GameScene} gameScene
     * @param {fts.FillTheSquareGameManager} gameManager
     * @virtual
     */
    config: function (gameDelegate, gameScene, gameManager) {
        let title;
        let message;

        switch(this._currentStep) {
            case 0:
                title = "Let's Play!";
                message = "Drag the piece to form a full line.";

                gameManager.setCustomState(fts.FillTheSquareTutorialManager.STEP_0_GRID, fts.FillTheSquareTutorialManager.STEP_0_PIECE_PRESETS);
                gameScene.getHudLayer().setHudEnabled(false);
                gameScene.getGameLayer().setTutorialData(gameManager.availablePieces[0], 0, 3);
                break;

            case 1:
                title = "Perfect!";
                message = "Now let's get a combo by forming two lines at once!";

                gameManager.setCustomState(fts.FillTheSquareTutorialManager.STEP_1_GRID, fts.FillTheSquareTutorialManager.STEP_1_PIECE_PRESETS);
                gameScene.getHudLayer().setHudEnabled(false);
                gameScene.getGameLayer().setTutorialData(gameManager.availablePieces[0], 1, 2);
                break;

            case 2:
                title = "You got it!";
                message = "Now try to get the highest score you can!";

                gameManager.reset();
                gameScene.getHudLayer().setHudEnabled(true);
                gameScene.getGameLayer().clearTutorialData();
                gameDelegate.onGridChanged();
                break;
        }

        let alert = new core.ConfirmationWindow(gameScene.sceneNotifier);
        alert.build(
            title,
            message,
            core.MetadataSpriteFrames.EMOJI_HAPPY,
            "OK!"
        );

        alert.setCallbackEvents(core.GameViewEvent.Types.REQUESTED_RESUME);
        gameScene.getPopUpLayer().setTargetNode(alert, core.PopUpLayer.ContentPosition.CENTERED);
        gameScene.showPopUp();
    },


    /**
     * @return {boolean}
     */
    isComplete: function () {
        return this._currentStep >= fts.FillTheSquareTutorialManager.MAX_STEPS;
    },

    /**
     * @public
     */
    forceComplete: function () {
        this._currentStep = fts.FillTheSquareTutorialManager.MAX_STEPS;
    },
})

/**
 * @type {number}
 */
fts.FillTheSquareTutorialManager.MAX_STEPS = 3;

/**
 * @type {number[][]}
 */
fts.FillTheSquareTutorialManager.STEP_0_GRID = [
    [2, 2, 2, 0, 0, 0, 4, 4],
    [7, 7, -1, -1, 6, 6, 6, 6],
    [7, 7, -1, -1, 6, 6, 6, 6],
    [2, -1, -1, -1, -1, -1, -1, -1],
    [2, -1, -1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, 8, 8],
    [-1, -1, -1, -1, -1, -1, 8, 8]
];

/**
 * @type {number[]}
 */
fts.FillTheSquareTutorialManager.STEP_0_PIECE_PRESETS = [2, 19, 13];

/**
 * @type {number[][]}
 */
fts.FillTheSquareTutorialManager.STEP_1_GRID = [
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [7, 7, 0, 0, 6, 6, 6, 6],
    [7, 7, 0, 0, 6, 6, 6, 6],
    [2, -1, -1, -1, -1, -1, -1, -1],
    [2, -1, -1, -1, -1, -1, -1, -1],
    [1, 1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, 8, 8],
    [-1, -1, -1, -1, -1, -1, 8, 8]
];

/**
 * @type {number[]}
 */
fts.FillTheSquareTutorialManager.STEP_1_PIECE_PRESETS = [4, 8, 13];