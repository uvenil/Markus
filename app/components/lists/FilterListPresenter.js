'use strict';

import ListStore from './ListStore';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';

const FILTER_EVERYTHING_INDEX = 0;
const FILTER_STARRED_INDEX    = 1;
const FILTER_ARCHIVED_INDEX   = 2;

export default class FilterListPresenter {
    /**
     * Creates a new instance of FilterListPresenter.
     * @param {Database} database
     */
    constructor(database) {
        this._database = database;

        this._initFilterListStore();
        this._initCategoryListStore();
    }

    /**
     * @returns {ListStore}
     */
    get filterListStore() {
        return this._filterListStore;
    }

    /**
     * @returns {ListStore}
     */
    get categoryListStore() {
        return this._categoryListStore;
    }

    /**
     * @returns {number}
     */
    get selectedItemCount() {
        const selectedFilterListItem   = this._filterListStore.getSelectedItem();
        const selectedCategoryListItem = this._categoryListStore.getSelectedItem();

        if (selectedFilterListItem) {
            return parseInt(selectedFilterListItem.secondaryText);
        }

        if (selectedCategoryListItem) {
            return parseInt(selectedCategoryListItem.secondaryText);
        }

        return 0;
    }

    _initFilterListStore() {
        this._filterListStore = new ListStore();
        this._filterListStore.headerText = 'Notes';

        const everythingStore = new ListItemStore();
        everythingStore.itemId        = FilterListPresenter.FILTER_EVERYTHING_ID;
        everythingStore.primaryText   = 'Everything';
        everythingStore.secondaryText = '0';

        const starredStore = new ListItemStore();
        starredStore.itemId        = FilterListPresenter.FILTER_STARRED_ID;
        starredStore.primaryText   = 'Starred';
        starredStore.secondaryText = '0';

        const archivedStore = new ListItemStore();
        archivedStore.itemId        = FilterListPresenter.FILTER_ARCHIVED_ID;
        archivedStore.primaryText   = 'Archived';
        archivedStore.secondaryText = '0';

        this._filterListStore.items.push(everythingStore);
        this._filterListStore.items.push(starredStore);
        this._filterListStore.items.push(archivedStore);
    }

    _initCategoryListStore() {
        this._categoryListStore = new ListStore();
        this._categoryListStore.headerText = 'Categories';
    }

    refreshFilterList() {
        this._database.countAll()
            .then(count => this._filterListStore.items[FILTER_EVERYTHING_INDEX].secondaryText = count)
            .catch(error => console.error(error));

        this._database.countStarred()
            .then(count => this._filterListStore.items[FILTER_STARRED_INDEX].secondaryText = count)
            .catch(error => console.error(error));

        this._database.countArchived()
            .then(count => this._filterListStore.items[FILTER_ARCHIVED_INDEX].secondaryText = count)
            .catch(error => console.error(error));
    }

    refreshCategoryList() {
        this._database.findCategories()
            .then(records => {
                this._categoryListStore.items = [];

                if (records && records.length > 0) {
                    records.forEach(record => {
                        const categoryStore = new ListItemStore();

                        categoryStore.itemId      = record.category;
                        categoryStore.primaryText = record.category;

                        this._database.countCategory(record.category)
                            .then(count => categoryStore.secondaryText = count)
                            .catch(error => console.error(error));

                        this._categoryListStore.items.push(categoryStore);
                    });
                }
            }).catch(error => console.error(error));
    }
}

FilterListPresenter.FILTER_EVERYTHING_ID = 'filterListItem-0';
FilterListPresenter.FILTER_STARRED_ID    = 'filterListItem-1';
FilterListPresenter.FILTER_ARCHIVED_ID   = 'filterListItem-2';

module.exports = FilterListPresenter;
