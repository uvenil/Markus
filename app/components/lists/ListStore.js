// @flow
'use strict';

import { extendObservable, computed } from 'mobx';
import ListItemStore from './ListItemStore.jsx';
import Rx from 'rx-lite';
import isEmpty from 'lodash.isempty';

export default class ListStore {
    headerText        : string;
    items             : ListItemStore[];
    _selectionChanges : Rx.Subject;

    constructor() {
        extendObservable(this, {
            headerText : '',
            items      : []
        });

        this._selectionChanges = new Rx.Subject();
    }

    get selectionChanges() : Rx.Subject {
        return this._selectionChanges;
    }

    /**
     * Returns true if there is no items; otherwise, returns false.
     * @return {boolean}
     */
    @computed
    get isEmpty() : boolean {
        return isEmpty(this.items);
    }

    /**
     * Gets the total number of items.
     * @return {number}
     */
    @computed
    get count() : number {
        return this.items.length;
    }

    /**
     * Gets the index of the currently selected item, or -1 if no item is selected.
     * @return {number}
     */
    @computed
    get selectedIndex() : number {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) return i;
        }

        return -1;
    }

    /**
     * Sets the item at the specified index as selected.
     * @param {number} index
     */
    set selectedIndex(index : number) : void {
        for (let i = 0; i < this.items.length; i++) this.items[i].selected = i === index;

        this._selectionChanges.onNext(index);
    }

    /**
     * Gets the item ID of the currently selected item, or undefined if no item is selected.
     * @return {string|undefined}
     */
    @computed
    get selectedItemId() : ?string {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].selected) return this.items[i].itemId;
        }

        return undefined;
    }

    /**
     * Sets the item with the specified item ID as selected, or de-select all items if no item ID is specified.
     * @param {string|undefined} itemId The item ID of the item to be selected, or -1 to de-select all items.
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
     * Gets the currently selected item, or undefined if no item is selected.
     * @return {ListItemStore|undefined}
     */
    get selectedItem() : ?ListItemStore {
        const itemId = this.selectedItemId;

        return itemId ? this.getItem(itemId) : undefined;
    }

    /**
     * Gets the item with the specified item ID.
     * @param {string} itemId The item ID of the item to get.
     * @return {ListItemStore|undefined}
     */
    getItem(itemId : string) : ?ListItemStore {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].itemId === itemId) return this.items[i];
        }

        return undefined;
    }
}
