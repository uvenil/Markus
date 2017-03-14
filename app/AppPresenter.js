// @flow
'use strict';

import AppStore from './AppStore';
import ShortcutListPresenter from './components/lists/ShortcutListPresenter';
import HashTagListPresenter from './components/lists/HashTagListPresenter';
import DetailListPresenter from './components/lists/DetailListPresenter';
import ListItemStore from './components/lists/ListItemStore.jsx';
import BooleanDialogStore from './components/dialogs/BooleanDialogStore';
import EditorSettingsDialogStore from './components/dialogs/EditorSettingsDialogStore';
import ListDialogStore from './components/dialogs/ListDialogStore';
import EditorPresenter from './components/text/EditorPresenter';
import ChippedTextFieldPresenter from './components/text/ChippedTextFieldPresenter';
import Database from './data/Database';
import Record from './data/Record';
import Settings from './utils/Settings';
import AppUtils from './utils/AppUtils';
import EventUtils from './utils/EventUtils';
import Constants from './Constants';
import Config from './definitions/config.json';
import ThemeCodes from './definitions/themes/theme-codes.json';
import Rx from 'rx-lite';
import indexOf from 'lodash.indexof';

export default class AppPresenter {
    _store                 : AppStore;
    _isInitialized         : boolean;
    _database              : Database;
    _shortcutListPresenter : ShortcutListPresenter;
    _hashTagListPresenter  : HashTagListPresenter;
    _detailListPresenter   : DetailListPresenter;
    _editorPresenter       : EditorPresenter;
    _hashTagPresenter      : ChippedTextFieldPresenter;
    _shortcutSelection     : Rx.Subject;
    _hashTagSelection      : Rx.Subject;

    constructor(store : AppStore) {
        this._store         = store;
        this._isInitialized = false;
        this._database      = new Database();

        this._instantiate();

        Rx.Observable.zip(this._shortcutSelection, this._hashTagSelection, (selectedShortcutIndex : number, selectedHashTagIndex : number) => selectedShortcutIndex > -1 || selectedHashTagIndex > -1).subscribe(hasSelection => {
            this._store.addNoteEnabled = hasSelection;

            this.refreshDetailList();
        });

        this._store.detailList.selectionChanges.subscribe(() => this.refreshEditor().then(() => {
            if (this._store.detailList.selectedIndex > -1) {
                const detailList : any = document.getElementById('detailList');

                if (detailList) {
                    const parentElement : any = detailList.parentElement;

                    if (parentElement) parentElement.focus();
                }
            }
        }));

        AppUtils.initThemes(this._store);
        AppUtils.initFonts(this._store);
    }

    initialize() : void {
        if (!this._isInitialized) {
            this._isInitialized = true;

            this._initSettings().then(() => this._initDatabase()).then(() => this._initAutoSave()).catch(error => EventUtils.broadcast('app.error', error));

            AppUtils.clearCache();
        }
    }

    handleShortcutItemClick(index : number) : void {
        if (this._store.shortcutList.selectedIndex !== index) {
            this._store.shortcutList.selectedIndex = index;
            this._store.hashTagList.selectedIndex  = -1;

            this._shortcutSelection.onNext(index);
            this._hashTagSelection.onNext(-1);
        }
    }

    handleShortcutItemRightClick(index : number) : void {
        if (this._store.shortcutList.selectedIndex !== index) {
            this._store.shortcutList.selectedIndex = index;
            this._store.hashTagList.selectedIndex  = -1;

            this._detailListPresenter.refresh();
        }

        const self : any = this;

        if (index === 0) {
            this._database.countAll().then(count => AppUtils.showContextMenu(this._store, self, this._database, index, this._store.shortcutList, {
                name       : 'Everything',
                canImport  : true,
                canExport  : count > 0,
                canArchive : count > 0,
                canDelete  : false,
                canRestore : false
            })).catch(error => EventUtils.broadcast('app.error', error));
        } else if (index === 1) {
            this._database.countStarred().then(count => AppUtils.showContextMenu(this._store, self, this._database, index, this._store.shortcutList, {
                name       : 'Starred',
                canImport  : true,
                canExport  : count > 0,
                canArchive : count > 0,
                canDelete  : false,
                canRestore : false
            })).catch(error => EventUtils.broadcast('app.error', error));
        } else if (index === 2) {
            this._database.countArchived().then(count => AppUtils.showContextMenu(this._store, self, this._database, index, this._store.shortcutList, {
                name       : 'Archived',
                canImport  : false,
                canExport  : count > 0,
                canArchive : false,
                canDelete  : count > 0,
                canRestore : count > 0
            })).catch(error => EventUtils.broadcast('app.error', error));
        }
    }

    handleHashTagItemClick(index : number) : void {
        if (this._store.hashTagList.selectedIndex !== index) {
            this._store.shortcutList.selectedIndex = -1;
            this._store.hashTagList.selectedIndex  = index;

            this._shortcutSelection.onNext(-1);
            this._hashTagSelection.onNext(index);
        }
    }

    handleHashTagItemRightClick(index : number) : void {
        if (this._store.hashTagList.selectedIndex !== index) {
            this._store.shortcutList.selectedIndex = -1;
            this._store.hashTagList.selectedIndex  = index;

            this._hashTagListPresenter.refresh();
        }

        const self    : any    = this;
        const hashTag : string = this._store.hashTagList.items[index].primaryText;

        this._database.countArchived().then(count => AppUtils.showContextMenu(this._store, self, this._database, index, this._store.hashTagList, {
            name       : '#' + hashTag,
            canImport  : true,
            canExport  : count > 0,
            canArchive : count > 0,
            canDelete  : false,
            canRestore : false
        })).catch(error => EventUtils.broadcast('app.error', error));
    }

    handleNoteItemClick(index : number) : void {
        if (this._store.detailList.selectedIndex !== index) this._store.detailList.selectedIndex = index;
    }

    handleAddNoteClick() : void {
        this._detailListPresenter.addItem().then(() => this._store.detailList.selectedIndex = 0).catch(error => EventUtils.broadcast('app.error', error));
    }

    handleStarNoteClick() : void {
        const record : ?Record = this._store.editor.record;

        if (record) {
            record.starred = !record.starred;

            this._database.addOrUpdate(record.toDoc()).then(() : void => this._shortcutListPresenter.refresh()).catch(error => EventUtils.broadcast('app.error', error));
        }
    }

    handleArchiveNoteClick() : void {
        const record : ?Record = this._store.editor.record;

        if (record) {
            record.archived = !record.archived;

            this._database.addOrUpdate(record.toDoc()).then(() : void => this._shortcutListPresenter.refresh()).catch(error => EventUtils.broadcast('app.error', error));
        }
    }

    handleHashTagsChanged(hashTags : string[]) : void {
        if (this._store.editor.record) {
            const record : Record = this._store.editor.record;

            record.hashTags      = hashTags;
            record.lastUpdatedAt = Date.now();

            this._store.editor.record = record;

            this._database.addOrUpdate(record.toDoc()).catch(error => EventUtils.broadcast('app.error', error));
        }
    }

    refreshShortcutList() : void {
        this._shortcutListPresenter.refresh();

        this._store.shortcutList.selectedIndex = 0;
        this._store.detailList.selectedIndex   = -1;
    }

    refreshHashTagList() : void {
        this._hashTagListPresenter.refresh();

        this._store.detailList.selectedIndex = -1;
    }

    refreshDetailList() : void {
        this._detailListPresenter.refresh();

        this.refreshEditor().catch(error => EventUtils.broadcast('app.error', error));
    }

    refreshEditor() : Promise<*> {
        return new Promise((resolve, reject) => this._editorPresenter.load(this._store.detailList.selectedItemId).then(() => {
            if (this._store.editor.record) this._store.hashTags.chips = this._store.editor.record.hashTags;
        }).catch(reject));
    }

    filterDetailList(keyword : ?string) : void {
        this._detailListPresenter.keyword = keyword;

        this._store.detailList.selectedIndex = -1;
    }

    updateNotesSorting(index : number) : void {
        this._store.sorting               = Constants.SORTINGS[index];
        this._detailListPresenter.sorting = Constants.SORTINGS[index];

        Settings.set('sorting', index).catch(error => EventUtils.broadcast('app.error', error));
    }

    showMasterList(show : boolean) : void {
        this._store.masterListShown = show;

        AppUtils.updateMenu(this._store).catch(error => EventUtils.broadcast('app.error', error));
    }

    showDetailList(show : boolean) : void {
        this._store.detailListShown = show;

        AppUtils.updateMenu(this._store).catch(error => EventUtils.broadcast('app.error', error));
    }

    resetDatabase() : void {
        AppUtils.resetDatabase(this._database);
    }

    _instantiate() : void {
        this._shortcutListPresenter = new ShortcutListPresenter(this._database);
        this._hashTagListPresenter  = new HashTagListPresenter(this._database);
        this._detailListPresenter   = new DetailListPresenter(this._database, this._shortcutListPresenter.store, this._hashTagListPresenter.store);
        this._editorPresenter       = new EditorPresenter(this._database);
        this._hashTagPresenter      = new ChippedTextFieldPresenter();

        this._store.shortcutList = this._shortcutListPresenter.store;
        this._store.hashTagList  = this._hashTagListPresenter.store;
        this._store.detailList   = this._detailListPresenter.store;
        this._store.editor       = this._editorPresenter.store;
        this._store.hashTags     = this._hashTagPresenter.store;

        this._store.booleanDialog = new BooleanDialogStore();
        this._store.themeDialog   = new ListDialogStore();
        this._store.fontDialog    = new ListDialogStore();
        this._store.aboutDialog   = new BooleanDialogStore();

        this._store.editorSettings = new EditorSettingsDialogStore();

        this._shortcutSelection = new Rx.Subject();
        this._hashTagSelection  = new Rx.Subject();
    }

    _initSettings() : Promise<*> {
        return new Promise((resolve, reject) => Promise.all([
            Settings.get('masterListShown',     true),
            Settings.get('detailListShown',     true),
            Settings.get('masterListWidth',     Constants.MASTER_LIST_MIN_WIDTH),
            Settings.get('detailListWidth',     Constants.DETAIL_LIST_MIN_WIDTH),
            Settings.get('theme',               Config.defaultTheme),
            Settings.get('font',                undefined),
            Settings.get('fontFamily',          undefined),
            Settings.get('textSize',            Constants.FONT_SIZE_MONOSPACED),
            Settings.get('highlightActiveLine', Config.defaultHighlightActiveLine),
            Settings.get('tabSize',             Config.defaultTabSize),
            Settings.get('useSoftTabs',         Config.defaultUseSoftTabs),
            Settings.get('wordWrap',            Config.defaultWordWrap),
            Settings.get('showLineNumbers',     Config.defaultShowLineNumbers),
            Settings.get('showPrintMargin',     Config.defaultShowPrintMargin),
            Settings.get('printMarginColumn',   Config.defaultPrintMarginColumn),
            Settings.get('showInvisibles',      Config.defaultShowInvisibles),
            Settings.get('showFoldWidgets',     Config.defaultShowFoldWidgets),
            Settings.get('showGutter',          Config.defaultShowGutter),
            Settings.get('scrollPastEnd',       Config.defaultScrollPastEnd),
            Settings.get('sorting',             Config.defaultSorting)
        ]).then(values => {
            let i = 0;

            this._store.masterListShown = values[i] !== undefined ? values[i] : true;                            i++;
            this._store.detailListShown = values[i] !== undefined ? values[i] : true;                            i++;
            this._store.masterListWidth = values[i] !== undefined ? values[i] : Constants.MASTER_LIST_MIN_WIDTH; i++;
            this._store.detailListWidth = values[i] !== undefined ? values[i] : Constants.DETAIL_LIST_MIN_WIDTH; i++;
            this._store.editor.theme    = values[i] !== undefined ? values[i] : Config.defaultTheme;             i++;

            if (values[i] !== undefined) EventUtils.broadcast('editor.font.change', values[i]); i++;

            this._store.editor.fontFamily = values[i] !== undefined ? values[i] : undefined;                      i++;
            this._store.editor.textSize   = values[i] !== undefined ? values[i] : Constants.FONT_SIZE_MONOSPACED; i++;

            const data = {};

            data.highlightActiveLine = values[i] !== undefined ? values[i] : Config.defaultHighlightActiveLine; i++;
            data.tabSize             = values[i] !== undefined ? values[i] : Config.defaultTabSize;             i++;
            data.useSoftTabs         = values[i] !== undefined ? values[i] : Config.defaultUseSoftTabs;         i++;
            data.wordWrap            = values[i] !== undefined ? values[i] : Config.defaultWordWrap;            i++;
            data.showLineNumebrs     = values[i] !== undefined ? values[i] : Config.defaultShowLineNumbers;     i++;
            data.showPrintMargin     = values[i] !== undefined ? values[i] : Config.defaultShowPrintMargin;     i++;
            data.printMarginColumn   = values[i] !== undefined ? values[i] : Config.defaultPrintMarginColumn;   i++;
            data.showInvisibles      = values[i] !== undefined ? values[i] : Config.defaultShowInvisibles;      i++;
            data.showFoldWidgets     = values[i] !== undefined ? values[i] : Config.defaultShowFoldWidgets;     i++;
            data.showGutter          = values[i] !== undefined ? values[i] : Config.defaultShowGutter;          i++;
            data.scrollPastEnd       = values[i] !== undefined ? values[i] : Config.defaultScrollPastEnd;       i++;

            this._store.sorting = values[i] !== undefined ? values[i] : Config.defaultSorting;

            this._detailListPresenter.sorting = this._store.sorting;

            this._store.themeDialog.list.selectedIndex = indexOf(ThemeCodes.items,  this._store.editor.theme);

            this._store.editor.highlightActiveLine = data.highlightActiveLine;
            this._store.editor.tabSize             = data.tabSize;
            this._store.editor.useSoftTabs         = data.useSoftTabs;
            this._store.editor.wordWrap            = data.wordWrap;
            this._store.editor.showLineNumbers     = data.showLineNumebrs;
            this._store.editor.showPrintMargin     = data.showPrintMargin;
            this._store.editor.printMarginColumn   = data.printMarginColumn;
            this._store.editor.showInvisibles      = data.showInvisibles;
            this._store.editor.showFoldWidgets     = data.showFoldWidgets;
            this._store.editor.showGutter          = data.showGutter;
            this._store.editor.scrollPastEnd       = data.scrollPastEnd;

            EventUtils.broadcast('Editor.init', data);

            AppUtils.updateMenu(this._store).catch(error => EventUtils.broadcast('app.error', error));
            AppUtils.changeTheme(this._store, this._store.editor.theme);

            resolve();
        }).catch(reject));
    }

    _initDatabase() : Promise<*> {
        return new Promise((resolve, reject) => this._database.load(Config.databaseName).then(() => {
            this.refreshShortcutList();
            this.refreshHashTagList();
            this.refreshDetailList();

            resolve();
        }).catch(reject));
    }

    _initAutoSave() : void {
        this._store.editor.changes.subscribe((record : Record) => {
            const selectedItem   : ?ListItemStore = this._store.detailList.selectedItem;
            const selectedItemId : ?string        = this._store.detailList.selectedItemId;

            if (selectedItem && selectedItemId) this._database.findById(selectedItemId).then(() => this._database.addOrUpdate(record.toDoc())).then((doc : Object) => selectedItem.update(Record.fromDoc(doc))).catch(error => EventUtils.broadcast('app.error', error));
        });
    }
}
