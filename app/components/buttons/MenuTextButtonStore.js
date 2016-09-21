'use strict';

import { extendObservable, computed } from 'mobx';

export default class MenuTextButtonStore {
    constructor() {
        this.itemId = undefined;
        this._items = [];

        extendObservable(this, {
            text          : '',
            disabled      : false,
            selectedIndex : -1
        });
    }

    @computed
    get items() {
        return this._items;
    }
}

module.exports = MenuTextButtonStore;
