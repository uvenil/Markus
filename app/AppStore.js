'use strict';

import { extendObservable } from 'mobx';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            filterStore   : null,
            categoryStore : null,
            noteStore     : null
        });
    }
}

module.exports = AppStore;
