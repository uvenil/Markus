// @flow
'use strict';

import { extendObservable } from 'mobx';
import Record from '../../data/Record';
import Rx from 'rx-lite';
import Config from '../../definitions/config.json';

export default class TextEditorStore {
    _changes            : any;
    highlightActiveLine : boolean;
    tabSize             : number;
    useSoftTabs         : boolean;
    wordWrap            : boolean;
    showLineNumbers     : boolean;
    showPrintMargin     : boolean;
    printMarginColumn   : number;
    showInvisibles      : boolean;
    showFoldWidgets     : boolean;
    showGutter          : boolean;
    displayIndentGuides : boolean;
    scrollPastEnd       : boolean;
    record              : ?Record;
    syntax              : string;
    theme               : string;
    fontFamily          : ?string;
    textSize            : any;
    cursorPosition      : string;
    isOverwriteEnabled  : boolean;

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
            record             : undefined,
            syntax             : Config.defaultSyntax,
            theme              : Config.defaultTheme,
            fontFamily         : undefined,
            textSize           : undefined,
            cursorPosition     : undefined,
            isOverwriteEnabled : false
        });
    }

    get changes() : any {
        return this._changes;
    }
}
