'use strict';

import FilterListViewPresenter from './FilterListViewPresenter';
import CategoryListViewPresenter from './CategoryListViewPresenter';
import ListViewStore from './ListViewStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import Config from '../../../config.json';

export default class NoteListViewPresenter {
    /**
     * Creates a new instance of NoteListViewPresenter.
     * @param {FilterListViewPresenter} filterListViewPresenter
     * @param {CategoryListViewPresenter} categoryListViewPresenter
     * @param {Database} database
     */
    constructor(filterListViewPresenter, categoryListViewPresenter, database) {
        this._filtersPresenter    = filterListViewPresenter;
        this._categoriesPresenter = categoryListViewPresenter;
        this._store               = new ListViewStore();
        this._database            = database;
        this._sorting             = NoteListViewPresenter.DEFAULT_SORTING;
    }

    get store() {
        return this._store;
    }

    get sorting() {
        return this._sorting;
    }

    refresh() {
        this._store.selectedItemId = undefined;

        const selectedFilterItemId   = this._filtersPresenter.store.selectedItemId;
        const selectedCategoryItemId = this._categoriesPresenter.store.selectedItemId;

        console.trace('selectedFilterItemId = ' + selectedFilterItemId + ', selectedCategoryItemId = ' + selectedCategoryItemId);

        let promise;

        if (selectedFilterItemId === FilterListViewPresenter.FILTER_EVERYTHING_ID) {
            promise = this._database.findAll(this._sorting);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_STARRED_ID) {
            promise = this._database.findByStarred(this._sorting);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_ARCHIVED_ID) {
            promise = this._database.findByArchived(this._sorting);
        } else if (selectedCategoryItemId) {
            promise = this._database.findByCategory(selectedCategoryItemId, this._sorting);
        }

        this._store.items = [];

        if (promise) {
            promise.then(docs => {
                docs.forEach(doc => {
                    this._store.items.push(Record.fromDoc(doc).toListItemStore());
                });
            }).catch(error => console.error(error));
        }
    }

    /**
     * Adds a new note to the list.
     * @return {Promise}
     */
    addNote(syntax) {
        const selectedFilterItemId   = this._filtersPresenter.store.selectedItemId;
        const selectedCategoryItemId = this._categoriesPresenter.store.selectedItemId;

        if (selectedFilterItemId || selectedCategoryItemId) {
            const record = Record.fromText(syntax, '');
            record.title = Config.defaultNoteTitle;

            if (selectedFilterItemId === FilterListViewPresenter.FILTER_EVERYTHING_ID) {
                record.starred  = false;
                record.archived = false;

                this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_EVERYTHING_ID).secondaryText = 1 + parseInt(this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_EVERYTHING_ID).secondaryText);

                // Force refresh
                this._filtersPresenter.store.items = this._filtersPresenter.store.items;
            } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_STARRED_ID) {
                record.starred  = true;
                record.archived = false;

                this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_STARRED_ID).secondaryText = 1 + parseInt(this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_STARRED_ID).secondaryText);

                // Force refresh
                this._filtersPresenter.store.items = this._filtersPresenter.store.items;
            } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_ARCHIVED_ID) {
                record.starred  = false;
                record.archived = true;

                this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_ARCHIVED_ID).secondaryText = 1 + parseInt(this._filtersPresenter.store.getItem(FilterListViewPresenter.FILTER_ARCHIVED_ID).secondaryText);

                // Force refresh
                this._filtersPresenter.store.items = this._filtersPresenter.store.items;
            } else if (selectedCategoryItemId) {
                record.category = selectedCategoryItemId;

                this._categoriesPresenter.store.getItem(selectedCategoryItemId).secondaryText = 1 + parseInt(this._categoriesPresenter.store.getItem(selectedCategoryItemId).secondaryText);

                // Force refresh
                this._categoriesPresenter.store.items = this._categoriesPresenter.store.items;
            }

            return new Promise((resolve, reject) => this._database.addOrUpdate(record.toDoc())
                .then(doc => {
                    const persistedRecord = Record.fromDoc(doc);

                    this._store.items.unshift(persistedRecord.toListItemStore());

                    resolve(persistedRecord);
                }).catch(error => reject(error)));
        }

        return Promise.reject('No filter or category is selected');
    }
}

NoteListViewPresenter.DEFAULT_SORTING = 2;

module.exports = NoteListViewPresenter;
