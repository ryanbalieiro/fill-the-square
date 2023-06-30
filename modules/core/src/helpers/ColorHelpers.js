/**
 * Created by Ryan Balieiro on 31/08/20.
 * @class
 * @extends {cc.Class}
 */
core.ColorHelpers = cc.Class.extend({
    /** @type {core.ColorHelpers.Palettes} **/
    _colorPalette: null,

    ctor: function () {
        this.setPalette(core.ColorHelpers.Palettes.DARK);
    },

    /**
     * @param {cc.Color|cc.Color[]|String} color
     * @param {Boolean} [contrast=false]
     */
    get: function (color, contrast) {
        //colors with no variation
        if(this.isColor(color))
            return color;

        //static colors with two variations
        if(color.length === 2 && this.isColor(color[1]))
            return contrast ? color[1] : color[0];

        //colors that vary according the palette.
        return this.get(color[this._colorPalette]);
    },

    /**
     * @param {Object} object
     */
    isColor: function (object) {
        return object instanceof cc.Color || object.hasOwnProperty("r");
    },

    /**
     * @param {core.ColorHelpers.Palettes} palette
     */
    setPalette: function (palette) {
        this._colorPalette = palette;
    },

    /**
     * @returns {core.ColorHelpers.Palettes}
     */
    getPalette: function () {
        return this._colorPalette;
    },

    /**
     * @param {String} spriteFrameNamePattern
     * @returns {String}
     */
    getSpriteFrameBasedOnPalette: function (spriteFrameNamePattern) {
        return spriteFrameNamePattern.replace("${palette}", this._colorPalette);
    }
})

/**
 * @enum {String}
 */
core.ColorHelpers.Palettes = {
    DARK: "dark",
    PURPLE: "purple",
    BLUE: "blue"
}

/**
 * @type {Object}
 */
core.ColorHelpers.BACKGROUND = {
    "dark": [
        cc.color(25, 25, 25),
        cc.color(20, 20, 20)
    ],

    "purple": [
        cc.color(32*0.3, 0, 53*0.3),
        cc.color(32*0.2, 0, 53*0.2)
    ],

    "blue": [
        cc.color(0, 114*0.2, 190*0.2),
        cc.color(0, 114*0.1, 190*0.1)
    ]
};

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.PRIMARY = [
    cc.color(205, 205, 205),
    cc.color(195, 195, 195)
];

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.SECONDARY = [
    cc.color(125, 125, 125),
    cc.color(115, 115, 115)
];

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.INFO = [
    cc.color(90, 181, 226),
    cc.color(80, 160, 190)
];

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.SUCCESS = [
    cc.color(83, 167, 83),
    cc.color(73, 146, 73),
];

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.DANGER = [
    cc.color(204, 102, 102),
    cc.color(180, 90, 90),
];

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.GOLD = [
    cc.color(255, 200, 66),
    cc.color(255*0.8, 200*0.8, 66*0.8)
]

/**
 * @type {cc.Color[]}
 */
core.ColorHelpers.DARK_GOLD = [
    cc.color(255*0.8, 200*0.8, 66*0.8),
    cc.color(255*0.7, 200*0.7, 66*0.7)
]

/** @type {cc.Color} **/
core.ColorHelpers.BLACK = cc.color(0, 0, 0);

/** @type {cc.Color} **/
core.ColorHelpers.YELLOW = cc.color(255, 223, 66);

/** @type {cc.Color} **/
core.ColorHelpers.WHITE = cc.color(255, 255, 255);

/** @type {cc.Color} **/
core.ColorHelpers.GREY = cc.color(155, 155, 155);

/** @type {cc.Color} **/
core.ColorHelpers.RED = cc.color(255, 0, 0);

/**
 * @type {core.ColorHelpers}
 */
core.colorHelpers = new core.ColorHelpers();