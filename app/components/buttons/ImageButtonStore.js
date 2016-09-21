'use strict';

import { extendObservable } from 'mobx';

export default class ImageButtonStore {
    constructor() {
        this.itemId = undefined;

        extendObservable(this, {
            icon     : '',
            tooltip  : '',
            disabled : false
        });
    }
}

module.exports = ImageButtonStore;
