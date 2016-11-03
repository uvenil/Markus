'use strict';

import FilterListViewPresenter from './components/lists/FilterListViewPresenter';
import CategoryListViewPresenter from './components/lists/CategoryListViewPresenter';
import NoteListViewPresenter from './components/lists/NoteListViewPresenter';
import TextEditorPresenter from './components/text/TextEditorPresenter';
import AppStore from './AppStore';
import BooleanStore from './components/BooleanStore';
import BooleanDialogStore from './components/dialogs/BooleanDialogStore';
import PromptDialogStore from './components/dialogs/PromptDialogStore';
import ListViewDialogStore from './components/dialogs/ListViewDialogStore';
import ListItemStore from './components/lists/ListItemStore';
import SettingsStore from './components/dialogs/SettingsStore';
import Settings from './utils/Settings';
import Database from './data/Database';
import Record from './data/Record.jsx';
import EventUtils from './utils/EventUtils';
import Constants from './utils/Constants';
import Config from '../config.json';
import SyntaxNames from './definitions/syntax-names.json';
import SyntaxCodes from './definitions/syntax-codes.json';
import ThemeNames from './definitions/theme-names.json';
import ThemeCodes from './definitions/theme-codes.json';
import Rx from 'rx-lite';
import Path from 'path';
import is from 'electron-is';
import fs from 'fs';
import _ from 'lodash';

const { remote } = require('electron');
const { dialog, Menu, MenuItem } = remote;

const CLEAR_CACHE_INTERVAL = 5 * 60 * 1000;

const EVENT_ERROR = 'global.error';
const DARK_THEMES = [ 'ambiance', 'chaos', 'clouds_midnight', 'cobalt', 'idle_fingers', 'iplastic', 'kr_theme', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai', 'pastel_on_dark', 'solarized_dark', 'terminal', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink' ];

const FONTS = is.macOS() ? require('./definitions/fonts.mac.json') : require('./definitions/fonts.win.json');

export default class AppPresenter {
    constructor() {
        this._store         = new AppStore();
        this._settings      = new Settings();
        this._database      = new Database();
        this._defaultSyntax = Config.defaultSyntax;

        this._filtersPresenter    = new FilterListViewPresenter(this._database);
        this._categoriesPresenter = new CategoryListViewPresenter(this._database);
        this._notesPresenter      = new NoteListViewPresenter(this._filtersPresenter, this._categoriesPresenter, this._database);
        this._editorPresenter     = new TextEditorPresenter(this._database);

        this._store.booleanDialog                 = new BooleanDialogStore();
        this._store.aboutDialog                   = new BooleanStore();
        this._store.editorSettingsDialog          = new BooleanStore();
        this._store.currentSyntaxDialog           = new ListViewDialogStore();
        this._store.defaultSyntaxDialog           = new ListViewDialogStore();
        this._store.themeDialog                   = new ListViewDialogStore();
        this._store.fontDialog                    = new ListViewDialogStore();
        this._store.editorSettingsDialog.settings = new SettingsStore();
        this._store.filtersStore                  = this._filtersPresenter.store;
        this._store.categoriesStore               = this._categoriesPresenter.store;
        this._store.notesStore                    = this._notesPresenter.store;
        this._store.editorStore                   = this._editorPresenter.store;
        this._store.addCategoryDialog             = new PromptDialogStore();
        this._store.updateCategoryDialog          = new PromptDialogStore();
        this._store.selectCategoryDialog          = new ListViewDialogStore();

        this._filterSelection   = new Rx.Subject();
        this._categorySelection = new Rx.Subject();
        this._noteSelection     = new Rx.Subject();

        Rx.Observable.zip(this._filterSelection, this._categorySelection, (selectedFilterIndex, selectedCategoryIndex) => selectedFilterIndex > -1 || selectedCategoryIndex > -1)
            .subscribe(hasSelection => {
                this._store.addNoteEnabled = hasSelection;

                this.refreshNotes();
            });

        this._noteSelection.subscribe(index => {
            this._store.notesStore.selectedIndex = index;

            this.refreshEditor();
        });

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

    get store() {
        return this._store;
    }

    init() {
        this._initSettings()
            .then(() => this._initDatabase()
                .then(() => this._initAutoSave())
                .catch(error => EventUtils.broadcast('global.error', error.toString())))
            .catch(error => EventUtils.broadcast('global.error', error.toString()));

        AppPresenter._clearCache();
    }

    //region Event handlers

    //region Filter operations

    handleFilterItemClick(index) {
        if (this._store.filtersStore.selectedIndex !== index) {
            this._store.filtersStore.selectedIndex    = index;
            this._store.categoriesStore.selectedIndex = -1;

            this._filterSelection.onNext(index);
            this._categorySelection.onNext(-1);
        }
    }

    handleFilterItemRightClick(index) {
        if (this._store.filtersStore.selectedIndex !== index) {
            this._store.filtersStore.selectedIndex    = index;
            this._store.categoriesStore.selectedIndex = -1;

            this._notesPresenter.refresh();
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
                        this._store.filtersStore.selectedIndex    = index;
                        this._store.categoriesStore.selectedIndex = -1;

                        this.handleImportNotes();
                    }
                }));

                if (count > 0) {
                    menu.append(new MenuItem({
                        label : 'Export all notes…',
                        click : () => {
                            this._store.filtersStore.selectedIndex    = index;
                            this._store.categoriesStore.selectedIndex = -1;

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
                        click : () => {
                            this._database.unarchiveAll().catch(error => EventUtils.broadcast('global.error', error.toString()));
                        }
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
                                    this._filtersPresenter.refresh();
                                    this._categoriesPresenter.refresh();

                                    this._notesPresenter.refresh();
                                }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                            }
                        };
                    }
                }));

                menu.popup(remote.getCurrentWindow());
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
        }
    }

    //endregion

    //region Category operations

    handleCategoryItemClick(index) {
        if (this._store.categoriesStore.selectedIndex !== index) {
            this._store.filtersStore.selectedIndex    = -1;
            this._store.categoriesStore.selectedIndex = index;

            this._filterSelection.onNext(-1);
            this._categorySelection.onNext(index);
        }
    }

    handleCategoryItemRightClick(index) {
        if (this._store.categoriesStore.selectedIndex !== index) {
            this._store.filtersStore.selectedIndex    = -1;
            this._store.categoriesStore.selectedIndex = index;

            this._notesPresenter.refresh();
        }

        const category = this._store.categoriesStore.items[index].primaryText;

        this._database.countByCategory(category)
            .then(count => {
                const menu = new Menu();

                menu.append(new MenuItem({
                    label : 'Import notes…',
                    click : () => {
                        this._store.filtersStore.selectedIndex    = -1;
                        this._store.categoriesStore.selectedIndex = index;

                        this.handleImportNotes();
                    }
                }));

                if (count > 0) {
                    menu.append(new MenuItem({
                        label : 'Export all notes…',
                        click : () => {
                            this._store.filtersStore.selectedIndex    = -1;
                            this._store.categoriesStore.selectedIndex = index;

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
                                    this._categoriesPresenter.notifyDataSetChanged();

                                    if (this._store.categoriesStore.selectedIndex < 0) {
                                        this._notesPresenter.refresh();
                                    }
                                }).catch(error => EventUtils.broadcast('global.error', error.toString()));
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
                                    this._filtersPresenter.refresh();
                                    this._categoriesPresenter.notifyDataSetChanged();

                                    if (this._store.categoriesStore.selectedIndex < 0) {
                                        this._notesPresenter.refresh();
                                    }
                                }).catch(error => EventUtils.broadcast('global.error', error.toString()));
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
                                    this._filtersPresenter.refresh();
                                    this._categoriesPresenter.refresh();

                                    this._notesPresenter.refresh();
                                }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                        };
                    }
                }));

                menu.popup(remote.getCurrentWindow());
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    handleAddCategoryClick() {
        this._store.addCategoryDialog.value        = '';
        this._store.addCategoryDialog.booleanValue = true;
    }

    //endregion

    //region Note operations

    handleNoteItemClick(index) {
        if (this._store.notesStore.selectedIndex !== index) {
            this._noteSelection.onNext(index);
        }
    }

    handleNoteItemRightClick(index) {
        if (this._store.notesStore.selectedIndex !== index) {
            this._store.notesStore.selectedIndex = index;
        }

        const menu = new Menu();

        menu.append(new MenuItem({
            label : 'Export…',
            click : () => {
                this._store.notesStore.selectedIndex = index;

                this.handleExportNote();
            }
        }));

        menu.append(new MenuItem({
            type : 'separator'
        }));

        if (this._store.filtersStore.selectedIndex === 2) {
            menu.append(new MenuItem({
                label : 'Restore',
                click : () => {
                    this._database.unarchiveById(this._store.notesStore.selectedItem.itemId)
                        .then(() => {
                            this._notesPresenter.refresh();
                            this._filtersPresenter.refresh();
                            this._categoriesPresenter.notifyDataSetChanged();
                        }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                }
            }));
        }

        const action = this._store.filtersStore.selectedIndex === 2 ? 'Delete' : 'Archive';

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
                    (this._store.filtersStore.selectedIndex === 2 ? this._database.removeById(this._store.notesStore.selectedItem.itemId) : this._database.archiveById(this._store.notesStore.selectedItem.itemId))
                        .then(() => {
                            this._notesPresenter.refresh();
                            this._filtersPresenter.refresh();
                            this._categoriesPresenter.notifyDataSetChanged();

                            this.refreshEditor();
                        }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                };
            }
        }));

        menu.popup(remote.getCurrentWindow());
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
            label : 'Updated ▲',
            click : () => this._updateNotesSorting(2)
        }));

        menu.append(new MenuItem({
            label : 'Updated ▼',
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

    handleAddNoteClick() {
        this._notesPresenter.addNote(this._defaultSyntax)
            .then(() => {
                this._store.notesStore.selectedIndex = 0;

                this._noteSelection.onNext(0);
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    handleImportNotes() {
        if (this._store.filtersStore.selectedIndex > -1 || this._store.categoriesStore.selectedIndex > -1) {
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
                                EventUtils.broadcast('global.error', error.toString());
                            } else {
                                this._database.addOrUpdate(Record.fromText(syntax, fullText))
                                    .then(doc => {
                                        this._store.notesStore.items.unshift(Record.fromDoc(doc).toListItemStore());
                                    }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                            }
                        });
                    });
                }
            });
        }
    }

    handleExportNote() {
        if (this._store.notesStore.selectedIndex > -1) {
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
                            AppPresenter._exportNote(filename, this._store.notesStore.selectedItem.record.fullText);
                        } else {
                            dialog.showMessageBox(remote.getCurrentWindow(), {
                                type      : 'question',
                                title     : 'File already exists',
                                message   : 'Are you sure you want to overwrite this file?',
                                buttons   : [ 'Yes', 'No' ],
                                defaultId : 0,
                                cancelId  : 1
                            }, response => {
                                if (response === 0) {
                                    AppPresenter._exportNote(filename, this._store.notesStore.selectedItem.record.fullText);
                                }
                            });
                        }
                    });
                }
            });
        }
    }

    handleExportNotes() {
        let countPromise;

        if (this._store.filtersStore.selectedIndex === 0) {
            countPromise = this._database.countAll();
        } else if (this._store.filtersStore.selectedIndex === 1) {
            countPromise = this._database.countByStarred();
        } else if (this._store.filtersStore.selectedIndex === 2) {
            countPromise = this._database.countByArchived();
        } else if (this._store.categoriesStore.selectedIndex > -1) {
            countPromise = this._database.countByCategory(this._store.categoriesStore.selectedItem.primaryText);
        }

        if (countPromise) {
            countPromise.then(count => {
                if (count > 0) {
                    let findPromise;

                    if (this._store.filtersStore.selectedIndex === 0) {
                        findPromise = this._database.findAll(this._store.notesSorting);
                    } else if (this._store.filtersStore.selectedIndex === 1) {
                        findPromise = this._database.findByStarred(this._store.notesSorting);
                    } else if (this._store.filtersStore.selectedIndex === 2) {
                        findPromise = this._database.findByArchived(this._store.notesSorting);
                    } else if (this._store.categoriesStore.selectedIndex > -1) {
                        findPromise = this._database.findByCategory(this._store.categoriesStore.selectedItem.primaryText, this._store.notesSorting);
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
                            if (directory) {
                                promise.then(docs => {
                                    docs.forEach(doc => {
                                        AppPresenter._exportNote(Path.join(directory[0], doc._id + '.txt'), doc.fullText);
                                    });
                                });
                            }
                        });
                    }
                }
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
        }
    }

    //endregion

    //region Editor operation

    handleStarClick() {
        this._store.editorStore.record.starred = !this._store.editorStore.record.starred;

        this._database.addOrUpdate(this._store.editorStore.record.toDoc())
            .then(() => this._filtersPresenter.refresh())
            .catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    handleArchiveClick() {
        this._store.editorStore.record.archived = !this._store.editorStore.record.archived;

        this._database.addOrUpdate(this._store.editorStore.record.toDoc())
            .then(() => this._filtersPresenter.refresh())
            .catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    handleSelectCategoryClick() {
        this._database.findCategories()
            .then(categories => {
                this._store.selectCategoryDialog.list.items = [];

                categories.forEach(category => {
                    const item = new ListItemStore();

                    item.itemId      = category;
                    item.primaryText = category;
                    item.selected    = this._store.editorStore.record.category ? this._store.editorStore.record.category === category : false;

                    this._store.selectCategoryDialog.list.items.push(item);
                });

                this._store.selectCategoryDialog.booleanValue = true;
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    /**
     * @param {number} index The category item index the user selects.
     */
    handleSelectCategoryItemClick(index) {
        if (this._store.selectCategoryDialog.list.selectedIndex !== index) {
            this._store.selectCategoryDialog.list.selectedIndex = index;
        }
    }

    handleSelectCategoryOkClick() {
        if (this._store.selectCategoryDialog.list.selectedIndex > -1) {
            this._store.editorStore.record.category = this._store.selectCategoryDialog.list.selectedItem.primaryText;
            this._store.editorStore.changes.onNext(this._store.editorStore.record);

            this._categoriesPresenter.notifyDataSetChanged();

            this._store.selectCategoryDialog.booleanValue = false;
        }
    }

    handleSelectCategoryNoneClick() {
        this._store.editorStore.record.category = null;
        this._store.editorStore.changes.onNext(this._store.editorStore.record);

        this._categoriesPresenter.notifyDataSetChanged();

        this._store.selectCategoryDialog.booleanValue = false;
    }

    //endregion

    //endregion

    //region Refresh operations

    refreshFilters() {
        this._filtersPresenter.refresh();

        this._noteSelection.onNext(-1);

        this._store.filtersStore.selectedIndex = 0;
    }

    refreshCategories() {
        this._categoriesPresenter.refresh();

        this._noteSelection.onNext(-1);
    }

    refreshNotes() {
        this._notesPresenter.refresh();

        this.refreshEditor();
    }

    refreshEditor() {
        this._editorPresenter.load(this._store.notesStore.selectedItemId)
            .then(() => {
                if (this._store.notesStore.selectedItemId) {
                    this._store.currentSyntaxDialog.list.selectedIndex = _.indexOf(SyntaxCodes.items, this._store.editorStore.record.syntax);
                }
            }).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    //endregion

    //region Application operations

    /**
     * Adds a new category.
     * @param {String} category
     */
    addCategory(category) {
        if (_.isEmpty(category)) {
            EventUtils.broadcast(EVENT_ERROR, 'Please enter the name of the new category');
        } else {
            this._database.addCategory(category)
                .then(() => {
                    this._store.addCategoryDialog.booleanValue = false;

                    this._categoriesPresenter.notifyDataSetChanged();
                }).catch(error => {
                    EventUtils.broadcast('global.error', error.toString());

                    EventUtils.broadcast(EVENT_ERROR, error.message);
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
                this._store.updateCategoryDialog.booleanValue = false;

                this._categoriesPresenter.notifyDataSetChanged();
            }).catch(error => {
                EventUtils.broadcast('global.error', error.toString());

                EventUtils.broadcast(EVENT_ERROR, error.message);
            });
    }

    /**
     * Filters the note list by the specified keyword.
     * @param {String} keyword
     */
    filterNoteList(keyword) {
        this._notesPresenter.keyword = keyword;

        this._noteSelection.onNext(-1);
    }

    //endregion

    //region UI operations

    /**
     * Shows or hides filter list view.
     * @param {bool} show
     */
    showFilterList(show) {
        this._store.showFilterList = show;

        this._updateMenu();
    }

    /**
     * Shows or hides note list view.
     * @param {bool} show
     */
    showNoteList(show) {
        this._store.showNoteList = show;

        this._updateMenu();
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
        this._settings.set('defaultSyntax', syntax).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    /**
     * @param {String} theme
     */
    changeTheme(theme) {
        this._store.editorStore.theme = theme;

        this._updateTheme();

        this._settings.set('theme', theme)
            .catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    /**
     * @param {String} font
     */
    changeFont(font) {
        AppPresenter._updateFont(font);

        this._settings.set('font', font)
            .catch(error => EventUtils.broadcast('global.error', error.toString()));
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

        this._settings.set(data.name, data.value).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    //endregion

    //region Debug operations

    resetDatabase() {
        this._database.removeAll();
    }

    resetSettings() {
        this._settings.clear()
            .catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    //endregion

    //region Private methods

    _initSettings() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._settings.get('showFilterList',      true),
                this._settings.get('showNoteList',        true),
                this._settings.get('filterListWidth',     Constants.FILTER_LIST_MIN_WIDTH),
                this._settings.get('noteListWidth',       Constants.NOTE_LIST_MIN_WIDTH),
                this._settings.get('defaultSyntax',       Config.defaultSyntax),
                this._settings.get('theme',               Config.defaultTheme),
                this._settings.get('font',                undefined),
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
                let i = 0;

                this._store.showFilterList     = values[i] !== undefined ? values[i] : true;                            i++;
                this._store.showNoteList       = values[i] !== undefined ? values[i] : true;                            i++;
                this._store.filterListWidth    = values[i] !== undefined ? values[i] : Constants.FILTER_LIST_MIN_WIDTH; i++;
                this._store.noteListWidth      = values[i] !== undefined ? values[i] : Constants.NOTE_LIST_MIN_WIDTH;   i++;
                this._store.editorStore.syntax = values[i] !== undefined ? values[i] : Config.defaultSyntax;            i++;
                this._store.editorStore.theme  = values[i] !== undefined ? values[i] : Config.defaultTheme;             i++;

                this._defaultSyntax = this._store.editorStore.syntax;

                if (values[i] !== undefined) {
                    AppPresenter._updateFont(values[i]);
                }

                i++;

                this._store.editorStore.fontFamily = values[i] !== undefined ? values[i] : undefined; i++;
                this._store.editorStore.textSize   = values[i] !== undefined ? values[i] : undefined; i++;

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
                data.displayIndentGuides = values[i] !== undefined ? values[i] : Config.defaultDisplayIndentGuides; i++;
                data.scrollPastEnd       = values[i] !== undefined ? values[i] : Config.defaultScrollPastEnd;       i++;

                this._store.notesSorting = values[i] !== undefined ? values[i] : Config.defaultNotesSorting;

                this._notesPresenter.sorting = this._store.notesSorting;

                this._store.defaultSyntaxDialog.list.selectedIndex = _.indexOf(SyntaxCodes.items, this._store.editorStore.syntax);
                this._store.themeDialog.list.selectedIndex         = _.indexOf(ThemeCodes.items,  this._store.editorStore.theme);

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

                EventUtils.broadcast('TextEditor.init', data);

                this._updateMenu();
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
            this._database.findById(this._store.notesStore.selectedItemId)
                .then(() => {
                    this._database.addOrUpdate(record.toDoc())
                        .then(doc => {
                            this._store.notesStore.selectedItem.update(Record.fromDoc(doc));
                        }).catch(error => EventUtils.broadcast('global.error', error.toString()));
                }).catch(error => EventUtils.broadcast('global.error', error.toString()));
        });
    }

    _updateMenu() {
        return new Promise(resolve => {
            const viewMenu = Menu.getApplicationMenu().items[is.macOS() ? 3 : 2];

            viewMenu.submenu.items[0].booleanValue = this._store.showFilterList;
            viewMenu.submenu.items[1].booleanValue = this._store.showNoteList;

            resolve();
        });
    }

    _updateTheme() {
        this._store.theme = _.indexOf(DARK_THEMES, this._store.editorStore.theme) > -1 ? 'dark' : 'light';
    }

    static _updateFont(font) {
        EventUtils.broadcast('TextEditor.font.change', font);
    }

    /**
     * @param {number} sorting
     * @private
     */
    _updateNotesSorting(sorting) {
        this._store.notesSorting     = sorting;
        this._notesPresenter.sorting = sorting;

        this._settings.set('notesSorting', sorting).catch(error => EventUtils.broadcast('global.error', error.toString()));
    }

    /**
     * Writes text to the specified file
     * @param {String} filename
     * @param {String} fullText
     * @private
     */
    static _exportNote(filename, fullText) {
        fs.writeFile(filename, fullText, {
            encoding : 'utf-8',
            flag     : 'w'
        }, error => {
            if (error) dialog.showErrorBox('Error', error);
        });
    }

    static _clearCache() {
        Rx.Observable.interval(CLEAR_CACHE_INTERVAL).subscribe(() => remote.getCurrentWindow().webContents.session.clearCache(() => console.trace('Cache cleared')));
    }

    //endregion
}

module.exports = AppPresenter;
