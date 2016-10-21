'use strict';

import { extendObservable } from 'mobx';

export default class ToggleStore {
    /**
     * @param {boolean|undefined} [checked]
     */
    constructor(checked) {
        extendObservable(this, {
            checked : checked
        });
    }
}

module.exports = ToggleStore;
