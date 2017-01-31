// @flow
'use strict';

import { extendObservable, computed } from 'mobx';
import ListItemStore from './ListItemStore.jsx';
import Rx from 'rx-lite';
import isEmpty from 'lodash.isempty';

export default class ListStore {
    headerText        : string;
    items             : ListItemStore[];
    _selectionChanges : any;

    constructor() {
        extendObservable(this, {
            headerText : '',
            items      : []
        });

        this._selectionChanges = new Rx.Subject();
    }

    get selectionChanges() : any {
        return this._selectionChanges;
    }

    @computed
    get isEmpty() : boolean {
        return isEmpty(this.items);
    }

    /**
     * How many items are in the data set represented by this store.
     * @returns {number} Count of items.
     */
    @computed
    get count() : number {
        return this.items.length;
    }

    /**
     * The index of the selected item, or -1 if no item is selected.
     * @returns {number} The index of the selected item.
     */
    @computed
    get selectedIndex() : number {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) return i;
        }

        return -1;
    }

    /**
     * Selects the item at the specific index
     * @param {number} index The index of the item to select, or -1 if no item is to be selected.
     */
    set selectedIndex(index : number) : void {
        for (let i = 0; i < this.items.length; i++) this.items[i].selected = i === index;

        this._selectionChanges.onNext(index);
    }

    /**
     * The ID of the selected item, or undefined if no item is selected.
     * @returns {String|undefined} The ID of the selected item.
     */
    @computed
    get selectedItemId() : ?string {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) return this.items[i].itemId;
        }

        return undefined;
    }

    /**
     * Selects the item with the specific ID.
     * @param {String|undefined} itemId The ID of the item to select, or undefined if no item is to be selected.
     */
    set selectedItemId(itemId : ?string) : void {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].itemId === itemId) {
                if (!this.items[i].selected) this.items[i].selected = true;
            } else {
                if (this.items[i].selected) this.items[i].selected = false;
            }
        }
    }

    /**
     * Returns the currently selected item.
     * @returns {ListItemStore|undefined}
     */
    get selectedItem() : ?ListItemStore {
        const itemId = this.selectedItemId;

        return itemId ? this.getItem(itemId) : undefined;
    }

    /**
     * Returns the item of the store with the specific ID.
     * @param {String} itemId
     * @returns {ListItemStore|undefined}
     */
    getItem(itemId : string) : ?ListItemStore {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].itemId === itemId) return this.items[i];
        }

        return undefined;
    }
}
