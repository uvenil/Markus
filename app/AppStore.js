'use strict';

import { extendObservable } from 'mobx';
import Config from '../config.json';

export default class AppStore {
    constructor() {
        extendObservable(this, {
            theme                      : 'light',
            aboutDialogStore           : undefined,
            settingsDialogStore        : undefined,
            settingsPaneStore          : undefined,
            currentSyntaxListViewStore : undefined,
            defaultSyntaxListViewStore : undefined,
            themeListViewStore         : undefined,
            fontListViewStore          : undefined,
            settingsStore              : undefined,
            showFilterList             : Config.defaultShowFilterList,
            showNoteList               : Config.defaultShowNoteList,
            filterListWidth            : Config.filterListWidth,
            noteListWidth              : Config.noteListWidth,
            filtersStore               : undefined,
            categoriesStore            : undefined,
            notesStore                 : undefined,
            editorStore                : undefined,
            addNoteEnabled             : false,
            addCategoryDialogStore     : undefined,
            updateCategoryDialogStore  : undefined,
            selectCategoryDialogStore  : undefined,
            notesSorting               : 3
        });
    }
}

module.exports = AppStore;
