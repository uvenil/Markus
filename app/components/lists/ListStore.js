'use strict';

import { extendObservable, computed } from 'mobx';

/**
 * A data store object acts as a bridge between a list view and the underlying data for that view.
 */
export default class ListStore {
    constructor() {
        extendObservable(this, {
            headerText : '',
            items      : []
        });
    }

    @computed
    get isEmpty() {
        return this.items.length === 0;
    }

    /**
     * How many items are in the data set represented by this store.
     * @returns {number} Count of items.
     */
    @computed
    get count() {
        return this.items.length;
    }

    /**
     * The ID of the selected item, or undefined if no item is selected.
     * @returns {String|undefined} The ID of the selected item
     */
    @computed
    get selectedItemId() {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) {
                return this.items[i].itemId;
            }
        }

        return undefined;
    }

    /**
     * Select the item at the specified index.
     * @param {String|undefined} itemId The ID of the item to select.
     */
    set selectedItemId(itemId) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].itemId === itemId) {
                if (!this.items[i].selected) {
                    this.items[i].selected = true;
                }
            } else {
                if (this.items[i].selected) {
                    this.items[i].selected = false;
                }
            }
        }
    }

    /**
     * Returns the currently selected item.
     * @returns {ListItemStore|undefined}
     */
    getSelectedItem() {
        if (this.selectedItemId) {
            return this.getItem(this.selectedItemId);
        }

        return undefined;
    }

    /**
     * Returns the item of the store with the specific item ID.
     * @param {String} itemId
     * @returns {ListItemStore|undefined}
     */
    getItem(itemId) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].itemId === itemId) {
                return this.items[i];
            }
        }

        return undefined;
    }
}

module.exports = ListStore;
