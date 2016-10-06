'use strict';

import EditorStore from './EditorStore';
import Database from '../../data/Database';
import Record from '../../data/Record';

export default class TextEditorPresenter {
    /**
     * Creates a new instance of TextEditorPresenter.
     * @param {Database} database
     */
    constructor(database) {
        this._database = database;

        this._store = new EditorStore();
    }

    /**
     * @param {String|undefined} recordId
     */
    load(recordId) {
        if (recordId) {
            this._database.findById(recordId)
                .then(record => {
                    this._store.record = record;
                }).catch(error => console.error(error));
        } else {
            this._store.record = undefined;
        }
    }
}

module.exports = TextEditorPresenter;
