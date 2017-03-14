// @flow
'use strict';

import EditorStore from './EditorStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import EventUtils from '../../utils/EventUtils';

export default class EditorPresenter {
    _database : Database;
    _store    : EditorStore;

    constructor(database : Database) {
        this._database = database;
        this._store    = new EditorStore();
    }

    get store() : EditorStore {
        return this._store;
    }

    load(recordId : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            if (recordId) {
                this._database.findById(recordId).then((doc : Object) => {
                    this._store.record = Record.fromDoc(doc);

                    EventUtils.broadcast('editor.refresh');

                    resolve();
                }).catch(error => reject(error));
            } else {
                this._store.record = undefined;

                EventUtils.broadcast('editor.refresh');

                resolve();
            }
        });
    }
}
