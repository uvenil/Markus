'use strict';

import { extendObservable } from 'mobx';
import ToggleStore from './components/toggles/ToggleStore';
import Config from '../config.json';

export default class SettingsStore {
    constructor() {
        extendObservable(this, {
            highlightCurrentLine : new ToggleStore(Config.defaultHighlightActiveLine),
            showLineNumbers      : new ToggleStore(Config.defaultShowLineNumbers),
            tabSize2             : new ToggleStore(Config.defaultTabSize === 2),
            tabSize4             : new ToggleStore(Config.defaultTabSize === 4),
            tabSize8             : new ToggleStore(Config.defaultTabSize === 8),
            useSoftTabs          : new ToggleStore(Config.defaultUseSoftTabs),
            wordWrap             : new ToggleStore(Config.defaultWordWrap),
            showPrintMargin      : new ToggleStore(Config.defaultShowPrintMargin),
            printMarginColumn72  : new ToggleStore(Config.defaultPrintMarginColumn === 72),
            printMarginColumn80  : new ToggleStore(Config.defaultPrintMarginColumn === 80),
            printMarginColumn100 : new ToggleStore(Config.defaultPrintMarginColumn === 100),
            printMarginColumn120 : new ToggleStore(Config.defaultPrintMarginColumn === 120),
            showInvisibles       : new ToggleStore(Config.defaultShowInvisibles),
            showFoldWidgets      : new ToggleStore(Config.defaultShowFoldWidgets),
            showGutter           : new ToggleStore(Config.defaultShowGutter),
            showIndentGuides     : new ToggleStore(Config.defaultDisplayIndentGuides),
            scrollPastLastLine   : new ToggleStore(Config.defaultScrollPastEnd)
        });
    }
}

module.exports = SettingsStore;
