'use strict';

import { extendObservable } from 'mobx';
import Constants from './utils/Constants';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                : 'light',
            drawerOpened         : false,
            snackbarOpened       : false,
            snackbarMessage      : '',
            booleanDialog        : undefined,
            aboutDialog          : undefined,
            editorSettingsDialog : undefined,
            currentSyntaxDialog  : undefined,
            defaultSyntaxDialog  : undefined,
            themeDialog          : undefined,
            fontDialog           : undefined,
            filterListShown      : true,
            noteListShown        : true,
            filterListWidth      : Constants.FILTER_LIST_MIN_WIDTH,
            noteListWidth        : Constants.NOTE_LIST_MIN_WIDTH,
            filterList           : undefined,
            categoryList         : undefined,
            noteList             : undefined,
            noteEditor           : undefined,
            addNoteEnabled       : false,
            addCategoryDialog    : undefined,
            updateCategoryDialog : undefined,
            selectCategoryDialog : undefined,
            notesSorting         : Config.defaultNotesSorting
        });
    }
}

module.exports = AppStore;
