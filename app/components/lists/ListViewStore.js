'use strict';

import { extendObservable, computed } from 'mobx';
import _ from 'lodash';

export default class ListViewStore {
    constructor() {
        extendObservable(this, {
            headerText : '',
            items      : []
        });
    }

    @computed
    get isEmpty() {
        return _.isEmpty(this.items);
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
     * The index of the selected item, or -1 if no item is selected.
     * @returns {number} The index of the selected item.
     */
    @computed
    get selectedIndex() {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Selects the item at the specific index
     * @param {number} index The index of the item to select, or -1 if no item is to be selected.
     */
    set selectedIndex(index) {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].selected = i === index;
        }
    }

    /**
     * The ID of the selected item, or undefined if no item is selected.
     * @returns {String|undefined} The ID of the selected item.
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
     * Selects the item with the specific ID.
     * @param {String|undefined} itemId The ID of the item to select, or undefined if no item is to be selected.
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
    get selectedItem() {
        const itemId = this.selectedItemId;

        return itemId ? this.getItem(itemId) : undefined;
    }

    /**
     * Returns the item of the store with the specific ID.
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

module.exports = ListViewStore;
