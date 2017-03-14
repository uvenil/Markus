// @flow
'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';
import Constants from '../../Constants';
import Config from '../../definitions/config.json';

export default class EditorSettingsDialogStore extends BooleanStore {
    highlightCurrentLine : BooleanStore;
    showLineNumbers      : BooleanStore;
    tabSize2             : BooleanStore;
    tabSize4             : BooleanStore;
    tabSize8             : BooleanStore;
    useSoftTabs          : BooleanStore;
    wordWrap             : BooleanStore;
    showPrintMargin      : BooleanStore;
    printMarginColumn72  : BooleanStore;
    printMarginColumn80  : BooleanStore;
    printMarginColumn100 : BooleanStore;
    printMarginColumn120 : BooleanStore;
    showInvisibles       : BooleanStore;
    showFoldWidgets      : BooleanStore;
    showGutter           : BooleanStore;
    showIndentGuides     : BooleanStore;
    scrollPastLastLine   : BooleanStore;

    constructor() {
        super();

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
