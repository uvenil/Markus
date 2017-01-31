// @flow
'use strict';

import { extendObservable, computed } from 'mobx';
import BooleanStore from './components/BooleanStore';
import BooleanDialogStore from './components/dialogs/BooleanDialogStore';
import EditorSettingsDialogStore from './components/dialogs/EditorSettingsDialogStore';
import ListDialogStore from './components/dialogs/ListDialogStore';
import PromptDialogStore from './components/dialogs/PromptDialogStore';
import ListStore from './components/lists/ListStore';
import NoteEditorStore from './components/text/NoteEditorStore';
import Constants from './utils/Constants';
import Config from './definitions/config.json';

export default class AppStore {
    theme                : string;
    drawerOpened         : boolean;
    snackbarOpened       : boolean;
    snackbarMessage      : string;
    booleanDialog        : BooleanDialogStore;
    aboutDialog          : BooleanStore;
    editorSettingsDialog : EditorSettingsDialogStore;
    currentSyntaxDialog  : ListDialogStore;
    defaultSyntaxDialog  : ListDialogStore;
    themeDialog          : ListDialogStore;
    fontDialog           : ListDialogStore;
    filterListShown      : boolean;
    noteListShown        : boolean;
    filterListWidth      : number;
    noteListWidth        : number;
    filterList           : ListStore;
    categoryList         : ListStore;
    noteList             : ListStore;
    noteEditor           : NoteEditorStore;
    addNoteEnabled       : boolean;
    addCategoryDialog    : PromptDialogStore;
    updateCategoryDialog : PromptDialogStore;
    selectCategoryDialog : ListDialogStore;
    notesSorting         : number;

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
            filterListWidth      : Constants.SOURCE_LIST_MIN_WIDTH,
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

    @computed
    get hasSourceSelected() : boolean {
        return (this.filterList && this.filterList.selectedIndex > -1) || (this.categoryList && this.categoryList.selectedIndex > -1);
    }
}
