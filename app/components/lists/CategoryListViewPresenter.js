'use strict';

import ListViewPresenter from './ListViewPresenter';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';
import _ from 'lodash';

export default class CategoryListViewPresenter extends ListViewPresenter {
    /**
     * Creates a new instance of CategoryListViewPresenter.
     * @param {Database} database
     */
    constructor(database) {
        super(database);
    }

    refresh() {
        this.database.findCategories()
            .then(records => {
                this.store.items = [];

                if (records && records.length > 0) {
                    records.forEach(record => {
                        const categoryStore = new ListItemStore();

                        categoryStore.itemId      = record.category;
                        categoryStore.primaryText = record.category;

                        this.database.countByCategory(record.category)
                            .then(count => categoryStore.secondaryText = count)
                            .catch(error => console.error(error));

                        this.store.items.push(categoryStore);
                    });
                }
            }).catch(error => console.error(error));
    }

    notifyDataSetChanged() {
        this.database.findCategories()
            .then(categories => {
                let newCategories = [];

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

                newCategories.forEach(category => {
                    const categoryStore = new ListItemStore();

                    categoryStore.itemId        = category;
                    categoryStore.primaryText   = category;
                    categoryStore.secondaryText = '0';

                    this.store.item.push(categoryStore);
                });

                _.sortBy(this.store.items, item => item.primaryText);

                // Force update
                this.store.items = this.store.items;
            });
    }

    initStore() {
        super.initStore();

        this.store.headerText = 'Categories';
    }
}

module.exports = CategoryListViewPresenter;
