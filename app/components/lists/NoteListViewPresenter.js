'use strict';

import FilterListViewPresenter from './FilterListViewPresenter';
import CategoryListViewPresenter from './CategoryListViewPresenter';
import ListViewStore from './ListViewStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../utils/Constants';
import Config from '../../../config.json';
import Rx from 'rx-lite';
import moment from 'moment';
import _ from 'lodash';

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
        this._keyword             = undefined;

        Rx.Observable.interval(Constants.NOTE_TIMESTAMP_REFRESH_INTERVAL).subscribe(() => {
            this._store.items.forEach(item => {
                if (item.record) item.tertiaryText = moment(item.record.lastUpdatedAt).fromNow();
            });
        });
    }

    get store() {
        return this._store;
    }

    /**
     * Updates the list sorting.
     * @param {number} sorting
     */
    set sorting(sorting) {
        this._sorting = sorting;

        switch (sorting) {
            case 0:
                this._store.items = _.sortBy(this._store.items, item => item.primaryText);
                break;

            case 1:
                this._store.items = _.reverse(_.sortBy(this._store.items, item => item.primaryText));
                break;

            case 2:
                this._store.items = _.sortBy(this._store.items, item => {
                    return item.record ? item.record.lastUpdatedAt : item.primaryText;
                });

                break;

            case 3:
                this._store.items = _.reverse(_.sortBy(this._store.items, item => {
                    return item.record ? item.record.lastUpdatedAt : item.primaryText;
                }));

                break;

            case 4:
                this._store.items = _.sortBy(this._store.items, item => {
                    return item.record ? item.record.createdAt : item.primaryText;
                });

                break;

            case 5:
                this._store.items = _.reverse(_.sortBy(this._store.items, item => {
                    return item.record ? item.record.createdAt : item.primaryText;
                }));

                break;

            default:
                console.warn('Unrecognized sorting: ' + sorting);
                break;
        }
    }

    /**
     * Filters the list with the specified keyword.
     * @param {String} keyword
     */
    set keyword(keyword) {
        this._keyword = keyword;

        this.refresh();
    }

    refresh() {
        this._store.selectedItemId = undefined;

        const selectedFilterItemId   = this._filtersPresenter.store.selectedItemId;
        const selectedCategoryItemId = this._categoriesPresenter.store.selectedItemId;

        let promise;

        if (selectedFilterItemId === FilterListViewPresenter.FILTER_EVERYTHING_ID) {
            promise = this._database.findAll(this._sorting, this._keyword);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_STARRED_ID) {
            promise = this._database.findByStarred(this._sorting, this._keyword);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_ARCHIVED_ID) {
            promise = this._database.findByArchived(this._sorting, this._keyword);
        } else if (selectedCategoryItemId) {
            promise = this._database.findByCategory(this._categoriesPresenter.store.selectedItem.primaryText, this._sorting, this._keyword);
        }

        this._store.items = [];

        if (promise) promise.then(docs => docs.forEach(doc => this._store.items.push(Record.fromDoc(doc).toListItemStore()))).catch(error => EventUtils.broadcast('global.error', error));
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

NoteListViewPresenter.DEFAULT_SORTING = Config.defaultNotesSorting;

module.exports = NoteListViewPresenter;
