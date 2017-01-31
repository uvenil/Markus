// @flow
'use strict';

import ListPresenter from './ListPresenter';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';
import EventUtils from '../../utils/EventUtils';
import Unique from '../../utils/Unique';
import sortBy from 'lodash.sortby';

export default class CategoryListPresenter extends ListPresenter {
    /**
     * Creates a new instance of CategoryListPresenter.
     * @param {Database} database
     */
    constructor(database : Database) {
        super(database);
    }

    refresh() : void {
        this.database.findCategories()
            .then(categories => {
                this.store.items = [];

                if (categories && categories.length > 0) {
                    categories.forEach(category => {
                        const categoryStore = new ListItemStore();

                        categoryStore.itemId      = Unique.nextString();
                        categoryStore.primaryText = category;

                        this.database.countByCategory(category)
                            .then(count => categoryStore.secondaryText = (count).toString())
                            .catch(error => EventUtils.broadcast('global.error', error));

                        this.store.items.push(categoryStore);
                    });

                    this._sort();
                }
            }).catch(error => EventUtils.broadcast('global.error', error));
    }

    notifyDataSetChanged() : void {
        this.database.findCategories()
            .then(categories => {
                //region Finds newly added categories

                const newCategories = [];

                categories.forEach(category => {
                    let found = false;

                    for (let i = 0; i < this.store.items.length; i++) {
                        if (category === this.store.items[i].primaryText) {
                            found = true;
                        }
                    }

                    if (!found) {
                        newCategories.push(category);
                    }
                });

                //endregion

                //region Removes deleted categories

                let index = 0;

                while (index < this.store.items.length) {
                    let found = false;

                    categories.forEach(category => {
                        if (category === this.store.items[index].primaryText) {
                            found = true;
                        }
                    });

                    if (found) {
                        index++;
                    } else {
                        this.store.items.splice(index, 1);
                    }
                }

                //endregion

                newCategories.forEach(category => {
                    const categoryStore = new ListItemStore();

                    categoryStore.itemId        = Unique.nextString();
                    categoryStore.primaryText   = category;
                    categoryStore.secondaryText = '0';

                    this.store.items.push(categoryStore);
                });

                this._sort();

                this.store.items.forEach(item => {
                    this.database.countByCategory(item.primaryText)
                        .then(count => item.secondaryText = (count).toString())
                        .catch(error => EventUtils.broadcast('global.error', error));
                });
            }).catch(error => EventUtils.broadcast('global.error', error));
    }

    initStore() : void {
        super.initStore();

        this.store.headerText = 'Categories';
    }

    _sort() : void {
        this.store.items = sortBy(this.store.items, item => item.primaryText);
    }
}
