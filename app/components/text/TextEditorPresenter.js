'use strict';

import TextEditorStore from './TextEditorStore';
import Database from '../../data/Database';
import Record from '../../data/Record';

export default class TextEditorPresenter {
    /**
     * Creates a new instance of TextEditorPresenter.
     * @param {Database} database
     */
    constructor(database) {
        this._database = database;

        this._store = new TextEditorStore();
    }

    get store() {
        return this._store;
    }

    /**
     * @param {String|undefined} recordId
     */
    load(recordId) {
        console.trace('Loads record ' + recordId);

        if (recordId) {
            this._database.findById(recordId)
                .then(doc => {
                    this._store.record = Record.fromDoc(doc);
                }).catch(error => console.error(error));
        } else {
            this._store.record = undefined;
        }
    }
}

module.exports = TextEditorPresenter;
