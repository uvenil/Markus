'use strict';

import ListStore from './ListStore';
import Database from '../../data/Database';

export default class ListPresenter {
    /**
     * Creates a new instance of FilterListPresenter.
     * @param {Database} database
     */
    constructor(database) {
        this.database = database;

        this.initStore();
    }

    /**
     * @returns {number}
     */
    get selectedItemCount() {
        const selectedItem = this.store.selectedItem;

        if (selectedItem) {
            return parseInt(selectedItem.secondaryText);
        }

        return 0;
    }

    refresh() {
    }

    notifyDataSetChanged() {
    }

    initStore() {
        this.store = new ListStore();
    }
}

module.exports = ListPresenter;