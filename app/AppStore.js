'use strict';

import { extendObservable } from 'mobx';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                     : 'light',
            drawerOpened              : false,
            snackbarOpened            : false,
            snackbarMessage           : undefined,
            aboutDialogStore          : undefined,
            editorSettingsDialogStore : undefined,
            currentSyntaxDialogStore  : undefined,
            defaultSyntaxDialogStore  : undefined,
            themeDialogStore          : undefined,
            fontDialogStore           : undefined,
            settingsStore             : undefined,
            showFilterList            : true,
            showNoteList              : true,
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
            notesSorting              : 3
        });
    }
}

module.exports = AppStore;
