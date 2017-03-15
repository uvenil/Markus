// @flow
'use strict';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import EnvironmentUtils from './utils/EnvironmentUtils';

const FONT_SIZE               : number = 13;
const FONT_SIZE_SMALL         : number = 11;
const FONT_SIZE_MONOSPACED    : number = 13;
const FONT_SIZE_ICON          : number = 14;
const FONT_SIZE_BUTTON_DIALOG : number = 15;
const FONT_SIZE_TEXT_DIALOG   : number = 15;
const FONT_SIZE_HEADER        : number = 15;
const FONT_SIZE_SUB_HEADER    : number = 13;

const PADDING_X0 : number = 4;
const PADDING_X1 : number = 8;
const PADDING_X2 : number = 16;
const PADDING_X3 : number = 24;

const WINDOW_MIN_WIDTH  : number = 960;
const WINDOW_MIN_HEIGHT : number = 640;

const MASTER_LIST_MIN_WIDTH    : number = 200;
const DETAIL_LIST_MIN_WIDTH    : number = 280;
const TITLE_BAR_CONTROL_HEIGHT : number = 24;
const TOP_BAR_HEIGHT           : number = 38;
const DRAWER_WIDTH             : number = 200;
const BOTTOM_BAR_HEIGHT        : number = 28;
const BUTTON_MIN_WIDTH         : number = 96;
const BUTTON_HEIGHT_X0         : number = 28;
const BUTTON_HEIGHT_X1         : number = 36;
const BUTTON_HEIGHT_X2         : number = 48;
const HASHTAG_TEXTBOX_WIDTH    : number = 120;

const EDITOR_LINE_HEIGHT : string = '16px';

const ZOOM_FACTOR_STEP : number = 0.1;

const MESSAGE_DURATION             : number = 4000;
const DETAIL_LIST_REFRESH_INTERVAL : number = 10 * 1000;

const SORTINGS : Object[] = [
    { title         :  1 },
    { title         : -1 },
    { lastUpdatedAt :  1 },
    { lastUpdatedAt : -1 },
    { createdAt     :  1 },
    { createdAt     : -1 }
];

const SORTING_DEFAULT = SORTINGS[3];

const PRINT_MARGIN_COLUMNS_72  = 72;
const PRINT_MARGIN_COLUMNS_80  = 80;
const PRINT_MARGIN_COLUMNS_100 = 100;
const PRINT_MARGIN_COLUMNS_120 = 120;

const TAB_SIZES            = [ 2, 4, 8 ];
const PRINT_MARGIN_COLUMNS = [ PRINT_MARGIN_COLUMNS_72, PRINT_MARGIN_COLUMNS_80, PRINT_MARGIN_COLUMNS_100, PRINT_MARGIN_COLUMNS_120 ];

const FONTS : Object = EnvironmentUtils.isMacOS() ? require('./definitions/fonts/fonts.mac.json') : require('./definitions/fonts/fonts.win.json');

const DARK_THEMES : string[] = [
    'ambiance',
    'chaos',
    'clouds_midnight',
    'cobalt',
    'idle_fingers',
    'kr_theme',
    'merbivore',
    'merbivore_soft',
    'mono_industrial',
    'monokai',
    'pastel_on_dark',
    'solarized_dark',
    'terminal',
    'tomorrow_night',
    'tomorrow_night_blue',
    'tomorrow_night_bright',
    'tomorrow_night_eighties',
    'twilight',
    'vibrant_ink'
];

const LIGHT_THEME : Object = require('./definitions/themes/theme.light.json');
const DARK_THEME  : Object = require('./definitions/themes/theme.dark.json');

const MUI_LIGHT_THEME : Object = getMuiTheme({
    palette   : {
        primary1Color      : LIGHT_THEME.primaryColor,
        primary2Color      : LIGHT_THEME.secondaryBackgroundColor,
        primary3Color      : LIGHT_THEME.disabledBackgroundColor,
        accent1Color       : LIGHT_THEME.accentColor,
        accent2Color       : LIGHT_THEME.selectedBackgroundColor,
        textColor          : LIGHT_THEME.primaryTextColor,
        secondaryTextColor : LIGHT_THEME.secondaryTextColor,
        alternateTextColor : LIGHT_THEME.invertedTextColor,
        canvasColor        : LIGHT_THEME.primaryBackgroundColor,
        borderColor        : LIGHT_THEME.borderColor,
        disabledColor      : LIGHT_THEME.disabledTextColor
    },
    userAgent : 'all'
});

const MUI_DARK_THEME : Object = getMuiTheme({
    palette   : {
        primary1Color      : DARK_THEME.primaryColor,
        primary2Color      : DARK_THEME.secondaryBackgroundColor,
        primary3Color      : DARK_THEME.disabledBackgroundColor,
        accent1Color       : DARK_THEME.accentColor,
        accent2Color       : DARK_THEME.selectedBackgroundColor,
        textColor          : DARK_THEME.primaryTextColor,
        secondaryTextColor : DARK_THEME.secondaryTextColor,
        alternateTextColor : DARK_THEME.invertedTextColor,
        canvasColor        : DARK_THEME.primaryBackgroundColor,
        borderColor        : DARK_THEME.borderColor,
        disabledColor      : DARK_THEME.disabledTextColor
    },
    userAgent : 'all'
});

module.exports = {
    FONT_SIZE,
    FONT_SIZE_SMALL,
    FONT_SIZE_MONOSPACED,
    FONT_SIZE_ICON,
    FONT_SIZE_BUTTON_DIALOG,
    FONT_SIZE_TEXT_DIALOG,
    FONT_SIZE_HEADER,
    FONT_SIZE_SUB_HEADER,
    PADDING_X0,
    PADDING_X1,
    PADDING_X2,
    PADDING_X3,
    WINDOW_MIN_WIDTH,
    WINDOW_MIN_HEIGHT,
    MASTER_LIST_MIN_WIDTH,
    DETAIL_LIST_MIN_WIDTH,
    TITLE_BAR_CONTROL_HEIGHT,
    TOP_BAR_HEIGHT,
    DRAWER_WIDTH,
    BOTTOM_BAR_HEIGHT,
    BUTTON_MIN_WIDTH,
    BUTTON_HEIGHT_X0,
    BUTTON_HEIGHT_X1,
    BUTTON_HEIGHT_X2,
    HASHTAG_TEXTBOX_WIDTH,
    EDITOR_LINE_HEIGHT,
    ZOOM_FACTOR_STEP,
    MESSAGE_DURATION,
    DETAIL_LIST_REFRESH_INTERVAL,
    SORTINGS,
    SORTING_DEFAULT,
    TAB_SIZES,
    PRINT_MARGIN_COLUMNS,
    FONTS,
    DARK_THEMES,
    MUI_LIGHT_THEME,
    MUI_DARK_THEME
};
