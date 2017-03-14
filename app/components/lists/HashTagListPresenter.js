// @flow
'use strict';

import MasterListPresenter from './MasterListPresenter';
import ListItemStore from './ListItemStore.jsx';
import ListStore from './ListStore';
import Database from '../../data/Database';
import EventUtils from '../../utils/EventUtils';
import Unique from '../../utils/Unique';
import sortBy from 'lodash.sortby';

const createStore = () : ListStore => {
    const store = new ListStore();

    store.headerText = 'Hashtags';

    return store;
};

const createItemStore = (hashTag : string, index : number) : ListItemStore => {
    const store = new ListItemStore();

    store.itemId      = Unique.nextString('hashTag-item-' + index);
    store.primaryText = hashTag;

    return store;
};

export default class HashTagListPresenter extends MasterListPresenter {
    constructor(database : Database) {
        super(database, createStore());
    }

    refresh() : void {
        this._database.findHashTags().then(hashTags => {
            this._store.items = [];

            if (hashTags && hashTags.length > 0) {
                hashTags.forEach((hashTag : string, index : number) => {
                    const store = createItemStore(hashTag, index);

                    this._database.countHashTagged(hashTag).then(count => store.secondaryText = (count).toString()).catch(error => EventUtils.broadcast('app.error', error));
                });

                this._sort();
            }
        }).catch(error => EventUtils.broadcast('app.error', error));
    }

    notifyDataSetChanged() : void {
        this._database.findHashTags().then(hashTags => {
            //region Finds newly added hash-tags

            const newHashTags = [];

            hashTags.forEach(hashTag => {
                let found = false;

                for (let i = 0; i < this._store.items.length; i++) {
                    if (hashTag === this._store.items[i].primaryText) found = true;
                }

                if (!found) newHashTags.push(hashTag);
            });

            //endregion

            //region Removes deleted hash-tags

            let index = 0;

            while (index < this._store.items.length) {
                let found = false;

                hashTags.forEach(hashTag => {
                    if (hashTag === this._store.items[index].primaryText) found = true;
                });

                if (found) {
                    index++;
                } else {
                    this._store.items.splice(index, 1);
                }
            }

            //endregion

            hashTags.forEach((hashTag : string, index : number) => {
                const store = createItemStore(hashTag, index);
                store.secondaryText = '0';

                this._store.items.push(store);
            });

            this._sort();

            this._store.items.forEach((item : ListItemStore) => this._database.countHashTagged(item.primaryText).then(count => item.secondaryText = (count).toString()).catch(error => EventUtils.broadcast('app.error', error)));
        }).catch(error => EventUtils.broadcast('app.error', error));
    }

    _sort() : void {
        this._store.items = sortBy(this._store.items, (item : ListItemStore) => item.primaryText);
    }
}
