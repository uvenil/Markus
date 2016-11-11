'use strict';

import FilterListViewPresenter from './FilterListPresenter';
import CategoryListPresenter from './CategoryListPresenter';
import ListStore from './ListStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../utils/Constants';
import Config from '../../definitions/config.json';
import Rx from 'rx-lite';
import moment from 'moment';
import _ from 'lodash';

export default class NoteListPresenter {
    /**
     * Creates a new instance of NoteListPresenter.
     * @param {FilterListPresenter} filterListPresenter
     * @param {CategoryListPresenter} categoryListPresenter
     * @param {Database} database
     */
    constructor(filterListPresenter, categoryListPresenter, database) {
        this._filterListPresenter   = filterListPresenter;
        this._categoryListPresenter = categoryListPresenter;
        this._store                 = new ListStore();
        this._database              = database;
        this._sorting               = NoteListPresenter.DEFAULT_SORTING;
        this._keyword               = undefined;

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

        const selectedFilterItemId   = this._filterListPresenter.store.selectedItemId;
        const selectedCategoryItemId = this._categoryListPresenter.store.selectedItemId;

        let promise;

        if (selectedFilterItemId === FilterListViewPresenter.FILTER_EVERYTHING_ID) {
            promise = this._database.findAll(this._sorting, this._keyword);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_STARRED_ID) {
            promise = this._database.findByStarred(this._sorting, this._keyword);
        } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_ARCHIVED_ID) {
            promise = this._database.findByArchived(this._sorting, this._keyword);
        } else if (selectedCategoryItemId) {
            promise = this._database.findByCategory(this._categoryListPresenter.store.selectedItem.primaryText, this._sorting, this._keyword);
        }

        this._store.items = [];

        if (promise) promise.then(docs => docs.forEach(doc => this._store.items.push(Record.fromDoc(doc).toListItemStore()))).catch(error => EventUtils.broadcast('global.error', error));
    }

    /**
     * Adds a new note to the list.
     * @return {Promise}
     */
    addNote(syntax) {
        const selectedFilterItemId = this._filterListPresenter.store.selectedItemId;
        const selectedCategoryItem = this._categoryListPresenter.store.selectedItem.primaryText;

        if (selectedFilterItemId || selectedCategoryItem) {
            const record = Record.fromText(syntax, '');
            record.title = Config.defaultNoteTitle;

            if (selectedFilterItemId === FilterListViewPresenter.FILTER_EVERYTHING_ID) {
                record.starred  = false;
                record.archived = false;

                this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_EVERYTHING_ID).secondaryText = 1 + parseInt(this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_EVERYTHING_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.store.items = this._filterListPresenter.store.items;
            } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_STARRED_ID) {
                record.starred  = true;
                record.archived = false;

                this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_STARRED_ID).secondaryText = 1 + parseInt(this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_STARRED_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.store.items = this._filterListPresenter.store.items;
            } else if (selectedFilterItemId === FilterListViewPresenter.FILTER_ARCHIVED_ID) {
                record.starred  = false;
                record.archived = true;

                this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_ARCHIVED_ID).secondaryText = 1 + parseInt(this._filterListPresenter.store.getItem(FilterListViewPresenter.FILTER_ARCHIVED_ID).secondaryText);

                // Force refresh
                this._filterListPresenter.store.items = this._filterListPresenter.store.items;
            } else if (selectedCategoryItem) {
                record.category = selectedCategoryItem;

                this._categoryListPresenter.store.selectedItem.secondaryText = 1 + parseInt(this._categoryListPresenter.store.selectedItem.secondaryText);

                // Force refresh
                this._categoryListPresenter.store.items = this._categoryListPresenter.store.items;
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

NoteListPresenter.DEFAULT_SORTING = Config.defaultNotesSorting;

module.exports = NoteListPresenter;
