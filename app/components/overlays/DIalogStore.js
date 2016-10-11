'use strict';

import { extendObservable } from 'mobx';

export default class DialogStore {
    constructor() {
        extendObservable(this, {
            visible : false
        });
    }
}

module.exports = DialogStore;
