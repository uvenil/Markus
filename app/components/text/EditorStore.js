// @flow
'use strict';

import { extendObservable } from 'mobx';
import Record from '../../data/Record';
import Config from '../../definitions/config.json';
import Rx from 'rx-lite';

export default class EditorStore {
    _changes            : Rx.Subject;
    editorShown         : boolean;
    previewShown        : boolean;
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
    scrollPastEnd       : boolean;
    record              : ?Record;
    theme               : string;
    fontFamily          : ?string;
    textSize            : number|string;
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
        this.scrollPastEnd       = Config.defaultScrollPastEnd;

        extendObservable(this, {
            editorShown        : true,
            previewShown       : true,
            record             : undefined,
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
