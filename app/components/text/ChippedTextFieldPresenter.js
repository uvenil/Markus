// @flow
'use strict';

import ChippedTextFieldStore from './ChippedTextFieldStore';

export default class ChippedTextFieldPresenter {
    _store : ChippedTextFieldStore;

    constructor() {
        this._store = new ChippedTextFieldStore();
    }

    get store() : ChippedTextFieldStore {
        return this._store;
    }
}
