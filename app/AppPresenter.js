'use strict';

import FilterListViewPresenter from './components/lists/FilterListViewPresenter';
import CategoryListViewPresenter from './components/lists/CategoryListViewPresenter';
import NoteListViewPresenter from './components/lists/NoteListViewPresenter';
import TextEditorPresenter from './components/text/TextEditorPresenter';
import AppStore from './AppStore';
import DialogStore from './components/dialogs/DialogStore';
import PromptDialogStore from './components/dialogs/PromptDialogStore';
import ListViewDialogStore from './components/dialogs/ListViewDialogStore';
import ListViewStore from './components/lists/ListViewStore';
import ListItemStore from './components/lists/ListItemStore';
import SettingsStore from './SettingsStore';
import Settings from './utils/Settings';
import Database from './data/Database';
import Record from './data/Record';
import Rx from 'rx-lite';
import SyntaxNames from './syntax-names.json';
import SyntaxCodes from './syntax-codes.json';
import ThemeNames from './theme-names.json';
import ThemeCodes from './theme-codes.json';
import Config from '../config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';
import _ from 'lodash';

if (is.dev()) PubSub.immediateExceptions = true;

const { remote } = require('electron');
const { dialog, Menu, MenuItem } = remote;

const EVENT_ERROR = 'Event.error';
const DARK_THEMES = [ 'ambiance', 'chaos', 'clouds_midnight', 'cobalt', 'idle_fingers', 'ipastic', 'kr_theme', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'terminal', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink' ];

export default class AppPresenter {
    constructor() {
        this._store    = new AppStore();
        this._settings = new Settings();
        this._database = new Database();

        this._filtersPresenter    = new FilterListViewPresenter(this._database);
        this._categoriesPresenter = new CategoryListViewPresenter(this._database);
        this._notesPresenter      = new NoteListViewPresenter(this._filtersPresenter, this._categoriesPresenter, this._database);
        this._editorPresenter     = new TextEditorPresenter(this._database);

        this._store.aboutDialogStore           = new DialogStore();
        this._store.settingsDialogStore        = new DialogStore();
        this._store.currentSyntaxListViewStore = new ListViewStore();
        this._store.defaultSyntaxListViewStore = new ListViewStore();
        this._store.themeListViewStore         = new ListViewStore();
        this._store.settingsStore              = new SettingsStore();
        this._store.filtersStore               = this._filtersPresenter.store;
        this._store.categoriesStore            = this._categoriesPresenter.store;
        this._store.notesStore                 = this._notesPresenter.store;
        this._store.editorStore                = this._editorPresenter.store;
        this._store.addCategoryDialogStore     = new PromptDialogStore();
        this._store.updateCategoryDialogStore  = new PromptDialogStore();
        this._store.selectCategoryDialogStore  = new ListViewDialogStore();

        this._filterSelection   = new Rx.Subject();
        this._categorySelection = new Rx.Subject();
        this._noteSelection     = new Rx.Subject();

        Rx.Observable.zip(this._filterSelection, this._categorySelection, (selectedFilterIndex, selectedCategoryIndex) => selectedFilterIndex > -1 || selectedCategoryIndex > -1)
            .subscribe(hasSelection => {
                this._store.addNoteEnabled = hasSelection;

                this.refreshNotes();
            });

        //region Settings master-detail pane

        this._store.settingsPaneStore = new ListViewStore();

        const editorSetting = new ListItemStore();
        editorSetting.itemId      = 'setting-editor';
        editorSetting.primaryText = 'Editor';
        this._store.settingsPaneStore.items.push(editorSetting);

        const currentSyntaxSetting = new ListItemStore();
        currentSyntaxSetting.itemId      = 'setting-currentSyntax';
        currentSyntaxSetting.primaryText = 'Current Syntax';
        this._store.settingsPaneStore.items.push(currentSyntaxSetting);

        const defaultSyntaxSetting = new ListItemStore();
        defaultSyntaxSetting.itemId      = 'setting-defaultSyntax';
        defaultSyntaxSetting.primaryText = 'Default Syntax';
        this._store.settingsPaneStore.items.push(defaultSyntaxSetting);

        const themeSetting = new ListItemStore();
        themeSetting.itemId      = 'setting-theme';
        themeSetting.primaryText = 'Theme';
        this._store.settingsPaneStore.items.push(themeSetting);

        SyntaxNames.items.forEach((syntaxName, i) => {
            const currentItem = new ListItemStore();
            const defaultItem = new ListItemStore();

            currentItem.itemId      = 'setting-currentSyntax-' + SyntaxCodes[i];
            defaultItem.itemId      = 'setting-defaultSyntax-' + SyntaxCodes[i];
            currentItem.primaryText = syntaxName;
            defaultItem.primaryText = syntaxName;

            this._store.currentSyntaxListViewStore.items.push(currentItem);
            this._store.defaultSyntaxListViewStore.items.push(defaultItem);
        });

        ThemeNames.items.forEach((themeName, i) => {
            const item = new ListItemStore();

            item.itemId      = 'setting-theme-' + ThemeCodes[i];
            item.primaryText = themeName;

            this._store.themeListViewStore.items.push(item);
        });

        //endregion
    }

    get store() {
        return this._store;
    }

    init() {
        this._initSettings()
            .then(() => this._initDatabase()
                .then(() => this._initAutoSave())
                .catch(error => console.error(error)))
            .catch(error => console.error(error));
    }

    //region Event handlers

    handleFilterItemClick(index) {
        if (this._store.filtersStore.selectedIndex !== index) {
            console.trace('Selected filter index = ' + index);

            this._store.filtersStore.selectedIndex    = index;
            this._store.categoriesStore.selectedIndex = -1;

            this._filterSelection.onNext(index);
            this._categorySelection.onNext(-1);
        }
    }

    handleFilterItemRightClick(index) {
        const menu = new Menu();

        menu.append(new MenuItem({
            label : 'Delete notes',
            click : () => {
                dialog.showMessageBox(remote.getCurrentWindow(), {
                    type      : 'question',
                    title     : 'Delete notes',
                    message   : 'Are you sure you want to delete the notes?',
                    buttons   : [ 'Yes', 'No' ],
                    defaultId : 0,
                    cancelId  : 1
                }, response => {
                    if (response === 0) {
                        let promise;

                        if (index === 0) {
                            promise = this._database.removeByEverything();
                        } else if (index === 1) {
                            promise = this._database.removeByStarred();
                        } else if (index === 2) {
                            promise = this._database.removeByArchived();
                        }

                        if (promise) {
                            promise.then(() => {
                                this._categoriesPresenter.notifyDataSetChanged();

                                this._notesPresenter.refresh();
                            }).catch(error => console.error(error));
                        }
                    }
                });
            }
        }));

        menu.popup(remote.getCurrentWindow());
    }

    handleCategoryItemClick(index) {
        if (this._store.categoriesStore.selectedIndex !== index) {
            console.trace('Selected category index = ' + index);

            this._store.filtersStore.selectedIndex    = -1;
            this._store.categoriesStore.selectedIndex = index;

            this._filterSelection.onNext(-1);
            this._categorySelection.onNext(index);
        }
    }

    handleCategoryItemRightClick(index) {
        const category = this._store.categoriesStore.items[index].primaryText;
        const menu     = new Menu();

        menu.append(new MenuItem({
            label : 'Rename ' + category,
            click : () => {
                this._store.updateCategoryDialogStore.value   = category;
                this._store.updateCategoryDialogStore.visible = true;
            }
        }));

        menu.append(new MenuItem({
            type : 'separator'
        }));

        menu.append(new MenuItem({
            label : 'Delete ' + category,
            click : () => {
                dialog.showMessageBox(remote.getCurrentWindow(), {
                    type      : 'question',
                    title     : 'Delete category',
                    message   : 'Are you sure you want to delete category "' + category + '"?',
                    buttons   : [ 'Yes', 'No' ],
                    defaultId : 0,
                    cancelId  : 1
                }, response => {
                    if (response === 0) {
                        this._database.removeCategory(category)
                            .then(() => {
                                this._categoriesPresenter.notifyDataSetChanged();

                                if (this._store.categoriesStore.selectedIndex < 0) {
                                    this._notesPresenter.refresh();
                                }
                            }).catch(error => console.error(error));
                    }
                });
            }
        }));

        menu.append(new MenuItem({
            label : 'Delete ' + category + ' and notes',
            click : () => {
                dialog.showMessageBox(remote.getCurrentWindow(), {
                    type      : 'question',
                    title     : 'Delete category and notes',
                    message   : 'Are you sure you want to delete category "' + category + '" and its notes?',
                    buttons   : [ 'Yes', 'No' ],
                    defaultId : 0,
                    cancelId  : 1
                }, response => {
                    if (response === 0) {
                        this._database.removeCategory(category, true)
                            .then(() => {
                                this._categoriesPresenter.notifyDataSetChanged();

                                if (this._store.categoriesStore.selectedIndex < 0) {
                                    this._notesPresenter.refresh();
                                }
                            }).catch(error => console.error(error));
                    }
                });
            }
        }));

        menu.append(new MenuItem({
            label : 'Delete notes',
            click : () => {
                dialog.showMessageBox(remote.getCurrentWindow(), {
                    type      : 'question',
                    title     : 'Delete notes',
                    message   : 'Are you sure you want to delete notes of category "' + category + '"?',
                    buttons   : [ 'Yes', 'No' ],
                    defaultId : 0,
                    cancelId  : 1
                }, response => {
                    if (response === 0) {
                        this._database.removeByCategory(category)
                            .then(() => {
                                this._categoriesPresenter.notifyDataSetChanged();

                                this._notesPresenter.refresh();
                            }).catch(error => console.error(error));
                    }
                });
            }
        }));

        menu.popup(remote.getCurrentWindow());
    }

    handleNoteItemClick(index) {
        if (this._store.notesStore.selectedIndex !== index) {
            console.trace('Selected note index = ' + index);

            this._store.notesStore.selectedIndex = index;

            this._noteSelection.onNext(index);

            this.refreshEditor();
        }
    }

    handleNotesSortingClick() {
        const menu = new Menu();

        menu.append(new MenuItem({
            label : 'Name ▲',
            click : () => this._updateNotesSorting(0)
        }));

        menu.append(new MenuItem({
            label : 'Name ▼',
            click : () => this._updateNotesSorting(1)
        }));

        menu.append(new MenuItem({
            label : 'Last updated ▲',
            click : () => this._updateNotesSorting(2)
        }));

        menu.append(new MenuItem({
            label : 'Last updated ▼',
            click : () => this._updateNotesSorting(3)
        }));

        menu.append(new MenuItem({
            label : 'Created ▲',
            click : () => this._updateNotesSorting(4)
        }));

        menu.append(new MenuItem({
            label : 'Created ▼',
            click : () => this._updateNotesSorting(5)
        }));

        menu.popup(remote.getCurrentWindow());
    }

    handleAddCategoryClick() {
        this._store.addCategoryDialogStore.visible = true;
    }

    handleAddNoteClick() {
        this._notesPresenter.addNote(this._defaultSyntax)
            .then(() => {
                this._store.notesStore.selectedIndex = 0;

                this.refreshEditor();

                this._noteSelection.onNext(0);
            }).catch(error => console.error(error));
    }

    handleStarClick() {
        this._store.editorStore.record.starred = !this._store.editorStore.record.starred;

        this._database.addOrUpdate(this._store.editorStore.record.toDoc())
            .then(() => this._filtersPresenter.refresh())
            .catch(error => console.error(error));
    }

    handleArchiveClick() {
        this._store.editorStore.record.archived = !this._store.editorStore.record.archived;

        this._database.addOrUpdate(this._store.editorStore.record.toDoc())
            .then(() => this._filtersPresenter.refresh())
            .catch(error => console.error(error));
    }

    handleSelectCategoryClick() {
        this._database.findCategories()
            .then(categories => {
                this._store.selectCategoryDialogStore.list.items = [];

                const selectedCategory = this._store.categoriesStore.selectedItem;

                categories.forEach(category => {
                    const item = new ListItemStore();

                    item.itemId      = category;
                    item.primaryText = category;
                    item.selected    = selectedCategory ? selectedCategory.primaryText === category : false;

                    this._store.selectCategoryDialogStore.list.items.push(item);
                });

                this._store.selectCategoryDialogStore.visible = true;
            }).catch(error => console.error(error));
    }

    /**
     * @param {number} index The category item index the user selects.
     */
    handleSelectCategoryItemClick(index) {
        console.trace('Selected category index in dialog = ' + index);

        if (this._store.selectCategoryDialogStore.list.selectedIndex !== index) {
            this._store.selectCategoryDialogStore.list.selectedIndex = index;
        }
    }

    handleSelectCategoryOkClick() {
        this._store.editorStore.record.category = this._store.selectCategoryDialogStore.list.selectedItem.primaryText;
        this._store.editorStore.changes.onNext(this._store.editorStore.record);

        console.trace('Changed category to ' + this._store.editorStore.record.category);

        this._categoriesPresenter.notifyDataSetChanged();

        this._store.selectCategoryDialogStore.visible = false;
    }

    handleSelectCategoryNoneClick() {
        this._store.editorStore.record.category = null;
        this._store.editorStore.changes.onNext(this._store.editorStore.record);

        console.trace('Uncategorized');

        this._categoriesPresenter.notifyDataSetChanged();

        this._store.selectCategoryDialogStore.visible = false;
    }

    //endregion

    //region Refresh operations

    refreshFilters() {
        this._store.notesStore.selectedItemId = undefined;

        this._filtersPresenter.refresh();
        this.refreshEditor();

        this._noteSelection.onNext(-1);
    }

    refreshCategories() {
        this._store.notesStore.selectedItemId = undefined;

        this._categoriesPresenter.refresh();
        this.refreshEditor();

        this._noteSelection.onNext(-1);
    }

    refreshNotes() {
        this._notesPresenter.refresh();
        this.refreshEditor();
    }

    refreshEditor() {
        console.trace('Selected note id = ' + this._store.notesStore.selectedItemId);

        this._editorPresenter.load(this._store.notesStore.selectedItemId)
            .then(() => {
                if (this._store.notesStore.selectedItemId) {
                    this._updateSyntaxMenu();
                }
            }).catch(error => console.error(error));
    }

    //endregion

    //region Application operations

    /**
     * Adds a new category.
     * @param {String} category
     */
    addCategory(category) {
        if (_.isEmpty(category)) {
            PubSub.publish(EVENT_ERROR, 'Please enter the name of the new category');
        } else {
            this._database.addCategory(category)
                .then(() => {
                    this._store.addCategoryDialogStore.visible = false;

                    this._categoriesPresenter.notifyDataSetChanged();
                }).catch(error => {
                    console.error(error);

                    PubSub.publish(EVENT_ERROR, error.message);
                });
        }
    }

    /**
     * Updates an existing category with the specified category.
     * @param {String} oldCategory
     * @param {String} newCategory
     */
    updateCategory(oldCategory, newCategory) {
        this._database.updateCategory(oldCategory, newCategory)
            .then(() => {
                this._store.updateCategoryDialogStore.visible = false;

                this._categoriesPresenter.notifyDataSetChanged();
            }).catch(error => {
                console.error(error);

                PubSub.publish(EVENT_ERROR, error.message);
            });
    }

    /**
     * Filters the note list by the specified keyword.
     * @param {String} keyword
     */
    filterNoteList(keyword) {
        this._store.notesStore.selectedIndex = -1;
        this._notesPresenter.keyword         = keyword;

        this.refreshEditor();
    }

    //endregion

    //region UI operations

    /**
     * Shows or hides filter list view.
     * @param {bool} show
     */
    showFilterList(show) {
        this._store.showFilterList = show;
    }

    /**
     * Shows or hides note list view.
     * @param {bool} show
     */
    showNoteList(show) {
        this._store.showNoteList = show;
    }

    /**
     * @param {String} syntax
     */
    changeCurrentSyntax(syntax) {
        this._store.editorStore.syntax = syntax;

        if (this._store.editorStore.record) {
            this._store.editorStore.record.syntax = syntax;

            this._store.editorStore.changes.onNext(this._store.editorStore.record);
        }
    }

    /**
     * @param {String} syntax
     */
    changeDefaultSyntax(syntax) {
        this._settings.set('defaultSyntax', syntax).catch(error => console.error(error));
    }

    /**
     * @param {String} theme
     */
    changeTheme(theme) {
        this._store.editorStore.theme = theme;

        this._updateTheme();

        this._settings.set('theme', theme)
            .catch(error => console.error(error));
    }

    changeSettings(data) {
        if (data.name === 'highlightActiveLine') {
            this._store.editorStore.highlightActiveLine = data.value;
        } else if (data.name === 'tabSize') {
            this._store.editorStore.tabSize = data.value;
        } else if (data.name === 'useSoftTabs') {
            this._store.editorStore.useSoftTabs = data.value;
        } else if (data.name === 'wordWrap') {
            this._store.editorStore.wordWrap = data.value;
        } else if (data.name === 'showLineNumbers') {
            this._store.editorStore.showLineNumbers = data.value;
        } else if (data.name === 'showPrintMargin') {
            this._store.editorStore.showPrintMargin = data.value;
        } else if (data.name === 'printMarginColumn') {
            this._store.editorStore.printMarginColumn = data.value;
        } else if (data.name === 'showInvisibles') {
            this._store.editorStore.showInvisibles = data.value;
        } else if (data.name === 'showFoldWidgets') {
            this._store.editorStore.showFoldWidgets = data.value;
        } else if (data.name === 'showGutter') {
            this._store.editorStore.showGutter = data.value;
        } else if (data.name === 'displayIndentGuides') {
            this._store.editorStore.displayIndentGuides = data.value;
        } else if (data.name === 'scrollPastEnd') {
            this._store.editorStore.scrollPastEnd = data.value;
        } else {
            console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
        }

        this._settings.set(data.name, data.value)
            .then(() => console.trace('Saved setting ' + data.name + ' = ' + data.value))
            .catch(error => console.error(error));
    }

    //endregion

    //region Debug operations

    resetDatabase() {
        this._database.removeAll();
    }

    resetSettings() {
        this._settings.clear()
            .catch(error => console.error(error));
    }

    //endregion

    //region Private methods

    _initSettings() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._settings.get('showFilterList',      Config.defaultShowFilterList),
                this._settings.get('showNoteList',        Config.defaultShowNoteList),
                this._settings.get('filterListWidth',     Config.filterListWidth),
                this._settings.get('noteListWidth',       Config.noteListWidth),
                this._settings.get('defaultSyntax',       Config.defaultSyntax),
                this._settings.get('theme',               Config.defaultTheme),
                this._settings.get('fontFamily',          undefined),
                this._settings.get('textSize',            undefined),
                this._settings.get('highlightActiveLine', Config.defaultHighlightActiveLine),
                this._settings.get('tabSize',             Config.defaultTabSize),
                this._settings.get('useSoftTabs',         Config.defaultUseSoftTabs),
                this._settings.get('wordWrap',            Config.defaultWordWrap),
                this._settings.get('showLineNumbers',     Config.defaultShowLineNumbers),
                this._settings.get('showPrintMargin',     Config.defaultShowPrintMargin),
                this._settings.get('printMarginColumn',   Config.defaultPrintMarginColumn),
                this._settings.get('showInvisibles',      Config.defaultShowInvisibles),
                this._settings.get('showFoldWidgets',     Config.defaultShowFoldWidgets),
                this._settings.get('showGutter',          Config.defaultShowGutter),
                this._settings.get('displayIndentGuides', Config.defaultDisplayIndentGuides),
                this._settings.get('scrollPastEnd',       Config.defaultScrollPastEnd),
                this._settings.get('notesSorting',        Config.defaultNotesSorting)
            ]).then(values => {
                this._store.showFilterList  = values[0]  !== undefined ? values[0]  : Config.defaultShowFilterList;
                this._store.showNoteList    = values[1]  !== undefined ? values[1]  : Config.defaultShowNoteList;
                this._store.filterListWidth = values[2]  !== undefined ? values[2]  : Config.filterListWidth;
                this._store.noteListWidth   = values[3]  !== undefined ? values[3]  : Config.noteListWidth;
                this._store.notesSorting    = values[20] !== undefined ? values[20] : Config.defaultNotesSorting;

                this._store.defaultSyntaxListViewStore.selectedIndex = _.indexOf(SyntaxCodes.items, values[4] !== undefined ? values[4] : Config.defaultSyntax);
                this._store.themeListViewStore.selectedIndex         = _.indexOf(ThemeCodes.items,  values[5] !== undefined ? values[5] : Config.defaultTheme);

                const data = {};

                data.highlightActiveLine = values[8]  !== undefined ? values[8]  : Config.defaultHighlightActiveLine;
                data.tabSize             = values[9]  !== undefined ? values[9]  : Config.defaultTabSize;
                data.useSoftTabs         = values[10] !== undefined ? values[10] : Config.defaultUseSoftTabs;
                data.wordWrap            = values[11] !== undefined ? values[11] : Config.defaultWordWrap;
                data.showLineNumebrs     = values[12] !== undefined ? values[12] : Config.defaultShowLineNumbers;
                data.showPrintMargin     = values[13] !== undefined ? values[13] : Config.defaultShowPrintMargin;
                data.printMarginColumn   = values[14] !== undefined ? values[14] : Config.defaultPrintMarginColumn;
                data.showInvisibles      = values[15] !== undefined ? values[15] : Config.defaultShowInvisibles;
                data.showFoldWidgets     = values[16] !== undefined ? values[16] : Config.defaultShowFoldWidgets;
                data.showGutter          = values[17] !== undefined ? values[17] : Config.defaultShowGutter;
                data.displayIndentGuides = values[18] !== undefined ? values[18] : Config.defaultDisplayIndentGuides;
                data.scrollPastEnd       = values[19] !== undefined ? values[19] : Config.defaultScrollPastEnd;

                this._store.settingsStore.highlightCurrentLine.checked = data.highlightActiveLine;
                this._store.settingsStore.tabSize2.checked             = data.tabSize === 2;
                this._store.settingsStore.tabSize4.checked             = data.tabSize === 4;
                this._store.settingsStore.tabSize8.checked             = data.tabSize === 8;
                this._store.settingsStore.useSoftTabs.checked          = data.useSoftTabs;
                this._store.settingsStore.wordWrap.checked             = data.wordWrap;
                this._store.settingsStore.showLineNumbers.checked      = data.showLineNumebrs;
                this._store.settingsStore.showPrintMargin.checked      = data.showPrintMargin;
                this._store.settingsStore.printMarginColumn72.checked  = data.printMarginColumn === 72;
                this._store.settingsStore.printMarginColumn80.checked  = data.printMarginColumn === 80;
                this._store.settingsStore.printMarginColumn100.checked = data.printMarginColumn === 100;
                this._store.settingsStore.printMarginColumn120.checked = data.printMarginColumn === 120;
                this._store.settingsStore.showInvisibles.checked       = data.showInvisibles;
                this._store.settingsStore.showFoldWidgets.checked      = data.showFoldWidgets;
                this._store.settingsStore.showGutter.checked           = data.showGutter;
                this._store.settingsStore.showIndentGuides.checked     = data.displayIndentGuides;
                this._store.settingsStore.scrollPastLastLine.checked   = data.scrollPastEnd;

                this._store.editorStore.syntax              = values[4] ? values[4] : Config.defaultSyntax;
                this._store.editorStore.theme               = values[5] ? values[5] : Config.defaultTheme;
                this._store.editorStore.fontFamily          = values[6] ? values[6] : undefined;
                this._store.editorStore.textSize            = values[7] ? values[7] : undefined;
                this._store.editorStore.highlightActiveLine = data.highlightActiveLine;
                this._store.editorStore.tabSize             = data.tabSize;
                this._store.editorStore.useSoftTabs         = data.useSoftTabs;
                this._store.editorStore.wordWrap            = data.wordWrap;
                this._store.editorStore.showLineNumbers     = data.showLineNumebrs;
                this._store.editorStore.showPrintMargin     = data.showPrintMargin;
                this._store.editorStore.printMarginColumn   = data.printMarginColumn;
                this._store.editorStore.showInvisibles      = data.showInvisibles;
                this._store.editorStore.showFoldWidgets     = data.showFoldWidgets;
                this._store.editorStore.showGutter          = data.showGutter;
                this._store.editorStore.displayIndentGuides = data.displayIndentGuides;
                this._store.editorStore.scrollPastEnd       = data.scrollPastEnd;

                PubSub.publish('TextEditor.init', data);

                this._updateTheme();

                resolve();
            }).catch(error => reject(error));
        });
    }

    _initDatabase() {
        return new Promise((resolve, reject) => this._database.load(Config.databaseName)
            .then(() => {
                this.refreshFilters();
                this.refreshCategories();
                this.refreshNotes();

                resolve();
            }).catch(error => reject(error)));
    }

    _initAutoSave() {
        this._store.editorStore.changes.subscribe(record => {
            console.trace('Auto save record ' + this._store.notesStore.selectedItemId);
            console.trace(record);

            this._database.findById(this._store.notesStore.selectedItemId)
                .then(() => {
                    console.trace('Found record ' + record._id);

                    this._database.addOrUpdate(record.toDoc())
                        .then(doc => {
                            console.trace('Saved record ' + doc._id);

                            this._store.notesStore.selectedItem.update(Record.fromDoc(doc));
                        }).catch(error => console.error(error));
                }).catch(error => console.error(error));
        });
    }

    _updateTheme() {
        this._store.theme = _.indexOf(DARK_THEMES, this._store.editorStore.theme) > -1 ? 'dark' : 'light';
    }

    /**
     * @param {number} sorting
     * @private
     */
    _updateNotesSorting(sorting) {
        this._store.notesSorting     = sorting;
        this._notesPresenter.sorting = sorting;

        this._settings.set('notesSorting', sorting).catch(error => console.error(error));
    }

    //endregion
}

module.exports = AppPresenter;
