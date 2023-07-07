/**
 * Created by Ryan Balieiro on 23/08/20.
 * @class
 * @extends {cc.Class}
 */
core.GameViewEvent = cc.Class.extend({})

/** @enum **/
core.GameViewEvent.Types = {
    FIRST_TOUCH_PERFORMED: "gameSceneEventFirstTouchPerformed",

    PLAY_EFFECT: "gameSceneEventPlayEffect",
    PLAY_SCORE_EFFECT: "gameSceneEventPlayScoreEffect",
    RESUME_BGM: "resumeBgm",
    STOP_BGM: "stopBgm",

    BOUGHT_ITEM: "gameSceneEventBoughtItem",
    PICKED_ITEM_FOR_DRAGGING: "gameSceneEventPickedItemForDragging",
    SELECTED_ITEM: "gameSceneEventSelectedItem",
    USED_ITEM: "gameSceneEventUsedItem",

    CLICKED_ON_DEVELOPER_SITE_LINK: "gameSceneEventOpenedDeveloperSite",
    CLICKED_ON_PRIVACY_POLICY: "gameSceneEventOpenedPrivacyPolicy",
    CLICKED_ON_SHARE_GAME: "gameSceneEventShareGame",
    CLICKED_ON_SHARE_SCORE: "gameSceneEventShareScore",

    CONFIRMATION_ACCEPTED: "gameSceneEventConfirmationAccepted",
    CONFIRMATION_REJECTED: "gameSceneEventConfirmationRejected",
    PRESSED_ACTION_HUD_BUTTON: "gameSceneEventPressedActionHudButton",

    ANIMATE_FOR_EARNING_COINS: "gameSceneEventAnimateForEarningCoins",
    EARNED_COINS: "gameSceneEventEarnedCoins",
    FORCE_HIDE_FEEDBACKS: "gameSceneEventForceHideFeedbacks",

    OPENED_ITEM_SHOP: "gameSceneEventOpenedItemShop",
    OPENED_THEME_SHOP: "gameSceneEventOpenedThemeShop",
    OPENED_STATS: "gameSceneEventOpenedStats",
    OPENED_ACHIEVEMENTS: "gameSceneEventOpenedAchievements",

    REQUESTED_PAUSE: "gameSceneEventPausedGame",
    READY: "gameSceneEventReady",
    REQUESTED_START: "gameSceneEventStartedGame",
    REQUESTED_RESTART_CONFIRMATION: "gameSceneEventRequestedRestartConfirmation",
    REQUESTED_RESTART: "gameSceneEventRestartedGame",
    REQUESTED_RESUME: "gameSceneEventResumedGame",
    GAME_OVER: "gameSceneEventGameOver",
    GAME_OVER_ANIMATION_COMPLETE: "gameSceneEventGameOverAnimationComplete",

    TOGGLED_MUSIC_ENABLED: "gameSceneEventToggledMusicEnabled",
    TOGGLED_SFX_ENABLED: "gameSceneEventToggledSfxEnabled",

    EXPANDED_ITEM_BAG: "gameSceneEventExpandedItemBag",
    SHRANK_ITEM_BAG: "gameSceneEventShrankItemBag"
};