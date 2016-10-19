'use strict';

import { extendObservable } from 'mobx';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                     : 'light',
            aboutDialogStore          : undefined,
            showFilterList            : Config.defaultShowFilterList,
            showNoteList              : Config.defaultShowNoteList,
            filterListWidth           : Config.filterListWidth,
            noteListWidth             : Config.noteListWidth,
            filtersStore              : undefined,
            categoriesStore           : undefined,
            notesStore                : undefined,
            editorStore               : undefined,
            addNoteEnabled            : false,
            addCategoryDialogStore    : undefined,
            updateCategoryDialogStore : undefined,
            selectCategoryDialogStore : undefined,
            notesSorting              : 2
        });
    }
}

module.exports = AppStore;
