// @flow
'use strict';

import ListStore from './ListStore';
import Database from '../../data/Database';

export default class MasterListPresenter {
    _database : Database;
    _store    : ListStore;

    constructor(database : Database, store : ListStore) {
        this._database = database;
        this._store    = store;
    }

    get store() : ListStore {
        return this._store;
    }

    get selectedItemCount() : number {
        const selectedItem = this._store.selectedItem;

        if (selectedItem) return parseInt(selectedItem.secondaryText);

        return 0;
    }

    refresh() : void {
    }

    notifyDataSetChanged() : void {
    }
}
