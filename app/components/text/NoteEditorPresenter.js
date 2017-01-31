// @flow
'use strict';

import NoteEditorStore from './NoteEditorStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import EventUtils from '../../utils/EventUtils';

export default class NoteEditorPresenter {
    _database : Database;
    _store    : NoteEditorStore;

    /**
     * Creates a new instance of NoteEditorPresenter.
     * @param {Database} database
     */
    constructor(database : Database) {
        this._database = database;
        this._store    = new NoteEditorStore();
    }

    get store() : NoteEditorStore {
        return this._store;
    }

    /**
     * @param {String|undefined} [recordId]
     * @return {Promise}
     */
    load(recordId : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            if (recordId) {
                this._database.findById(recordId)
                    .then(doc => {
                        this._store.record = Record.fromDoc(doc);

                        EventUtils.broadcast('NoteEditor.refresh');

                        resolve();
                    }).catch(error => reject(error));
            } else {
                this._store.record = undefined;

                EventUtils.broadcast('NoteEditor.refresh');

                resolve();
            }
        });
    }
}
