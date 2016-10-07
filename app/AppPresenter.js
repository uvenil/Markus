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

export default class AppPresenter {
    constructor() {
        this._store    = new AppStore();
        this._settings = new Settings();
        this._database = new Database();

        this._defaultSyntax = Config.defaultSyntax;

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

        this._initSettings()
            .then(() => this._initDatabase()
                .then(() => this._initAutoSave())
                .catch(error => console.error(error)))
            .catch(error => console.error(error));
    }

    get store() {
        return this._store;
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

        this._editorPresenter.load(this._store.notesStore.selectedItemId);
    }

    resetDatabase() {
        this._database.removeAll();
    }

    _initSettings() {
        return new Promise((resolve, reject) => {
            this._settings.get('defaultSyntax', Config.defaultSyntax)
                .then(value => {
                    this._defaultSyntax = value;

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
}

module.exports = AppPresenter;
