// @flow
'use strict';

import ListStore from './ListStore';
import Database from '../../data/Database';

export default class ListPresenter {
    database : Database;
    store    : ListStore;

    /**
     * Creates a new instance of FilterListPresenter.
     * @param {Database} database
     */
    constructor(database : Database) {
        this.database = database;

        this.initStore();
    }

    /**
     * @returns {number}
     */
    get selectedItemCount() : number {
        const selectedItem = this.store.selectedItem;

        if (selectedItem) return parseInt(selectedItem.secondaryText);

        return 0;
    }

    refresh() : void {
    }

    notifyDataSetChanged() : void {
    }

    initStore() : void {
        this.store = new ListStore();
    }
}
