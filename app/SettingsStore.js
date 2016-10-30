'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from './components/BooleanStore';
import Config from '../config.json';

export default class SettingsStore {
    constructor() {
        extendObservable(this, {
            highlightCurrentLine : new BooleanStore(Config.defaultHighlightActiveLine),
            showLineNumbers      : new BooleanStore(Config.defaultShowLineNumbers),
            tabSize2             : new BooleanStore(Config.defaultTabSize === 2),
            tabSize4             : new BooleanStore(Config.defaultTabSize === 4),
            tabSize8             : new BooleanStore(Config.defaultTabSize === 8),
            useSoftTabs          : new BooleanStore(Config.defaultUseSoftTabs),
            wordWrap             : new BooleanStore(Config.defaultWordWrap),
            showPrintMargin      : new BooleanStore(Config.defaultShowPrintMargin),
            printMarginColumn72  : new BooleanStore(Config.defaultPrintMarginColumn === 72),
            printMarginColumn80  : new BooleanStore(Config.defaultPrintMarginColumn === 80),
            printMarginColumn100 : new BooleanStore(Config.defaultPrintMarginColumn === 100),
            printMarginColumn120 : new BooleanStore(Config.defaultPrintMarginColumn === 120),
            showInvisibles       : new BooleanStore(Config.defaultShowInvisibles),
            showFoldWidgets      : new BooleanStore(Config.defaultShowFoldWidgets),
            showGutter           : new BooleanStore(Config.defaultShowGutter),
            showIndentGuides     : new BooleanStore(Config.defaultDisplayIndentGuides),
            scrollPastLastLine   : new BooleanStore(Config.defaultScrollPastEnd)
        });
    }
}

module.exports = SettingsStore;
