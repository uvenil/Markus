'use strict';

import { extendObservable } from 'mobx';
import Rx from 'rx-lite';
import Config from '../../../config.json';

export default class TextEditorStore {
    constructor() {
        this._changes = new Rx.Subject();

        this.highlightActiveLine = Config.defaultHighlightActiveLine;
        this.tabSize             = Config.defaultTabSize;
        this.useSoftTabs         = Config.defaultUseSoftTabs;
        this.wordWrap            = Config.defaultWordWrap;
        this.showLineNumbers     = Config.defaultShowLineNumbers;
        this.showPrintMargin     = Config.defaultShowPrintMargin;
        this.printMarginColumn   = Config.defaultPrintMarginColumn;
        this.showInvisibles      = Config.defaultShowInvisibles;
        this.showFoldWidgets     = Config.defaultShowFoldWidgets;
        this.showGutter          = Config.defaultShowGutter;
        this.displayIndentGuides = Config.defaultDisplayIndentGuides;
        this.scrollPastEnd       = Config.defaultScrollPastEnd;

        extendObservable(this, {
            record     : null,
            syntax     : Config.defaultSyntax,
            theme      : Config.defaultTheme,
            fontFamily : undefined,
            textSize   : undefined
        });
    }

    get changes() {
        return this._changes;
    }
}

module.exports = TextEditorStore;
