'use strict';

import { extendObservable } from 'mobx';
import Rx from 'rx-lite';
import Config from '../../../config.json';

export default class TextEditorStore {
    constructor() {
        this._changes = new Rx.Subject();

        extendObservable(this, {
            record              : null,
            syntax              : Config.defaultSyntax,
            theme               : Config.defaultTheme,
            fontFamily          : undefined,
            textSize            : undefined,
            highlightActiveLine : Config.defaultHighlightActiveLine,
            tabSize             : Config.defaultTabSize,
            useSoftTabs         : Config.defaultUseSoftTabs,
            wordWrap            : Config.defaultWordWrap,
            showLineNumbers     : Config.defaultShowLineNumbers,
            showInvisibles      : Config.defaultShowInvisibles,
            showFoldWidgets     : Config.defaultShowFoldWidgets,
            showGutter          : Config.defaultShowGutter,
            displayIndentGuides : Config.defaultDisplayIndentGuides,
            scrollPastEnd       : Config.defaultScrollPastEnd,
            spellCheck          : Config.defaultSpellCheck
        });
    }

    get changes() {
        return this._changes;
    }
}

module.exports = TextEditorStore;
