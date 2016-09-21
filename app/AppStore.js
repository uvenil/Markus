'use strict';

import { extendObservable } from 'mobx';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            filterListStore     : null,
            categoryListStore   : null,
            noteListStore       : null,
            imageButtonBarStore : null,
            noteEditorStore     : null
        });
    }
}

module.exports = AppStore;
