'use strict';

import ListViewPresenter from './ListViewPresenter';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';

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

    initStore() {
        super.initStore();

        this.store.headerText = 'Categories';
    }

    /**
     * Add a new category to the list.
     * @param {String} category The category to be added to the list.
     */
    addCategory(category) {
        // TODO
    }
}

module.exports = CategoryListViewPresenter;
