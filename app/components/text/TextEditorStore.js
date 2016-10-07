'use strict';

import { extendObservable } from 'mobx';
import Rx from 'rx-lite';

export default class TextEditorStore {
    constructor() {
        this._changes = new Rx.Subject();

        extendObservable(this, {
            record : null
        });
    }

    get changes() {
        return this._changes;
    }
}

module.exports = TextEditorStore;
