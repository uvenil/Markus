'use strict';

import AppStore from './AppStore';
import FilterListViewPresenter from './components/lists/FilterListViewPresenter';
import CategoryListViewPresenter from './components/lists/CategoryListViewPresenter';
import NoteListViewPresenter from './components/lists/NoteListViewPresenter';
import TextEditorPresenter from './components/text/TextEditorPresenter';
import Settings from './utils/Settings';
import Database from './data/Database';
import Record from './data/Record';
import Rx from 'rx-lite';
import Config from '../config.json';
import Package from '../package.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const { Menu }      = require('electron').remote;
const WindowManager = require('electron').remote.require('electron-window-manager');

export default class AppPresenter {
    constructor() {
        this._store    = new AppStore();
        this._settings = new Settings();
        this._database = new Database();

        this._filtersPresenter    = new FilterListViewPresenter(this._database);
        this._categoriesPresenter = new CategoryListViewPresenter(this._database);
        this._notesPresenter      = new NoteListViewPresenter(this._filtersPresenter, this._categoriesPresenter, this._database);
        this._editorPresenter     = new TextEditorPresenter(this._database);

        this._store.filtersStore    = this._filtersPresenter.store;
        this._store.categoriesStore = this._categoriesPresenter.store;
        this._store.notesStore      = this._notesPresenter.store;
        this._store.editorStore     = this._editorPresenter.store;

        this._filterSelection   = new Rx.Subject();
        this._categorySelection = new Rx.Subject();
        this._noteSelection     = new Rx.Subject();

        Rx.Observable.zip(this._filterSelection, this._categorySelection, (selectedFilterIndex, selectedCategoryIndex) => selectedFilterIndex > -1 || selectedCategoryIndex > -1)
            .subscribe(hasSelection => {
                this._store.addNoteEnabled = hasSelection;

                this.refreshNotes();
            });
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

    handleFilterItemClick(index) {
        if (this._store.filtersStore.selectedIndex !== index) {
            console.trace('Selected filter index = ' + index);

            this._store.filtersStore.selectedIndex    = index;
            this._store.categoriesStore.selectedIndex = -1;

            this._filterSelection.onNext(index);
            this._categorySelection.onNext(-1);
        }
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

    handleNoteItemClick(index) {
        if (this._store.notesStore.selectedIndex !== index) {
            console.trace('Selected note index = ' + index);

            this._store.notesStore.selectedIndex = index;

            this._noteSelection.onNext(index);

            this.refreshEditor();
        }
    }

    handleAddCategoryClick() {
        // TODO: Prompts for new category

        // TODO: Checks for duplicate categories

        this._categoriesPresenter.addCategory();
    }

    handleAddNoteClick() {
        this._notesPresenter.addNote(this._defaultSyntax)
            .then(() => {
                this._store.notesStore.selectedIndex = 0;

                this.refreshEditor();

                this._noteSelection.onNext(0);
            }).catch(error => console.error(error));
    }

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

    showAboutDialog() {
        if (WindowManager.get('AboutDialog')) return;

        WindowManager.createNew('AboutDialog', Package.productName, 'file://' + __dirname + '/about.html', false, {
            width         : Config.aboutWindowWidth,
            height        : Config.aboutWindowHeight,
            resizable     : false,
            onLoadFailure : window => window.close()
        }).open();
    }

    /**
     * @param {String} syntax
     */
    changeSyntax(syntax) {
        this._store.editorStore.syntax = syntax;

        if (this._store.editorStore.record) {
            this._store.editorStore.record.syntax = syntax;

            this._store.editorStore.changes.onNext(this._store.editorStore.record);
        }

        this._updateMenu();
    }

    /**
     * @param {String} theme
     */
    changeTheme(theme) {
        this._store.editorStore.theme = theme;

        this._updateMenu();

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
        } else if (data.name === 'spellCheck') {
            this._store.editorStore.spellCheck = data.value;
        } else {
            console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
        }

        this._updateMenu();

        this._settings.set(data.name, data.value)
            .then(() => console.trace('Saved setting ' + data.name + ' = ' + data.value))
            .catch(error => console.error(error));
    }

    resetDatabase() {
        this._database.removeAll();
    }

    resetSettings() {
        this._settings.clear()
            .catch(error => console.error(error));
    }

    _initSettings() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._settings.get('defaultSyntax',       Config.defaultSyntax),
                this._settings.get('theme',               Config.defaultTheme),
                this._settings.get('fontFamily',          undefined),
                this._settings.get('textSize',            undefined),
                this._settings.get('highlightActiveLine', Config.defaultHighlightActiveLine),
                this._settings.get('tabSize',             Config.defaultTabSize),
                this._settings.get('useSoftTabs',         Config.defaultUseSoftTabs),
                this._settings.get('wordWrap',            Config.defaultWordWrap),
                this._settings.get('showLineNumbers',     Config.defaultShowLineNumbers),
                this._settings.get('showInvisibles',      Config.defaultShowInvisibles),
                this._settings.get('showFoldWidgets',     Config.defaultShowFoldWidgets),
                this._settings.get('showGutter',          Config.defaultShowGutter),
                this._settings.get('displayIndentGuides', Config.defaultDisplayIndentGuides),
                this._settings.get('scrollPastEnd',       Config.defaultScrollPastEnd),
                this._settings.get('spellCheck',          Config.defaultSpellCheck)
            ]).then(values => {
                const data = {};

                data.highlightActiveLine = values[4]  !== undefined ? values[4]  : Config.defaultHighlightActiveLine;
                data.tabSize             = values[5]  !== undefined ? values[5]  : Config.defaultTabSize;
                data.useSoftTabs         = values[6]  !== undefined ? values[6]  : Config.defaultUseSoftTabs;
                data.wordWrap            = values[7]  !== undefined ? values[7]  : Config.defaultWordWrap;
                data.showLineNumebrs     = values[8]  !== undefined ? values[8]  : Config.defaultShowLineNumbers;
                data.showInvisibles      = values[9]  !== undefined ? values[9]  : Config.defaultShowInvisibles;
                data.showFoldWidgets     = values[10] !== undefined ? values[10] : Config.defaultShowFoldWidgets;
                data.showGutter          = values[11] !== undefined ? values[11] : Config.defaultShowGutter;
                data.displayIndentGuides = values[12] !== undefined ? values[12] : Config.defaultDisplayIndentGuides;
                data.scrollPastEnd       = values[13] !== undefined ? values[13] : Config.defaultScrollPastEnd;
                data.spellCheck          = values[14] !== undefined ? values[14] : Config.defaultSpellCheck;

                this._store.editorStore.syntax              = values[0] ? values[0] : Config.defaultSyntax;
                this._store.editorStore.theme               = values[1] ? values[1] : Config.defaultTheme;
                this._store.editorStore.fontFamily          = values[2] ? values[2] : undefined;
                this._store.editorStore.textSize            = values[3] ? values[3] : undefined;
                this._store.editorStore.highlightActiveLine = data.highlightActiveLine;
                this._store.editorStore.tabSize             = data.tabSize;
                this._store.editorStore.useSoftTabs         = data.useSoftTabs;
                this._store.editorStore.wordWrap            = data.wordWrap;
                this._store.editorStore.showLineNumbers     = data.showLineNumebrs;
                this._store.editorStore.showInvisibles      = data.showInvisibles;
                this._store.editorStore.showFoldWidgets     = data.showFoldWidgets;
                this._store.editorStore.showGutter          = data.showGutter;
                this._store.editorStore.displayIndentGuides = data.displayIndentGuides;
                this._store.editorStore.scrollPastEnd       = data.scrollPastEnd;
                this._store.editorStore.spellCheck          = data.spellCheck;

                PubSub.publish('TextEditor.init', data);

                this._updateMenu();
                this._updateSyntaxMenu();

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

    _updateMenu() {
        return new Promise((resolve, reject) => {
            const preferencesMenu = Menu.getApplicationMenu().items[is.macOS() ? 0 : 1].submenu.items[is.macOS() ? 2 : 9];

            if (this._store.editorStore.tabSize === 2) {
                preferencesMenu.submenu.items[2].submenu.items[0].checked = true;
            } else if (this._store.editorStore.tabSize === 4) {
                preferencesMenu.submenu.items[2].submenu.items[1].checked = true;
            } else if (this._store.editorStore.tabSize === 8) {
                preferencesMenu.submenu.items[2].submenu.items[2].checked = true;
            }

            preferencesMenu.submenu.items[1].checked  = this._store.editorStore.highlightActiveLine;
            preferencesMenu.submenu.items[3].checked  = this._store.editorStore.useSoftTabs;
            preferencesMenu.submenu.items[4].checked  = this._store.editorStore.wordWrap;
            preferencesMenu.submenu.items[5].checked  = this._store.editorStore.showLineNumbers;
            preferencesMenu.submenu.items[6].checked  = this._store.editorStore.showInvisibles;
            preferencesMenu.submenu.items[7].checked  = this._store.editorStore.showFoldWidgets;
            preferencesMenu.submenu.items[8].checked  = this._store.editorStore.showGutter;
            preferencesMenu.submenu.items[9].checked  = this._store.editorStore.displayIndentGuides;
            preferencesMenu.submenu.items[10].checked = this._store.editorStore.scrollPastEnd;
            preferencesMenu.submenu.items[11].checked = this._store.editorStore.spellCheck;

            const themeMenu = Menu.getApplicationMenu().items[is.macOS() ? 3 : 2].submenu.items[4];
            const themes    = [ 'ambiance', 'chaos', 'chrome', 'clouds', 'clouds_midnight', 'cobalt', 'crimson_editor', 'dawn', 'dreamweaver', 'eclipse', 'github', 'idle_fingers', 'ipastic', 'katzenmilch', 'kr_theme', 'kuroir', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monkai', 'pastal_on_dark', 'solarized_dark', 'solarized_light', 'sqlserver', 'terminal', 'textmate', 'tomorrow', 'tomorrow_night', 'tomorrow_night_blue', 'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink', 'xcode' ];

            for (let i = 0; i < themes.length; i++) {
                if (this._store.editorStore.theme === themes[i]) {
                    themeMenu.submenu.items[ i ].checked = true;
                }
            }

            resolve();
        });
    }

    _updateSyntaxMenu() {
        return new Promise((resolve, reject) => {
            const syntaxMenu = Menu.getApplicationMenu().items[is.macOS() ? 3 : 2].submenu.items[3];
            const syntaxes   = [ /*'abap', 'abc', */'actionscript', 'ada', 'apache_conf', 'applescript', /*'asciidoc', 'assemble_x86', 'autohotkey', */'batchfile', 'cpp', /*'cirru', */'clojure', /*'cobol', */'coffee', 'coldfusion', 'csharp', 'css', /*'curly', */'d', /*'dart', 'diff', */'django', 'dockerfile', /*'dot', 'drools', 'eiffel', */'ejs', 'elixir', 'elm', 'erlang', /*'forth', 'fortran', 'ftl', 'gcode', */'gherkin', 'gitignore', /*'glsl', 'gobstones', */'golang', 'groovy', 'haml', 'handlebars', 'haskell', /*'haxe', */'html', 'html_elixir', 'html_ruby', 'ini', /*'io', 'jack', */'jade', 'java', 'javascript', 'json', 'jsp', 'jsx', /*'julia', */'kotlin', 'latex', 'less', /*'liquid', */'lisp', /*'livescript', 'logiql', 'lsl', */'lua', /*'luapage', 'lucene', */'makefile', 'markdown', /*'mask', */'matlab', /*'maze', 'mel', 'mushcode', */'mysql', /*'nix', */'nsis', 'objectivec', 'ocaml', /*'pascal', */'perl', 'pgsql', 'php', 'plain_text', 'powershell', /*'praat', */'prolog', 'properties', /*'protobuf', */'python', 'r', /*'razor', 'rdoc', 'rhtml', */'ruby', /*'rust', */'sass', /*'scad', */'scala', /*'scheme', */'scss', 'sh', /*'sjs', 'smarty', 'soy', 'space', */'sql', 'sqlserver', /*'stylus', 'svg', */'swift', 'tcl', /*'tex', 'textile', 'toml', 'tsx', 'twig', */'typescript', /*'vala', */'vbscript', /*'velocity', 'verilog', */'vhdl', /*'wollok', */'xml', 'xquery', 'yaml' ];

            for (let i = 0; i < syntaxes.length; i++) {
                if ((this._store.editorStore.record ? this._store.editorStore.record.syntax ? this._store.editorStore.record.syntax : this._store.editorStore.syntax : this._store.editorStore.syntax) === syntaxes[i]) {
                    syntaxMenu.submenu.items[i].checked = true;
                }
            }

            resolve();
        });
    }
}

module.exports = AppPresenter;
