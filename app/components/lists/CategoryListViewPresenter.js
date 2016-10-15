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
            .then(categories => {
                this.store.items = [];

                if (categories && categories.length > 0) {
                    categories.forEach(category => {
                        const categoryStore = new ListItemStore();

                        categoryStore.itemId      = category;
                        categoryStore.primaryText = category;

                        this.database.countByCategory(category)
                            .then(count => categoryStore.secondaryText = count)
                            .catch(error => console.error(error));

                        this.store.items.push(categoryStore);
                    });

                    this._sort();
                }
            }).catch(error => console.error(error));
    }

    notifyDataSetChanged() {
        this.database.findCategories()
            .then(categories => {
                //region Finds newly added categories

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

                    categoryStore.itemId        = category;
                    categoryStore.primaryText   = category;
                    categoryStore.secondaryText = '0';

                    this.store.items.push(categoryStore);
                });

                this._sort();
            }).catch(error => console.error(error));
    }

    initStore() {
        super.initStore();

        this.store.headerText = 'Categories';
    }

    _sort() {
        this.store.items = _.sortBy(this.store.items, item => item.primaryText);
    }
}

module.exports = CategoryListViewPresenter;
