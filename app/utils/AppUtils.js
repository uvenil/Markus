// @flow
'use strict';

import ListStore from '../components/lists/ListStore';
import ListItemStore from '../components/lists/ListItemStore.jsx';
import AppStore from '../AppStore';
import AppPresenter from '../AppPresenter';
import Database from '../data/Database';
import Record from '../data/Record';
import Settings from './Settings';
import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import Constants from '../Constants';
import ThemeNames from '../definitions/themes/theme-names.json';
import ThemeCodes from '../definitions/themes/theme-codes.json';
import ThemeHljs from '../definitions/themes/theme-hljs.json';
import Rx from 'rx-lite';
import indexOf from 'lodash.indexof';
import Path from 'path';
import fs from 'fs';

const { remote } = require('electron');
const { dialog, Menu, MenuItem } = remote;

const CLEAR_CACHE_INTERVAL : number = 5 * 60 * 1000;

const handleMessage = (store : AppStore, error : Object) : void => {
    console.error(error);

    if (error) {
        store.message = error.toString();
        store.messageShown = true;
    }
};

const handleMasterListWidthChange = (store : AppStore, size : number) : void => {
    store.masterListWidth = size;

    Settings.set('masterListWidth', store.masterListWidth).catch(error => EventUtils.broadcast('app.error', error));
};

const handleDetailListWidthChange = (store : AppStore, size : number) : void => {
    store.detailListWidth = size;

    Settings.set('detailListWidth', store.detailListWidth).catch(error => EventUtils.broadcast('app.error', error));
};

const handleAddNote = (store : AppStore, presenter : AppPresenter) : void => {
    if (store.addNoteEnabled) presenter.handleAddNoteClick();
};

const handleSortNotesClick = (presenter : AppPresenter) : void => {
    const menu = new Menu();

    const appendMenuItem = (label : string, index : number) : void => {
        menu.append(new MenuItem({
            label : label,
            click : () : void => presenter.updateNotesSorting(index)
        }));
    };

    appendMenuItem('Name ▲',    0);
    appendMenuItem('Name ▼',    1);
    appendMenuItem('Updated ▲', 2);
    appendMenuItem('Updated ▼', 3);
    appendMenuItem('Created ▲', 4);
    appendMenuItem('Created ▼', 5);

    menu.popup(remote.getCurrentWindow());
};

const handleNoteItemRightClick = (store : AppStore, presenter : AppPresenter, database : Database, index : number) : void => {
    if (store.detailList.selectedIndex !== index) store.detailList.selectedIndex = index;

    const menu : Menu = new Menu();

    menu.append(new MenuItem({
        label : 'Export…',
        click : () => handleExportNote(store)
    }));

    if (store.shortcutList.selectedIndex !== 2) menu.sppend({
        label : 'Duplicate',
        click : () => duplicateNote(store, presenter, database)
    });

    menu.append(new MenuItem({ type : 'separator' }));

    const selectedItem : ?ListItemStore = store.detailList.selectedItem;

    if (selectedItem && store.shortcutList.selectedIndex === 2) menu.append(new MenuItem({
        label : 'Restore',
        click : () => {
            if (selectedItem.itemId !== undefined && selectedItem.itemId !== null) {
                database.unarchiveById(selectedItem.itemId).then((): void => {
                    presenter.refreshShortcutList();
                    presenter.refreshHashTagList();
                    presenter.refreshDetailList();
                }).catch(error => EventUtils.broadcast('app.error', error));
            }
        }
    }));
};

const handleImportNotes = (store : AppStore, database : Database) : void => {
    if (store.shortcutList.selectedIndex >= 0 || store.hashTagList.selectedIndex >= 0) {
        dialog.showOpenDialog(remote.getCurrentWindow(), {
            title      : 'Import from files',
            filters    : [
                {
                    name       : 'Markdown files',
                    extensions : [ 'md' ]
                },
                {
                    name       : 'Plain text files',
                    extensions : [ 'txt' ]
                },
                {
                    name       : 'All files',
                    extensions : [ '*' ]
                }
            ],
            properties : [ 'openFile', 'multiSelections' ]
        }, (fileNames : ?string[]) => {
            if (fileNames) fileNames.forEach((fileName : string) => {
                fs.readFile(fileName, {
                    encoding : 'utf-8',
                    flag     : 'r'
                }, (error, fullText : string) => {
                    if (error) {
                        EventUtils.broadcast('app.error', error);
                    } else {
                        database.addOrUpdate(Record.fromText(fullText)).then((doc : Object) => {
                            const item : ListItemStore = new ListItemStore();
                            item.update(Record.fromDoc(doc));

                            store.detailList.items.unshift(item);
                        }).catch(error => EventUtils.broadcast('app.error', error));
                    }
                });
            });
        });
    }
};

const handleExportNote = (store : AppStore) : void => {
    const selectedItem : ?ListItemStore = store.detailList.selectedItem;

    if (selectedItem && store.detailList.selectedIndex > -1) {
        dialog.showSaveDialog(remote.getCurrentWindow(), {
            title   : 'Export to a file',
            filters : [
                {
                    name       : 'Markdown files',
                    extensions : [ 'md' ]
                },
                {
                    name       : 'Plain text files',
                    extensions : [ 'txt' ]
                },
                {
                    name       : 'All files',
                    extensions : [ '*' ]
                }
            ]
        }, (fileName : string) => {
            if (fileName) {
                fs.access(fileName, fs.constants.F_OK, error => {
                    if (error) {
                        exportNote(fileName, selectedItem.record.fullText);
                    } else {
                        dialog.showMessageBox(remote.getCurrentWindow(), {
                            type      : 'question',
                            title     : 'File already exists',
                            message   : 'Are you sure you want to overwrite this file?',
                            buttons   : [ 'Yes', 'No' ],
                            defaultId : 0,
                            cancelId  : 1
                        }, (response : number) => {
                            if (response === 0) exportNote(fileName, selectedItem.record.fullText);
                        });
                    }
                });
            }
        });
    }
};

const handleExportNotes = (store : AppStore, database : Database) : void => {
    const selectedItem : ?ListItemStore = store.hashTagList.selectedItem;

    if (selectedItem) {
        const index : number = store.shortcutList.selectedIndex;

        let countPromise : any;

        if (index === 0) {
            countPromise = database.countAll();
        } else if (index === 1) {
            countPromise = database.countStarred();
        } else if (index === 2) {
            countPromise = database.countArchived();
        } else if (store.hashTagList.selectedIndex >= 0) {
            countPromise = database.countHashTagged(selectedItem.primaryText);
        }

        if (countPromise) {
            countPromise.then((count : number) => {
                if (count > 0) {
                    let findPromise : any;

                    if (index === 0) {
                        findPromise = database.findAll(store.sorting);
                    } else if (index === 1) {
                        findPromise = database.findStarred(store.sorting);
                    } else if (index === 2) {
                        findPromise = database.findArchived(store.sorting);
                    } else if (store.hashTagList.selectedIndex >= 0) {
                        findPromise = database.findByHashTag(selectedItem.primaryText, store.sorting);
                    }

                    if (findPromise) {
                        dialog.showOpenDialog(remote.getCurrentWindow(), {
                            title      : 'Export to a directory',
                            filters    : [
                                {
                                    name       : 'All files',
                                    extensions : [ '*' ]
                                }
                            ],
                            properties : [ 'openDirectory', 'createDirectory' ]
                        }, (directory : string) => {
                            if (directory) findPromise.then((docs: Object[]) => docs.forEach(doc => exportNote(Path.join(directory[0], doc._id + '.md'), doc.fullText))).catch(error => EventUtils.broadcast('app.error', error));
                        });
                    }
                }
            }).catch(error => EventUtils.broadcast('app.error', error));
        }
    }
};

const showContextMenu = (store : AppStore, presenter : AppPresenter, database : Database, index : number, list : ListStore, props : Object) : void => {
    const menu : Menu = new Menu();

    if (props.canImport) menu.append(new MenuItem({
        label : 'Import notes…',
        click : () => {
            store.shortcutList.selectedIndex = list === store.shortcutList ? index : -1;
            store.hashTagList.selectedIndex  = list === store.hashTagList  ? index : -1;

            handleImportNotes(store, database);
        }
    }));

    if (props.canExport) menu.append(new MenuItem({
        label : 'Export all notes…',
        click : () => {
            store.shortcutList.selectedIndex = list === store.shortcutList ? index : -1;
            store.hashTagList.selectedIndex  = list === store.hashTagList  ? index : -1;

            handleExportNotes(store, database);
        }
    }));

    if ((props.canImport || props.canExport) && (props.canArchive || props.canDelete)) menu.append(new MenuItem({ type : 'separator' }));

    if (props.canArchive) {
        menu.append(new MenuItem({
            label : 'Archive notes…',
            click : () => showConfirmationDialog(store, presenter, 'Archive').then((result : boolean) => {
                if (result) {
                    let handler : any;

                    if (list === store.shortcutList) {
                        if (index === 0) {
                            handler = database.archiveAll();
                        } else if (index === 1) {
                            handler = database.archiveStarred();
                        }
                    } else if (list === store.hashTagList) {
                        handler = database.archiveByHashTag(props.name);
                    }

                    if (handler) handler.then(() => {
                        presenter.refreshShortcutList();
                        presenter.refreshHashTagList();
                        presenter.refreshDetailList();

                        if (list === store.hashTagList) presenter._hashTagListPresenter.notifyDataSetChanged();
                    }).catch(error => EventUtils.broadcast('app.error', error));
                }
            })
        }));
    }

    if (props.canDelete) {
        menu.append(new MenuItem({
            label : 'Delete notes…',
            click : () => showConfirmationDialog(store, presenter, 'Delete').then((result : boolean) => {
                if (result) {
                    database.removeArchived().then(() => {
                        presenter.refreshShortcutList();
                        presenter.refreshHashTagList();
                        presenter.refreshDetailList();
                    }).catch(error => EventUtils.broadcast('app.error', error));
                }
            })
        }));
    }

    if ((props.canArchive || props.canDelete) && props.canRestore) menu.append(new MenuItem({ type : 'separator' }));

    if (props.canRestore) menu.append(new MenuItem({
        label : 'Restore notes…',
        click : () => database.unarchiveAll().then(() => {
            presenter.refreshShortcutList();
            presenter.refreshHashTagList();
        }).catch(error => EventUtils.broadcast('app.error', error))
    }));

    menu.popup(remote.getCurrentWindow());
};

const showConfirmationDialog = (store : AppStore, presenter : AppPresenter, action : string) : Promise<boolean> => {
    return new Promise(resolve => {
        store.booleanDialog.title          = action + ' notes';
        store.booleanDialog.message        = 'Are you sure you wan to ' + action.toLocaleLowerCase() + ' the notes?';
        store.booleanDialog.trueLabel      = 'Yes, ' + action.toLocaleLowerCase() + ' them';
        store.booleanDialog.falseLabel     = 'No, keep them';
        store.booleanDialog.trueLabelColor = 'secondary';
        store.booleanDialog.trueAction     = () => resolve(true);
        store.booleanDialog.falseAction    = () => resolve(false);
        store.booleanDialog.booleanValue   = true;
    });
};

const updateMenu = (store : AppStore) : Promise<*> => {
    return new Promise((resolve : Function) => {
        const menu : Menu = Menu.getApplicationMenu().items[EnvironmentUtils.isMacOS() ? 3 : 2];

        menu.submenu.items[0].booleanValue = store.masterListShown;
        menu.submenu.items[1].booleanValue = store.detailListShown;

        resolve();
    });
};

const exportNote = (fileName : string, fullText : string) : void => {
    fs.writeFile(fileName, fullText, {
        encoding : 'utf-8',
        flag     : 'w'
    }, error => {
        if (error) dialog.showErrorBox('Error', error);
    });
};

const duplicateNote = (store : AppStore, presenter : AppPresenter, database : Database) : void => {
    const selectedItem : ?ListItemStore = store.detailList.selectedItem;

    if (selectedItem) {
        const now : number = Date.now();
        const doc : Object = selectedItem.record.toDoc();

        doc._id = undefined;
        doc.lastUpdateAt = now;
        doc.createdAt    = now;

        database.addOrUpdate(doc).then(() : void => {
            presenter.refreshShortcutList();
            presenter.refreshHashTagList();
            presenter.refreshDetailList();
        }).catch(error => EventUtils.broadcast('app.error', error));
    }
};

const initThemes = (store : AppStore) : void => {
    ThemeNames.items.forEach((themeName, i) => {
        const item = new ListItemStore();

        item.itemId      = 'setting-theme-' + ThemeCodes[i];
        item.primaryText = themeName;

        store.themeDialog.list.items.push(item);
    });
};

const changeTheme = (store : AppStore, theme : string) : void => {
    store.editor.theme = theme;

    Settings.set('theme', theme).catch(error => EventUtils.broadcast('app.error', error));

    store.theme = indexOf(Constants.DARK_THEMES, store.editor.theme) > -1 ? 'dark' : 'light';

    loadCss(ThemeHljs.items[indexOf(ThemeCodes.items, theme)]);
};

const loadCss = (css : string) : void => {
    const head    : any = document.getElementsByTagName('head')[0];
    const element : any = document.getElementById('hljs');

    if (element) head.removeChild(element);

    const link : any = document.createElement('link');

    link.id   = 'hljs';
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = './styles/hljs/' + css + '.css';

    head.appendChild(link);
};

const initFonts = (store : AppStore) : void => {
    Constants.FONTS.items.forEach((font : string, index : number) => {
        const item : ListItemStore = new ListItemStore();

        item.itemId      = 'setting-font-' + index;
        item.primaryText = font;

        store.fontDialog.list.items.push(item);
    });
};

const changeFont = (font : string) : void => {
    EventUtils.broadcast('editor.font.change', font);

    Settings.set('font', font).catch(error => EventUtils.broadcast('app.error', error));
};

const changeSettings = (store : AppStore, data : Object) : void => {
    if (data.name === 'highlightActiveLine') {
        store.editor.highlightActiveLine = data.value;
    } else if (data.name === 'tabSize') {
        store.editor.tabSize = data.value;
    } else if (data.name === 'useSoftTabs') {
        store.editor.useSoftTabs = data.value;
    } else if (data.name === 'wordWrap') {
        store.editor.wordWrap = data.value;
    } else if (data.name === 'showLineNumbers') {
        store.editor.showLineNumbers = data.value;
    } else if (data.name === 'showPrintMargin') {
        store.editor.showPrintMargin = data.value;
    } else if (data.name === 'printMarginColumn') {
        store.editor.printMarginColumn = data.value;
    } else if (data.name === 'showInvisibles') {
        store.editor.showInvisibles = data.value;
    } else if (data.name === 'showFoldWidgets') {
        store.editor.showFoldWidgets = data.value;
    } else if (data.name === 'showGutter') {
        store.editor.showGutter = data.value;
    } else if (data.name === 'scrollPastEnd') {
        store.editor.scrollPastEnd = data.value;
    } else {
        console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
    }

    Settings.set(data.name, data.value).catch(error => EventUtils.broadcast('app.error', error));
};

const resetDatabase = (database : Database) : void => {
    database.removeAll().catch(error => EventUtils.broadcast('app.error', error));
};

const resetSettings = () : void => {
    Settings.clear().catch(error => EventUtils.broadcast('app.error', error));
};

const clearCache = () : void => {
    Rx.Observable.interval(CLEAR_CACHE_INTERVAL).subscribe(() => remote.getCurrentWindow().webContents.session.clearCache(() => console.trace('Cache cleared')));
};

export default { handleMessage, handleMasterListWidthChange, handleDetailListWidthChange, handleAddNote, handleSortNotesClick, handleNoteItemRightClick, handleImportNotes, handleExportNote, handleExportNotes, showContextMenu, updateMenu, exportNote, initThemes, changeTheme, initFonts, changeFont, changeSettings, resetDatabase, resetSettings, clearCache };
