'use strict';

import theme from '../config/theme.light.json';

export default class Theme {
    /** @returns {String} */
    get primaryColor() {
        return theme.primaryColor;
    }

    /** @returns {String} */
    get secondaryColor() {
        return theme.secondaryColor;
    }

    /** @returns {String} */
    get tertiaryColor() {
        return theme.tertiaryColor;
    }

    /** @returns {String} */
    get disabledColor() {
        return theme.disabledColor;
    }

    /** @returns {String} */
    get primaryTextColor() {
        return theme.primaryTextColor;
    }

    /** @returns {String} */
    get secondaryTextColor() {
        return theme.secondaryTextColor;
    }

    /** @returns {String} */
    get tertiaryTextColor() {
        return theme.tertiaryTextColor;
    }

    /** @returns {String} */
    get disabledTextColor() {
        return theme.disabledTextColor;
    }

    /** @returns {String} */
    get windowBackground() {
        return theme.windowBackground;
    }

    /** @returns {String} */
    get primaryBackgroundColor() {
        return theme.primaryBackgroundColor;
    }

    /** @returns {String} */
    get secondaryBackgroundColor() {
        return theme.secondaryBackgroundColor;
    }

    /** @return {String} */
    get selectedBackgroundColor() {
        return theme.selectedBackgroundColor;
    }

    /** @returns {String} */
    get disabledBackgroundColor() {
        return theme.disabledBackgroundColor;
    }
}

module.exports = Theme;
