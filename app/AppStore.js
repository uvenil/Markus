'use strict';

import { extendObservable } from 'mobx';
import Constants from './utils/Constants';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                     : 'light',
            drawerOpened              : false,
            snackbarOpened            : false,
            snackbarMessage           : '',
            booleanDialogStore        : undefined,
            aboutDialogStore          : undefined,
            editorSettingsDialogStore : undefined,
            currentSyntaxDialogStore  : undefined,
            defaultSyntaxDialogStore  : undefined,
            themeDialogStore          : undefined,
            fontDialogStore           : undefined,
            settingsStore             : undefined,
            showFilterList            : true,
            showNoteList              : true,
            filterListWidth           : Constants.FILTER_LIST_MIN_WIDTH,
            noteListWidth             : Constants.NOTE_LIST_MIN_WIDTH,
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
