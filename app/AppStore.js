'use strict';

import { extendObservable } from 'mobx';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            showFilterList         : Config.defaultShowFilterList,
            showNoteList           : Config.defaultShowNoteList,
            filterListWidth        : Config.filterListWidth,
            noteListWidth          : Config.noteListWidth,
            filtersStore           : null,
            categoriesStore        : null,
            notesStore             : null,
            editorStore            : null,
            addNoteEnabled         : false,
            addCategoryDialogStore : false
        });
    }
}

module.exports = AppStore;
