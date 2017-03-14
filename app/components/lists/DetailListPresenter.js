// @flow
'use strict';

import ShortcutListPresenter from './ShortcutListPresenter';
import ListItemStore from './ListItemStore.jsx';
import ListStore from './ListStore';
import Database from '../../data/Database';
import Record from '../../data/Record';
import DateUtils from '../../utils/DateUtils';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../Constants';
import Config from '../../definitions/config.json';
import Rx from 'rx-lite';
import reverse from 'lodash.reverse';
import sortBy from 'lodash.sortby';

export default class DetailListPresenter {
    _store         : ListStore;
    _shortcutStore : ListStore;
    _hashTagStore  : ListStore;
    _database      : Database;
    _sorting       : Object;
    _keyword       : ?string;

    constructor(database : Database, shortcutStore : ListStore, hashTagStore : ListStore) {
        this._database      = database;
        this._store         = new ListStore();
        this._shortcutStore = shortcutStore;
        this._hashTagStore  = hashTagStore;
        this._sorting       = Constants.SORTING_DEFAULT;

        Rx.Observable.interval(Constants.DETAIL_LIST_REFRESH_INTERVAL).subscribe(() => this._store.items.forEach((item : ListItemStore) => {
            if (item.record) item.tertiaryText = DateUtils.fromNow(item.record.lastUpdatedAt);
        }));
    }

    get store() : ListStore {
        return this._store;
    }

    set sorting(sorting : Object) : void {
        if (sorting === Constants.SORTINGS[0]) {
            this._store.items = sortBy(this._store.items, (item : ListItemStore) => item.primaryText);

            this._sorting = sorting;
        } else if (sorting === Constants.SORTINGS[1]) {
            this._store.items = reverse(sortBy(this._store.items, (item : ListItemStore) => item.primaryText));

            this._sorting = sorting;
        } else if (sorting === Constants.SORTINGS[2]) {
            this._store.items = sortBy(this._store.items, (item : ListItemStore) => {
                return item.record ? item.record.lastUpdatedAt : item.primaryText;
            });

            this._sorting = sorting;
        } else if (sorting === Constants.SORTINGS[3]) {
            this._store.items = reverse(sortBy(this._store.items, (item : ListItemStore) => {
                return item.record ? item.record.lastUpdatedAt : item.primaryText;
            }));

            this._sorting = sorting;
        } else if (sorting === Constants.SORTINGS[4]) {
            this._store.items = sortBy(this._store.items, (item : ListItemStore) => {
                return item.record ? item.record.createdAt : item.primaryText;
            });

            this._sorting = sorting;
        } else if (sorting === Constants.SORTINGS[5]) {
            this._store.items = reverse(sortBy(this._store.items, (item : ListItemStore) => {
                return item.record ? item.record.createdAt : item.primaryText;
            }));

            this._sorting = sorting;
        }
    }

    set keyword(keyword : ?string) : void {
        this._keyword = keyword;

        this.refresh();
    }

    refresh() : void {
        this._store.selectedIndex = -1;

        const selectedShortcutItemId : ?string = this._shortcutStore.selectedItemId;
        const selectedHashTagItemId  : ?string = this._hashTagStore.selectedItemId;

        let promise;

        if (selectedShortcutItemId === ShortcutListPresenter.ID_EVERYTHING) {
            promise = this._database.findAll(this._sorting, this._keyword);
        } else if (selectedShortcutItemId === ShortcutListPresenter.ID_STARRED) {
            promise = this._database.findStarred(this._sorting, this._keyword);
        } else if (selectedShortcutItemId === ShortcutListPresenter.ID_ARCHIVED) {
            promise = this._database.findArchived(this._sorting, this._keyword);
        } else if (selectedHashTagItemId) {
            const selectedItem : ?ListItemStore = this._hashTagStore.selectedItem;

            if (selectedItem) promise = this._database.findByHashTag(selectedItem.primaryText, this._sorting, this._keyword);
        }

        if (promise) {
            this._store.items = [];

            promise.then(docs => {
                if (docs) {
                    docs.forEach((doc : Object) => {
                        const store : ListItemStore = new ListItemStore();
                        store.update(Record.fromDoc(doc));

                        this._store.items.push(store);
                    });
                }
            }).catch(error => EventUtils.broadcast('app.error', error));
        }
    }

    addItem() : Promise<Record> {
        const selectedShortcutItemId : ?string        = this._shortcutStore.selectedItemId;
        const selectedItem           : ?ListItemStore = this._hashTagStore.selectedItem;
        const selectedHashTag        : ?string        = selectedItem ? selectedItem.primaryText : undefined;

        if (selectedShortcutItemId || selectedHashTag) {
            const record = Record.fromText('');
            record.title = Config.defaultTitle;

            if (selectedShortcutItemId === ShortcutListPresenter.ID_EVERYTHING) {
                record.starred  = false;
                record.archived = false;

                const item : ?ListItemStore = this._shortcutStore.getItem(ShortcutListPresenter.ID_EVERYTHING);
                if (item) item.secondaryText = (1 + parseInt(item.secondaryText)).toString();

                // Force refresh
                this._shortcutStore.items = this._shortcutStore.items;
            } else if (selectedShortcutItemId === ShortcutListPresenter.FILTER_STARRED_ID) {
                record.starred  = true;
                record.archived = false;

                const item : ?ListItemStore = this._shortcutStore.getItem(ShortcutListPresenter.ID_STARRED);
                if (item) item.secondaryText = (1 + parseInt(item.secondaryText)).toString();

                // Force refresh
                this._shortcutStore.items = this._shortcutStore.items;
            } else if (selectedShortcutItemId === ShortcutListPresenter.FILTER_ARCHIVED_ID) {
                record.starred  = false;
                record.archived = true;

                const item : ?ListItemStore = this._shortcutStore.getItem(ShortcutListPresenter.ID_ARCHIVED);
                if (item) item.secondaryText = (1 + parseInt(item.secondaryText)).toString();

                // Force refresh
                this._shortcutStore.items = this._shortcutStore.items;
            } else if (selectedHashTag) {
                record.hashTags = [ selectedHashTag ];

                const item : ?ListItemStore = this._hashTagStore.selectedItem;
                if (item) item.secondaryText = (1 + parseInt(item.secondaryText)).toString();

                // Force refresh
                this._hashTagStore.items = this._hashTagStore.items;
            }

            return new Promise((resolve, reject) => this._database.addOrUpdate(record.toDoc()).then((doc : Object) => {
                const persistedRecord : Record = Record.fromDoc(doc);

                const store : ListItemStore = new ListItemStore();
                store.update(persistedRecord);

                this._store.items.unshift(store);

                resolve(persistedRecord);
            }).catch(error => reject(error)));
        }

        return Promise.reject('Please select where to add a new note to');
    }
}
