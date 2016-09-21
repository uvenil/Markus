'use strict';

import { extendObservable, computed } from 'mobx';

export default class ImageButtonBarStore {
    constructor() {
        this._items = [];

        extendObservable(this, {
            backgroundColor : null
        });
    }

    @computed
    get isEmpty() {
        return this._items.length === 0;
    }

    /**
     * How many items are in the data set represented by this store.
     * @returns {number} Count of items.
     */
    @computed
    get count() {
        return this._items.length;
    }

    /**
     * Gets the data items in the data set.
     * @returns {Array.<ImageButtonStore|MenuImageButtonStore>}
     */
    @computed
    get items() {
        return this._items;
    }
}

module.exports = ImageButtonBarStore;
