'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';
import Constants from '../../utils/Constants';
import Config from '../../../config.json';

export default class SettingsStore {
    constructor() {
        extendObservable(this, {
            highlightCurrentLine : new BooleanStore(Config.defaultHighlightActiveLine),
            showLineNumbers      : new BooleanStore(Config.defaultShowLineNumbers),
            tabSize2             : new BooleanStore(Config.defaultTabSize === Constants.TAB_SIZES[0]),
            tabSize4             : new BooleanStore(Config.defaultTabSize === Constants.TAB_SIZES[1]),
            tabSize8             : new BooleanStore(Config.defaultTabSize === Constants.TAB_SIZES[2]),
            useSoftTabs          : new BooleanStore(Config.defaultUseSoftTabs),
            wordWrap             : new BooleanStore(Config.defaultWordWrap),
            showPrintMargin      : new BooleanStore(Config.defaultShowPrintMargin),
            printMarginColumn72  : new BooleanStore(Config.defaultPrintMarginColumn === Constants.PRINT_MARGIN_COLUMNS[0]),
            printMarginColumn80  : new BooleanStore(Config.defaultPrintMarginColumn === Constants.PRINT_MARGIN_COLUMNS[1]),
            printMarginColumn100 : new BooleanStore(Config.defaultPrintMarginColumn === Constants.PRINT_MARGIN_COLUMNS[2]),
            printMarginColumn120 : new BooleanStore(Config.defaultPrintMarginColumn === Constants.PRINT_MARGIN_COLUMNS[3]),
            showInvisibles       : new BooleanStore(Config.defaultShowInvisibles),
            showFoldWidgets      : new BooleanStore(Config.defaultShowFoldWidgets),
            showGutter           : new BooleanStore(Config.defaultShowGutter),
            showIndentGuides     : new BooleanStore(Config.defaultDisplayIndentGuides),
            scrollPastLastLine   : new BooleanStore(Config.defaultScrollPastEnd)
        });
    }
}

module.exports = SettingsStore;
