'use strict';

import TextEditorStore from './TextEditorStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

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
     * @return {Promise
     */
    load(recordId) {
        return new Promise((resolve, reject) => {
            if (recordId) {
                this._database.findById(recordId)
                    .then(doc => {
                        this._store.record = Record.fromDoc(doc);

                        PubSub.publish('TextEditor.refresh');

                        resolve();
                    }).catch(error => reject(error));
            } else {
                this._store.record = undefined;

                PubSub.publish('TextEditor.refresh');

                resolve();
            }
        });
    }
}

module.exports = TextEditorPresenter;
