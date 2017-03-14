// @flow
'use strict';

import { extendObservable, computed } from 'mobx';
import EditorStore from './components/text/EditorStore';
import ChippedTextFieldStore from './components/text/ChippedTextFieldStore';
import ListStore from './components/lists/ListStore';
import BooleanStore from './components/BooleanStore';
import BooleanDialogStore from './components/dialogs/BooleanDialogStore';
import ListDialogStore from './components/dialogs/ListDialogStore';
import EditorSettingsDialogStore from './components/dialogs/EditorSettingsDialogStore';
import Constants from './Constants';

export default class AppStore {
    theme           : string;
    message         : string;
    messageShown    : boolean;
    drawerOpened    : boolean;
    masterListWidth : number;
    masterListShown : boolean;
    detailListWidth : number;
    detailListShown : boolean;
    shortcutList    : ListStore;
    hashTagList     : ListStore;
    detailList      : ListStore;
    editor          : EditorStore;
    hashTags        : ChippedTextFieldStore;
    addNoteEnabled  : boolean;
    sorting         : Object;
    booleanDialog   : BooleanDialogStore;
    themeDialog     : ListDialogStore;
    fontDialog      : ListDialogStore;
    editorSettings  : EditorSettingsDialogStore;
    aboutDialog     : BooleanStore;

    constructor() {
        extendObservable(this, {
            theme           : 'light',
            message         : '',
            messageShown    : false,
            drawerOpened    : false,
            masterListWidth : Constants.MASTER_LIST_MIN_WIDTH,
            masterListShown : true,
            detailListWidth : Constants.DETAIL_LIST_MIN_WIDTH,
            detailListShown : true,
            shortcutList    : null,
            hashTagList     : null,
            detailList      : null,
            editor          : null,
            hashTags        : null,
            addNoteEnabled  : false,
            sorting         : Constants.SORTING_DEFAULT,
            booleanDialog   : null,
            themeDialog     : null,
            fontDialog      : null,
            editorSettings  : null,
            aboutDialog     : null
        });
    }

    @computed
    get hasSourceSelected() : boolean {
        return (this.shortcutList && this.shortcutList.selectedIndex > -1) || (this.hashTagList && this.hashTagList.selectedIndex > -1);
    }
}
