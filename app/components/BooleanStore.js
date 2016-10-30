'use strict';

import { extendObservable } from 'mobx';

export default class BooleanStore {
    /**
     * @param {boolean|undefined} [defaultValue]
     */
    constructor(defaultValue) {
        extendObservable(this, {
            booleanValue : defaultValue !== undefined ? defaultValue : false
        });
    }
}

module.exports = BooleanStore;
