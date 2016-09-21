'use strict';

import { extendObservable, computed } from 'mobx';

export default class MenuImageButtonStore {
    constructor() {
        this.itemId = undefined;
        this._items = [];

        extendObservable(this, {
            icon          : '',
            disabled      : false,
            selectedIndex : -1
        });
    }

    @computed
    get items() {
        return this._items;
    }
}

module.exports = MenuImageButtonStore;
