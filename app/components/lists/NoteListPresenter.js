'use strict';

import FilterListPresenter from './FilterListPresenter';
import ListStore from './ListStore';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';
import DataUtils from '../../data/DataUtils';
import moment from 'moment';
import Config from '../../../config/config.json';

export default class NoteListPresenter {
    /**
     * Creates a new instance of NoteListPresenter.
     * @param {FilterListPresenter} filterListPresenter
     * @param {Database} database
     */
    constructor(filterListPresenter, database) {
        this._filterListPresenter = filterListPresenter;
        this._database            = database;
        this._noteListStore       = new ListStore();
        this._sorting             = NoteListPresenter.DEFAULT_SORTING;
    }

    /**
     * @returns {ListStore}
     */
    get noteListStore() {
        return this._noteListStore;
    }

    refreshNoteList() {
        this._noteListStore.selectedItemId = undefined;

        const selectedFilterListItem   = this._filterListPresenter.filterListStore.selectedItemId;
        const selectedCategoryListItem = this._filterListPresenter.categoryListStore.selectedItemId;

        let promise;

        if (selectedFilterListItem === FilterListPresenter.FILTER_EVERYTHING_ID) {
            promise = this._database.findAll(this._sorting);
        } else if (selectedFilterListItem === FilterListPresenter.FILTER_STARRED_ID) {
            promise = this._database.findStarred(this._sorting);
        } else if (selectedFilterListItem === FilterListPresenter.FILTER_ARCHIVED_ID) {
            promise = this._database.findArchived(this._sorting);
        } else if (selectedCategoryListItem) {
            promise = this._database.findCategory(selectedCategoryListItem, this._sorting);
        }

        if (promise) {
            promise.then(records => {
                this._noteListStore.items = [];

                records.forEach(record => {
                    const store = new ListItemStore();

                    store.itemId        = record._id;
                    store.primaryText   = record.title && record.title.length > 0 ? record.title : Config.defaultNoteTitle;
                    store.secondaryText = record.description;
                    store.tertiaryText  = moment(record.lastUpdatedAt).fromNow();

                    this._noteListStore.items.push(store);
                });
            }).catch(error => console.error(error));
        }
    }

    addNewNote() {
        const selectedFilterListItem   = this._filterListPresenter.filterListStore.selectedItemId;
        const selectedCategoryListItem = this._filterListPresenter.categoryListStore.selectedItemId;

        if (selectedFilterListItem || selectedCategoryListItem) {
            const record = DataUtils.createNewRecord();
            record.title = Config.defaultNoteTitle;

            const selectedFilterListItem   = this._filterListPresenter.filterListStore.selectedItemId;
            const selectedCategoryListItem = this._filterListPresenter.categoryListStore.selectedItemId;

            if (selectedFilterListItem === FilterListPresenter.FILTER_EVERYTHING_ID) {
                record.starred  = false;
                record.archived = false;

                this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_EVERYTHING_ID).secondaryText = 1 + parseInt(this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_EVERYTHING_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.filterListStore.items = this._filterListPresenter.filterListStore.items;
            } else if (selectedFilterListItem === FilterListPresenter.FILTER_STARRED_ID) {
                record.starred  = true;
                record.archived = false;

                this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_STARRED_ID).secondaryText = 1 + parseInt(this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_STARRED_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.filterListStore.items = this._filterListPresenter.filterListStore.items;
            } else if (selectedFilterListItem === FilterListPresenter.FILTER_ARCHIVED_ID) {
                record.starred  = false;
                record.archived = true;

                this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_ARCHIVED_ID).secondaryText = 1 + parseInt(this._filterListPresenter.filterListStore.getItem(FilterListPresenter.FILTER_ARCHIVED_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.filterListStore.items = this._filterListPresenter.filterListStore.items;
            } else if (selectedCategoryListItem) {
                record.category = selectedCategoryListItem;

                this._filterListPresenter.categoryListStore.getItem(selectedCategoryListItem).secondaryText = 1 + parseInt(this._filterListPresenter.categoryListStore.getItem(selectedCategoryListItem).secondaryText);

                // Force refresh
                this._filterListPresenter.categoryListStore.items = this._filterListPresenter.categoryListStore.items;
            }

            this._database.addOrUpdate(record).then(doc => {
                const store = new ListItemStore();

                store.itemId       = doc._id;
                store.primaryText  = Config.defaultNoteTitle;
                store.tertiaryText = moment(doc.lastUpdatedAt).fromNow();

                this._noteListStore.items.unshift(store);
            }).catch(error => console.error(error));
        }
    }
}

NoteListPresenter.DEFAULT_SORTING = 2;

module.exports = NoteListPresenter;
