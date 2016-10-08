'use strict';

import { extendObservable } from 'mobx';
import Rx from 'rx-lite';
import Config from '../../../config.json';

export default class TextEditorStore {
    constructor() {
        this._changes = new Rx.Subject();

        extendObservable(this, {
            record : null,
            syntax : Config.defaultSyntax,
            theme  : Config.defaultTheme
        });
    }

    get changes() {
        return this._changes;
    }
}

module.exports = TextEditorStore;
