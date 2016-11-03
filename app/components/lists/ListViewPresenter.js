'use strict';

import ListViewStore from './ListViewStore';
import Database from '../../data/Database';

export default class ListViewPresenter {
    /**
     * Creates a new instance of FilterListViewPresenter.
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
        this.store = new ListViewStore();
    }
}

module.exports = ListViewPresenter;
