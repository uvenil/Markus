'use strict';

import { extendObservable } from 'mobx';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            filtersStore    : null,
            categoriesStore : null,
            notesStore      : null,
            editorStore     : null,
            addNoteEnabled  : false
        });
    }
}

module.exports = AppStore;
