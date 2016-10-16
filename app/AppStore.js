'use strict';

import { extendObservable } from 'mobx';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                  : 'light',
            aboutDialogStore       : null,
            showFilterList         : Config.defaultShowFilterList,
            showNoteList           : Config.defaultShowNoteList,
            filterListWidth        : Config.filterListWidth,
            noteListWidth          : Config.noteListWidth,
            filtersStore           : null,
            categoriesStore        : null,
            notesStore             : null,
            editorStore            : null,
            addNoteEnabled         : false,
            addCategoryDialogStore : null
        });
    }
}

module.exports = AppStore;
