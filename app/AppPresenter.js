// @flow
'use strict';

import FilterListPresenter from './components/lists/FilterListPresenter';
import CategoryListPresenter from './components/lists/CategoryListPresenter';
import NoteListPresenter from './components/lists/NoteListPresenter';
import NoteEditorPresenter from './components/text/NoteEditorPresenter';
import AppStore from './AppStore';
import BooleanStore from './components/BooleanStore';
import BooleanDialogStore from './components/dialogs/BooleanDialogStore';
import EditorSettingsDialogStore from './components/dialogs/EditorSettingsDialogStore';
import PromptDialogStore from './components/dialogs/PromptDialogStore';
import ListDialogStore from './components/dialogs/ListDialogStore';
import ListItemStore from './components/lists/ListItemStore';
import SettingsStore from './components/dialogs/SettingsStore';
import Settings from './utils/Settings';
import Database from './data/Database';
import Record from './data/Record.js';
import EventUtils from './utils/EventUtils';
import EnvironmentUtils from './utils/EnvironmentUtils';
import Constants from './utils/Constants';
import Config from './definitions/config.json';
import SyntaxNames from './definitions/syntax/syntax-names.json';
import SyntaxCodes from './definitions/syntax/syntax-codes.json';
import ThemeNames from './definitions/themes/theme-names.json';
import ThemeCodes from './definitions/themes/theme-codes.json';
import Rx from 'rx-lite';
import Path from 'path';
import fs from 'fs';
import indexOf from 'lodash.indexof';
import isEmpty from 'lodash.isempty';

const { remote } = require('electron');
const { dialog, Menu, MenuItem } = remote;

const CLEAR_CACHE_INTERVAL = 5 * 60 * 1000;

const EVENT_ERROR = 'global.error';
const DARK_THEMES = [ 'ambiance', 'chaos', 'clouds_midnight', 'cobalt', 'idle_fingers', 'kr_theme', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'terminal', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink' ];

const FONTS = EnvironmentUtils.isMacOS() ? require('./definitions/fonts/fonts.mac.json') : require('./definitions/fonts/fonts.win.json');

export default class AppPresenter {
    _store                 : AppStore;
    _settings              : Settings;
    _database              : Database;
    _defaultSyntax         : string;
    _filterListPresenter   : FilterListPresenter;
    _categoryListPresenter : CategoryListPresenter;
    _noteListPresenter     : NoteListPresenter;
    _noteEditorPresenter   : NoteEditorPresenter;
    _filterSelection       : any;
    _categorySelection     : any;

    constructor() {
        this._store         = new AppStore();
        this._settings      = new Settings();
        this._database      = new Database();
        this._defaultSyntax = Config.defaultSyntax;

        this._filterListPresenter   = new FilterListPresenter(this._database);
        this._categoryListPresenter = new CategoryListPresenter(this._database);
        this._noteListPresenter     = new NoteListPresenter(this._filterListPresenter, this._categoryListPresenter, this._database);
        this._noteEditorPresenter   = new NoteEditorPresenter(this._database);

        this._store.booleanDialog                 = new BooleanDialogStore();
        this._store.aboutDialog                   = new BooleanStore();
        this._store.editorSettingsDialog          = new EditorSettingsDialogStore();
        this._store.currentSyntaxDialog           = new ListDialogStore();
        this._store.defaultSyntaxDialog           = new ListDialogStore();
        this._store.themeDialog                   = new ListDialogStore();
        this._store.fontDialog                    = new ListDialogStore();
        this._store.editorSettingsDialog.settings = new SettingsStore();
        this._store.filterList                    = this._filterListPresenter.store;
        this._store.categoryList                  = this._categoryListPresenter.store;
        this._store.noteList                      = this._noteListPresenter.store;
        this._store.noteEditor                    = this._noteEditorPresenter.store;
        this._store.addCategoryDialog             = new PromptDialogStore();
        this._store.updateCategoryDialog          = new PromptDialogStore();
        this._store.selectCategoryDialog          = new ListDialogStore();

        this._filterSelection   = new Rx.Subject();
        this._categorySelection = new Rx.Subject();

        Rx.Observable.zip(this._filterSelection, this._categorySelection, (selectedFilterIndex, selectedCategoryIndex) => selectedFilterIndex > -1 || selectedCategoryIndex > -1)
            .subscribe(hasSelection => {
                this._store.addNoteEnabled = hasSelection;

                this.refreshNoteList();
            });

        this._store.noteList.selectionChanges.subscribe(() => this.refreshNoteEditor()
            .then(() => {
                if (this._store.noteList.selectedIndex > -1) {
                    const noteList = document.getElementById('noteList');

                    if (noteList) {
                        const parentElement : any = noteList.parentElement;

                        if (parentElement) parentElement.focus();
                    }
                }
            }));

        //region Setting dialogs

        SyntaxNames.items.forEach((syntaxName, i) => {
            const currentItem = new ListItemStore();
            const defaultItem = new ListItemStore();

            currentItem.itemId      = 'setting-currentSyntax-' + SyntaxCodes[i];
            defaultItem.itemId      = 'setting-defaultSyntax-' + SyntaxCodes[i];
            currentItem.primaryText = syntaxName;
            defaultItem.primaryText = syntaxName;

            this._store.currentSyntaxDialog.list.items.push(currentItem);
            this._store.defaultSyntaxDialog.list.items.push(defaultItem);
        });

        ThemeNames.items.forEach((themeName, i) => {
            const item = new ListItemStore();

            item.itemId      = 'setting-theme-' + ThemeCodes[i];
            item.primaryText = themeName;

            this._store.themeDialog.list.items.push(item);
        });

        FONTS.items.forEach((font, i) => {
            const item = new ListItemStore();

            item.itemId      = 'setting-font-' + i;
            item.primaryText = font;

            this._store.fontDialog.list.items.push(item);
        });

        //endregion
    }

    get store() : AppStore {
        return this._store;
    }

    init() : void {
        this._initSettings()
            .then(() => this._initDatabase())
            .then(() => this._initAutoSave())
            .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));

        AppPresenter._clearCache();
    }

    //region Event handlers

    //region Filter operations

    handleFilterItemClick(index : number)  : void {
        if (this._store.filterList.selectedIndex !== index) {
            this._store.filterList.selectedIndex   = index;
            this._store.categoryList.selectedIndex = -1;

            this._filterSelection.onNext(index);
            this._categorySelection.onNext(-1);
        }
    }

    handleFilterItemRightClick(index : number) : void {
        if (this._store.filterList.selectedIndex !== index) {
            this._store.filterList.selectedIndex   = index;
            this._store.categoryList.selectedIndex = -1;

            this._noteListPresenter.refresh();
        }

        let countPromise;

        if (index === 0) {
            countPromise = this._database.countAll();
        } else if (index === 1) {
            countPromise = this._database.countByStarred();
        } else if (index === 2) {
            countPromise = this._database.countByArchived();
        }

        if (countPromise) {
            countPromise.then(count => {
                const menu = new Menu();

                menu.append(new MenuItem({
                    label : 'Import notes…',
                    click : () => {
                        this._store.filterList.selectedIndex   = index;
                        this._store.categoryList.selectedIndex = -1;

                        this.handleImportNotes();
                    }
                }));

                if (count > 0) {
                    menu.append(new MenuItem({
                        label : 'Export all notes…',
                        click : () => {
                            this._store.filterList.selectedIndex   = index;
                            this._store.categoryList.selectedIndex = -1;

                            this.handleExportNotes();
                        }
                    }));
                }

                menu.append(new MenuItem({
                    type : 'separator'
                }));

                if (index === 2) {
                    menu.append(new MenuItem({
                        label : 'Restore notes',
                        click : () => this._database.unarchiveAll().catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()))
                    }));
                }

                const action = index === 2 ? 'Delete' : 'Archive';

                menu.append(new MenuItem({
                    label : action + ' all notes…',
                    click : () => {
                        this._store.booleanDialog.title          = action + ' notes';
                        this._store.booleanDialog.message        = 'Are you sure you want to ' + action.toLowerCase() + ' the notes?';
                        this._store.booleanDialog.trueLabel      = 'Yes';
                        this._store.booleanDialog.falseLabel     = 'No';
                        this._store.booleanDialog.trueLabelColor = 'secondary';
                        this._store.booleanDialog.booleanValue   = true;

                        this._store.booleanDialog.trueAction = () => {
                            let updatePromise;

                            if (index === 0) {
                                updatePromise = this._database.archiveByEverything();
                            } else if (index === 1) {
                                updatePromise = this._database.archiveByStarred();
                            } else if (index === 2) {
                                updatePromise = this._database.removeByArchived();
                            }

                            if (updatePromise) {
                                updatePromise.then(() => {
                                    this._filterListPresenter.refresh();
                                    this._categoryListPresenter.refresh();
                                    this._noteListPresenter.refresh();
                                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                            }
                        };
                    }
                }));

                menu.popup(remote.getCurrentWindow());
            }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    //endregion

    //region Category operations

    handleCategoryItemClick(index : number) : void {
        if (this._store.categoryList.selectedIndex !== index) {
            this._store.filterList.selectedIndex   = -1;
            this._store.categoryList.selectedIndex = index;

            this._filterSelection.onNext(-1);
            this._categorySelection.onNext(index);
        }
    }

    handleCategoryItemRightClick(index : number) : void {
        if (this._store.categoryList.selectedIndex !== index) {
            this._store.filterList.selectedIndex   = -1;
            this._store.categoryList.selectedIndex = index;

            this._noteListPresenter.refresh();
        }

        const category = this._store.categoryList.items[index].primaryText;

        this._database.countByCategory(category)
            .then(count => {
                const menu = new Menu();

                menu.append(new MenuItem({
                    label : 'Import notes…',
                    click : () => {
                        this._store.filterList.selectedIndex   = -1;
                        this._store.categoryList.selectedIndex = index;

                        this.handleImportNotes();
                    }
                }));

                if (count > 0) {
                    menu.append(new MenuItem({
                        label : 'Export all notes…',
                        click : () => {
                            this._store.filterList.selectedIndex   = -1;
                            this._store.categoryList.selectedIndex = index;

                            this.handleExportNotes();
                        }
                    }));
                }

                menu.append(new MenuItem({
                    label : 'Rename ' + category + '…',
                    click : () => {
                        this._store.updateCategoryDialog.value        = category;
                        this._store.updateCategoryDialog.booleanValue = true;
                    }
                }));

                menu.append(new MenuItem({
                    type : 'separator'
                }));

                menu.append(new MenuItem({
                    label : 'Delete ' + category + '…',
                    click : () => {
                        this._store.booleanDialog.title          = 'Delete category';
                        this._store.booleanDialog.message        = 'Are you sure you want to delete category "' + category + '"?';
                        this._store.booleanDialog.trueLabel      = 'Yes';
                        this._store.booleanDialog.falseLabel     = 'No';
                        this._store.booleanDialog.trueLabelColor = 'secondary';
                        this._store.booleanDialog.booleanValue   = true;

                        this._store.booleanDialog.trueAction = () => {
                            this._database.removeCategory(category)
                                .then(() => {
                                    this._categoryListPresenter.notifyDataSetChanged();

                                    if (this._store.categoryList.selectedIndex < 0) {
                                        this._noteListPresenter.refresh();
                                    }
                                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                        };
                    }
                }));

                menu.append(new MenuItem({
                    label : 'Delete ' + category + ' and notes…',
                    click : () => {
                        this._store.booleanDialog.title          = 'Delete category and archive notes';
                        this._store.booleanDialog.message        = 'Are you sure you want to delete category "' + category + '" and archive its notes?';
                        this._store.booleanDialog.trueLabel      = 'Yes';
                        this._store.booleanDialog.falseLabel     = 'No';
                        this._store.booleanDialog.trueLabelColor = 'secondary';
                        this._store.booleanDialog.booleanValue   = true;

                        this._store.booleanDialog.trueAction = () => {
                            this._database.removeCategory(category, true)
                                .then(() => {
                                    this._filterListPresenter.refresh();
                                    this._categoryListPresenter.notifyDataSetChanged();

                                    if (this._store.categoryList.selectedIndex < 0) {
                                        this._noteListPresenter.refresh();
                                    }
                                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                        };
                    }
                }));

                menu.append(new MenuItem({
                    label : 'Archive all notes…',
                    click : () => {
                        this._store.booleanDialog.title          = 'Archive notes';
                        this._store.booleanDialog.message        = 'Are you sure you want to archive all notes of category "' + category + '"?';
                        this._store.booleanDialog.trueLabel      = 'Yes';
                        this._store.booleanDialog.falseLabel     = 'No';
                        this._store.booleanDialog.trueLabelColor = 'secondary';
                        this._store.booleanDialog.booleanValue   = true;

                        this._store.booleanDialog.trueAction = () => {
                            this._database.archiveByCategory(category)
                                .then(() => {
                                    this._filterListPresenter.refresh();
                                    this._categoryListPresenter.refresh();
                                    this._noteListPresenter.refresh();
                                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                        };
                    }
                }));

                menu.popup(remote.getCurrentWindow());
            }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    handleAddCategoryClick() : void {
        this._store.addCategoryDialog.value        = '';
        this._store.addCategoryDialog.booleanValue = true;
    }

    //endregion

    //region Note operations

    handleNoteItemClick(index : number) : void {
        if (this._store.noteList.selectedIndex !== index) this._store.noteList.selectedIndex = index;
    }

    handleNoteItemRightClick(index : number) : void {
        if (this._store.noteList.selectedIndex !== index) {
            this._store.noteList.selectedIndex = index;
        }

        const menu = new Menu();

        menu.append(new MenuItem({
            label : 'Export…',
            click : () => {
                this._store.noteList.selectedIndex = index;

                this.handleExportNote();
            }
        }));

        if (this._store.filterList.selectedIndex !== 2) {
            menu.append(new MenuItem({
                label : 'Duplicate',
                click : () => {
                    this._store.noteList.selectedIndex = index;

                    this._duplicateNote();
                }
            }));
        }

        menu.append(new MenuItem({
            type : 'separator'
        }));

        const selectedItem = this._store.noteList.selectedItem;

        if (selectedItem && this._store.filterList.selectedIndex === 2) {
            menu.append(new MenuItem({
                label : 'Restore',
                click : () => {
                    this._database.unarchiveById(selectedItem.itemId)
                        .then(() => {
                            this._noteListPresenter.refresh();
                            this._filterListPresenter.refresh();
                            this._categoryListPresenter.notifyDataSetChanged();
                        }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                }
            }));
        }

        const action = this._store.filterList.selectedIndex === 2 ? 'Delete' : 'Archive';

        menu.append(new MenuItem({
            label : action + '…',
            click : () => {
                this._store.booleanDialog.title          = action + ' note';
                this._store.booleanDialog.message        = 'Are you sure you want to ' + action.toLowerCase() + ' this note?';
                this._store.booleanDialog.trueLabel      = 'Yes';
                this._store.booleanDialog.falseLabel     = 'No';
                this._store.booleanDialog.trueLabelColor = 'secondary';
                this._store.booleanDialog.booleanValue   = true;

                this._store.booleanDialog.trueAction = () => {
                    const selectedItem = this._store.noteList.selectedItem;

                    if (selectedItem && selectedItem.itemId) {
                        (this._store.filterList.selectedIndex === 2 ? this._database.removeById(selectedItem.itemId) : this._database.archiveById(selectedItem.itemId))
                            .then(() => {
                                this._noteListPresenter.refresh();
                                this._filterListPresenter.refresh();
                                this._categoryListPresenter.notifyDataSetChanged();

                                this.refreshNoteEditor();
                            }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                    }
                };
            }
        }));

        menu.popup(remote.getCurrentWindow());
    }

    handleNotesSortingClick() : void {
        const menu = new Menu();

        const appendMenuItem = (label, index) => {
            menu.append(new MenuItem({
                label : label,
                click : () => this._updateNotesSorting(index)
            }));
        };

        appendMenuItem('Name ▲', 0);
        appendMenuItem('Name ▼', 1);
        appendMenuItem('Updated ▲', 2);
        appendMenuItem('Updated ▼', 3);
        appendMenuItem('Created ▲', 4);
        appendMenuItem('Created ▼', 5);

        menu.popup(remote.getCurrentWindow());
    }

    handleAddNoteClick() : void {
        this._noteListPresenter.addNote(this._defaultSyntax)
            .then(() => {
                this._store.noteList.selectedIndex = 0;
            }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    handleImportNotes() : void {
        if (this._store.filterList.selectedIndex > -1 || this._store.categoryList.selectedIndex > -1) {
            dialog.showOpenDialog(remote.getCurrentWindow(), {
                title      : 'Import from a text file',
                filters    : [
                    {
                        name       : 'All files',
                        extensions : [ '*' ]
                    }
                ],
                properties : [ 'openFile', 'multiSelections' ]
            }, filenames => {
                if (filenames) {
                    const syntax = this._store.defaultSyntaxDialog.list.selectedIndex > -1 ? SyntaxCodes[this._store.defaultSyntaxDialog.list.selectedIndex] : Config.defaultSyntax;

                    filenames.forEach(filename => {
                        fs.readFile(filename, {
                            encoding : 'utf-8',
                            flag     : 'r'
                        }, (error, fullText) => {
                            if (error) {
                                EventUtils.broadcast(EVENT_ERROR, error.toString());
                            } else {
                                this._database.addOrUpdate(Record.fromText(syntax, fullText))
                                    .then(doc => this._store.noteList.items.unshift(Record.fromDoc(doc).toListItemStore()))
                                    .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
                            }
                        });
                    });
                }
            });
        }
    }

    handleExportNote() : void {
        const selectedItem = this._store.noteList.selectedItem;

        if (selectedItem && this._store.noteList.selectedIndex > -1) {
            dialog.showSaveDialog(remote.getCurrentWindow(), {
                title   : 'Export to a text file',
                filters : [
                    {
                        name       : 'All files',
                        extensions : [ '*' ]
                    }
                ]
            }, filename => {
                if (filename) {
                    fs.access(filename, fs.constants.F_OK, error => {
                        if (error) {
                            AppPresenter._exportNote(filename, selectedItem.record.fullText);
                        } else {
                            dialog.showMessageBox(remote.getCurrentWindow(), {
                                type      : 'question',
                                title     : 'File already exists',
                                message   : 'Are you sure you want to overwrite this file?',
                                buttons   : [ 'Yes', 'No' ],
                                defaultId : 0,
                                cancelId  : 1
                            }, response => {
                                if (response === 0) AppPresenter._exportNote(filename, selectedItem.record.fullText);
                            });
                        }
                    });
                }
            });
        }
    }

    handleExportNotes() : void {
        const selectedItem = this._store.categoryList.selectedItem;

        if (selectedItem) {
            let countPromise;

            if (this._store.filterList.selectedIndex === 0) {
                countPromise = this._database.countAll();
            } else if (this._store.filterList.selectedIndex === 1) {
                countPromise = this._database.countByStarred();
            } else if (this._store.filterList.selectedIndex === 2) {
                countPromise = this._database.countByArchived();
            } else if (this._store.categoryList.selectedIndex > -1) {
                countPromise = this._database.countByCategory(selectedItem.primaryText);
            }

            if (countPromise) {
                countPromise.then(count => {
                    if (count > 0) {
                        let findPromise;

                        if (this._store.filterList.selectedIndex === 0) {
                            findPromise = this._database.findAll(this._store.notesSorting);
                        } else if (this._store.filterList.selectedIndex === 1) {
                            findPromise = this._database.findByStarred(this._store.notesSorting);
                        } else if (this._store.filterList.selectedIndex === 2) {
                            findPromise = this._database.findByArchived(this._store.notesSorting);
                        } else if (this._store.categoryList.selectedIndex > -1) {
                            findPromise = this._database.findByCategory(selectedItem.primaryText, this._store.notesSorting);
                        }

                        if (findPromise) {
                            dialog.showOpenDialog(remote.getCurrentWindow(), {
                                title      : 'Export text files to a directory',
                                filters    : [
                                    {
                                        name       : 'All files',
                                        extensions : [ '*' ]
                                    }
                                ],
                                properties : [ 'openDirectory', 'createDirectory' ]
                            }, directory => {
                                if (directory && findPromise) findPromise.then(docs => docs.forEach(doc => AppPresenter._exportNote(Path.join(directory[0], doc._id + '.txt'), doc.fullText)));
                            });
                        }
                    }
                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
            }
        }
    }

    //endregion

    //region Editor operation

    handleStarClick() : void {
        const record : ?Record = this._store.noteEditor.record;

        if (record) {
            record.starred = !record.starred;

            this._database.addOrUpdate(record.toDoc())
                .then(() => this._filterListPresenter.refresh())
                .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    handleArchiveClick() : void {
        const record : ?Record = this._store.noteEditor.record;

        if (record) {
            record.archived = !record.archived;

            this._database.addOrUpdate(record.toDoc())
                .then(() => this._filterListPresenter.refresh())
                .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    handleSelectCategoryClick() : void {
        const record : ?Record = this._store.noteEditor.record;

        if (record) {
            this._database.findCategories()
                .then(categories => {
                    this._store.selectCategoryDialog.list.items = [];

                    categories.forEach(category => {
                        const item = new ListItemStore();

                        item.itemId      = category;
                        item.primaryText = category;
                        item.selected    = record.category ? record.category === category : false;

                        this._store.selectCategoryDialog.list.items.push(item);
                    });

                    this._store.selectCategoryDialog.booleanValue = true;
                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    /**
     * @param {number} index The category item index the user selects.
     */
    handleSelectCategoryItemClick(index : number) : void {
        if (this._store.selectCategoryDialog.list.selectedIndex !== index) this._store.selectCategoryDialog.list.selectedIndex = index;
    }

    handleSelectCategoryOkClick() : void {
        const selectedItem = this._store.selectCategoryDialog.list.selectedItem;

        if (selectedItem && this._store.selectCategoryDialog.list.selectedIndex > -1) {
            const record : ?Record = this._store.noteEditor.record;

            if (record) {
                record.category = selectedItem.primaryText;
                this._store.noteEditor.changes.onNext(record);

                this._categoryListPresenter.notifyDataSetChanged();

                this._store.selectCategoryDialog.booleanValue = false;
            }
        }
    }

    handleSelectCategoryNoneClick() : void {
        const record : ?Record = this._store.noteEditor.record;

        if (record) {
            record.category = null;
            this._store.noteEditor.changes.onNext(record);

            this._categoryListPresenter.notifyDataSetChanged();

            this._store.selectCategoryDialog.booleanValue = false;
        }
    }

    //endregion

    //endregion

    //region Refresh operations

    refreshFilterList() : void {
        this._filterListPresenter.refresh();

        this._store.filterList.selectedIndex = 0;
        this._store.noteList.selectedIndex   = -1;
    }

    refreshCategoryList() : void {
        this._categoryListPresenter.refresh();

        this._store.noteList.selectedIndex = -1;
    }

    refreshNoteList() : void {
        this._noteListPresenter.refresh();

        this.refreshNoteEditor().catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    refreshNoteEditor() : Promise<*> {
        return new Promise((resolve, reject) => {
            const itemId = this._store.noteList.selectedItemId;

            this._noteEditorPresenter.load(itemId)
                .then(() => {
                    const record : ?Record = this._store.noteEditor.record;

                    if (itemId && record) this._store.currentSyntaxDialog.list.selectedIndex = indexOf(SyntaxCodes.items, record.syntax);

                    resolve();
                }).catch(error => reject(error));
        });
    }

    //endregion

    //region Application operations

    /**
     * Adds a new category.
     * @param {String} category
     */
    addCategory(category : string) : void {
        if (isEmpty(category)) {
            EventUtils.broadcast(EVENT_ERROR, 'Please enter the name of the new category');
        } else {
            this._database.addCategory(category)
                .then(() => {
                    this._store.addCategoryDialog.booleanValue = false;

                    this._categoryListPresenter.notifyDataSetChanged();
                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    /**
     * Updates an existing category with the specified category.
     * @param {String} oldCategory
     * @param {String} newCategory
     */
    updateCategory(oldCategory : string, newCategory : string) : void {
        this._database.updateCategory(oldCategory, newCategory)
            .then(() => {
                this._store.updateCategoryDialog.booleanValue = false;

                this._categoryListPresenter.notifyDataSetChanged();
            }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    /**
     * Filters the note list by the specified keyword.
     * @param {String} keyword
     */
    filterNoteList(keyword : string) : void {
        this._noteListPresenter.keyword = keyword;

        this._store.noteList.selectedIndex = -1;
    }

    //endregion

    //region UI operations

    /**
     * Shows or hides filter list view.
     * @param {bool} show
     */
    showFilterList(show : boolean) : void {
        this._store.filterListShown = show;

        this._updateMenu();
    }

    /**
     * Shows or hides note list view.
     * @param {bool} show
     */
    showNoteList(show : boolean) : void {
        this._store.noteListShown = show;

        this._updateMenu();
    }

    /**
     * @param {String} syntax
     */
    changeCurrentSyntax(syntax : string) : void {
        this._store.noteEditor.syntax = syntax;

        if (this._store.noteEditor.record) {
            this._store.noteEditor.record.syntax = syntax;

            this._store.noteEditor.changes.onNext(this._store.noteEditor.record);
        }
    }

    /**
     * @param {String} syntax
     */
    changeDefaultSyntax(syntax : string) : void {
        this._settings.set('defaultSyntax', syntax).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    /**
     * @param {String} theme
     */
    changeTheme(theme : string) : void {
        this._store.noteEditor.theme = theme;

        this._updateTheme();

        this._settings.set('theme', theme)
            .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    /**
     * @param {String} font
     */
    changeFont(font : string) : void {
        AppPresenter._updateFont(font);

        this._settings.set('font', font)
            .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    changeSettings(data : any) : void {
        if (data.name === 'highlightActiveLine') {
            this._store.noteEditor.highlightActiveLine = data.value;
        } else if (data.name === 'tabSize') {
            this._store.noteEditor.tabSize = data.value;
        } else if (data.name === 'useSoftTabs') {
            this._store.noteEditor.useSoftTabs = data.value;
        } else if (data.name === 'wordWrap') {
            this._store.noteEditor.wordWrap = data.value;
        } else if (data.name === 'showLineNumbers') {
            this._store.noteEditor.showLineNumbers = data.value;
        } else if (data.name === 'showPrintMargin') {
            this._store.noteEditor.showPrintMargin = data.value;
        } else if (data.name === 'printMarginColumn') {
            this._store.noteEditor.printMarginColumn = data.value;
        } else if (data.name === 'showInvisibles') {
            this._store.noteEditor.showInvisibles = data.value;
        } else if (data.name === 'showFoldWidgets') {
            this._store.noteEditor.showFoldWidgets = data.value;
        } else if (data.name === 'showGutter') {
            this._store.noteEditor.showGutter = data.value;
        } else if (data.name === 'displayIndentGuides') {
            this._store.noteEditor.displayIndentGuides = data.value;
        } else if (data.name === 'scrollPastEnd') {
            this._store.noteEditor.scrollPastEnd = data.value;
        } else {
            console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
        }

        this._settings.set(data.name, data.value).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    //endregion

    //region Debug operations

    resetDatabase() : void {
        this._database.removeAll();
    }

    resetSettings() : void {
        this._settings.clear()
            .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    //endregion

    //region Private methods

    _initSettings() : Promise<*> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._settings.get('filterListShown',     true),
                this._settings.get('noteListShown',       true),
                this._settings.get('filterListWidth',     Constants.SOURCE_LIST_MIN_WIDTH),
                this._settings.get('noteListWidth',       Constants.NOTE_LIST_MIN_WIDTH),
                this._settings.get('defaultSyntax',       Config.defaultSyntax),
                this._settings.get('theme',               Config.defaultTheme),
                this._settings.get('font',                undefined),
                this._settings.get('fontFamily',          undefined),
                this._settings.get('textSize',            Constants.DEFAULT_NOTE_EDITOR_FONT_SIZE),
                //region NoteEditor settings
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
                //endregion
                this._settings.get('notesSorting',        Config.defaultNotesSorting)
            ]).then(values => {
                let i = 0;

                this._store.filterListShown   = values[i] !== undefined ? values[i] : true;                            i++;
                this._store.noteListShown     = values[i] !== undefined ? values[i] : true;                            i++;
                this._store.filterListWidth   = values[i] !== undefined ? values[i] : Constants.SOURCE_LIST_MIN_WIDTH; i++;
                this._store.noteListWidth     = values[i] !== undefined ? values[i] : Constants.NOTE_LIST_MIN_WIDTH;   i++;
                this._store.noteEditor.syntax = values[i] !== undefined ? values[i] : Config.defaultSyntax;            i++;
                this._store.noteEditor.theme  = values[i] !== undefined ? values[i] : Config.defaultTheme;             i++;

                this._defaultSyntax = this._store.noteEditor.syntax;

                if (values[i] !== undefined) {
                    AppPresenter._updateFont(values[i]);
                }

                i++;

                this._store.noteEditor.fontFamily = values[i] !== undefined ? values[i] : undefined;                               i++;
                this._store.noteEditor.textSize   = values[i] !== undefined ? values[i] : Constants.DEFAULT_NOTE_EDITOR_FONT_SIZE; i++;

                const data = {};

                //region NoteEditor settings

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
                data.displayIndentGuides = values[i] !== undefined ? values[i] : Config.defaultDisplayIndentGuides; i++;
                data.scrollPastEnd       = values[i] !== undefined ? values[i] : Config.defaultScrollPastEnd;       i++;

                //endregion

                this._store.notesSorting = values[i] !== undefined ? values[i] : Config.defaultNotesSorting;

                this._noteListPresenter.sorting = this._store.notesSorting;

                this._store.defaultSyntaxDialog.list.selectedIndex = indexOf(SyntaxCodes.items, this._store.noteEditor.syntax);
                this._store.themeDialog.list.selectedIndex         = indexOf(ThemeCodes.items,  this._store.noteEditor.theme);

                //region Editor settings dialog

                this._store.editorSettingsDialog.settings.highlightCurrentLine.booleanValue = data.highlightActiveLine;
                this._store.editorSettingsDialog.settings.tabSize2.booleanValue             = data.tabSize === Constants.TAB_SIZES[0];
                this._store.editorSettingsDialog.settings.tabSize4.booleanValue             = data.tabSize === Constants.TAB_SIZES[1];
                this._store.editorSettingsDialog.settings.tabSize8.booleanValue             = data.tabSize === Constants.TAB_SIZES[2];
                this._store.editorSettingsDialog.settings.useSoftTabs.booleanValue          = data.useSoftTabs;
                this._store.editorSettingsDialog.settings.wordWrap.booleanValue             = data.wordWrap;
                this._store.editorSettingsDialog.settings.showLineNumbers.booleanValue      = data.showLineNumebrs;
                this._store.editorSettingsDialog.settings.showPrintMargin.booleanValue      = data.showPrintMargin;
                this._store.editorSettingsDialog.settings.printMarginColumn72.booleanValue  = data.printMarginColumn === Constants.PRINT_MARGIN_COLUMNS[0];
                this._store.editorSettingsDialog.settings.printMarginColumn80.booleanValue  = data.printMarginColumn === Constants.PRINT_MARGIN_COLUMNS[1];
                this._store.editorSettingsDialog.settings.printMarginColumn100.booleanValue = data.printMarginColumn === Constants.PRINT_MARGIN_COLUMNS[2];
                this._store.editorSettingsDialog.settings.printMarginColumn120.booleanValue = data.printMarginColumn === Constants.PRINT_MARGIN_COLUMNS[3];
                this._store.editorSettingsDialog.settings.showInvisibles.booleanValue       = data.showInvisibles;
                this._store.editorSettingsDialog.settings.showFoldWidgets.booleanValue      = data.showFoldWidgets;
                this._store.editorSettingsDialog.settings.showGutter.booleanValue           = data.showGutter;
                this._store.editorSettingsDialog.settings.showIndentGuides.booleanValue     = data.displayIndentGuides;
                this._store.editorSettingsDialog.settings.scrollPastLastLine.booleanValue   = data.scrollPastEnd;

                //endregion

                //region NoteEditor settings

                this._store.noteEditor.highlightActiveLine = data.highlightActiveLine;
                this._store.noteEditor.tabSize             = data.tabSize;
                this._store.noteEditor.useSoftTabs         = data.useSoftTabs;
                this._store.noteEditor.wordWrap            = data.wordWrap;
                this._store.noteEditor.showLineNumbers     = data.showLineNumebrs;
                this._store.noteEditor.showPrintMargin     = data.showPrintMargin;
                this._store.noteEditor.printMarginColumn   = data.printMarginColumn;
                this._store.noteEditor.showInvisibles      = data.showInvisibles;
                this._store.noteEditor.showFoldWidgets     = data.showFoldWidgets;
                this._store.noteEditor.showGutter          = data.showGutter;
                this._store.noteEditor.displayIndentGuides = data.displayIndentGuides;
                this._store.noteEditor.scrollPastEnd       = data.scrollPastEnd;

                //endregion

                EventUtils.broadcast('NoteEditor.init', data);

                this._updateMenu();
                this._updateTheme();

                resolve();
            }).catch(error => reject(error));
        });
    }

    _initDatabase() : Promise<*> {
        return new Promise((resolve, reject) => this._database.load(Config.databaseName)
            .then(() => {
                this.refreshFilterList();
                this.refreshCategoryList();
                this.refreshNoteList();

                resolve();
            }).catch(error => reject(error)));
    }

    _initAutoSave() : void {
        this._store.noteEditor.changes.subscribe(record => {
            const selectedItem   = this._store.noteList.selectedItem;
            const selectedItemId = this._store.noteList.selectedItemId;

            if (selectedItem && selectedItemId) this._database.findById(selectedItemId)
            .then(() => this._database.addOrUpdate(record.toDoc()))
            .then(doc => selectedItem.update(Record.fromDoc(doc)))
            .catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        });
    }

    _updateMenu() : Promise<*> {
        return new Promise(resolve => {
            const viewMenu = Menu.getApplicationMenu().items[EnvironmentUtils.isMacOS() ? 3 : 2];

            viewMenu.submenu.items[0].booleanValue = this._store.filterListShown;
            viewMenu.submenu.items[1].booleanValue = this._store.noteListShown;

            resolve();
        });
    }

    _updateTheme() : void {
        this._store.theme = indexOf(DARK_THEMES, this._store.noteEditor.theme) > -1 ? 'dark' : 'light';
    }

    static _updateFont(font : string) : void {
        EventUtils.broadcast('NoteEditor.font.change', font);
    }

    /**
     * @param {number} sorting
     * @private
     */
    _updateNotesSorting(sorting : number) : void {
        this._store.notesSorting        = sorting;
        this._noteListPresenter.sorting = sorting;

        this._settings.set('notesSorting', sorting).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
    }

    _duplicateNote() : void {
        const selectedItem = this._store.noteList.selectedItem;

        if (selectedItem) {
            const now = Date.now();
            const doc = selectedItem.record.toDoc();

            doc._id           = undefined;
            doc.lastUpdatedAt = now;
            doc.createdAt     = now;

            this._database.addOrUpdate(doc)
                .then(() => {
                    this._filterListPresenter.refresh();
                    this._categoryListPresenter.notifyDataSetChanged();
                    this._noteListPresenter.refresh();
                }).catch(error => EventUtils.broadcast(EVENT_ERROR, error.toString()));
        }
    }

    /**
     * Writes text to the specified file
     * @param {String} filename
     * @param {String} fullText
     * @private
     */
    static _exportNote(filename : string, fullText : string) : void {
        fs.writeFile(filename, fullText, {
            encoding : 'utf-8',
            flag     : 'w'
        }, error => {
            if (error) dialog.showErrorBox('Error', error);
        });
    }

    static _clearCache() : void {
        Rx.Observable.interval(CLEAR_CACHE_INTERVAL).subscribe(() => remote.getCurrentWindow().webContents.session.clearCache(() => console.trace('Cache cleared')));
    }

    //endregion
}
