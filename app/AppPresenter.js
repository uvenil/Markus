'use strict';

import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import FilterListPresenter from './components/lists/FilterListPresenter';
import NoteListPresenter from './components/lists/NoteListPresenter';
import NoteEditorPresenter from './components/editors/NoteEditorPresenter';
import ImageButtonBarPresenter from './components/buttons/ImageButtonBarPresenter';
import AppStore from './AppStore';
import ImageButtonStore from './components/buttons/ImageButtonStore';
import MenuTextButtonStore from './components/buttons/MenuTextButtonStore';
import Database from './data/Database';
import Config from '../config/config.json';

export default class AppPresenter {
    /**
     * Creates a new instance of AppPresenter.
     * @param {AppStore} store
     */
    constructor(store) {
        this._store    = store;
        this._database = new Database();

        this._filterListPresenter = new FilterListPresenter(this._database);
        this._store.filterListStore   = this._filterListPresenter.filterListStore;
        this._store.categoryListStore = this._filterListPresenter.categoryListStore;

        this._noteListPresenter = new NoteListPresenter(this._filterListPresenter, this._database);
        this._store.noteListStore = this._noteListPresenter.noteListStore;

        this._noteEditorPresenter = new NoteEditorPresenter(this._database);
        this._store.noteEditorStore = this._noteEditorPresenter.noteEditorStore;
        this._noteEditorPresenter.syntax = 'javascript';

        this._imageButtonBarPresenter = new ImageButtonBarPresenter(this._noteListPresenter, this._noteEditorPresenter, this._database);
        this._store.imageButtonBarStore = this._imageButtonBarPresenter.imageButtonBarStore;
        this._noteEditorPresenter.imageButtonBarPresenter = this._imageButtonBarPresenter;

        this._initAddNoteButtonStore();
        this._initSortNoteButtonStore();
        this._initDatabase();
    }

    /**
     * @returns {ImageButtonStore}
     */
    get addNoteButtonStore() {
        return this._addNoteButtonStore;
    }

    /**
     * @returns {MenuTextButtonStore}
     */
    get sortNoteButtonStore() {
        return this._sortNoteButtonStore;
    }

    /**
     * @returns {FilterListPresenter}
     */
    get filterListPresenter() {
        return this._filterListPresenter;
    }

    _initAddNoteButtonStore() {
        this._addNoteButtonStore = new ImageButtonStore();
        this._addNoteButtonStore.itemId   = 'addNote';
        this._addNoteButtonStore.icon     = 'fa fa-fw fa-plus';
        this._addNoteButtonStore.tooltip  = 'Add note';
        this._addNoteButtonStore.disabled = true;
    }

    _initSortNoteButtonStore() {
        this._sortNoteButtonStore = new MenuTextButtonStore();
        this._sortNoteButtonStore.itemId        = 'sortNote';
        this._sortNoteButtonStore.text          = 'Sort by last updated ▼';
        this._sortNoteButtonStore.selectedIndex = NoteListPresenter.DEFAULT_SORTING;
        this._sortNoteButtonStore.disabled      = true;

        this._sortNoteButtonStore.items.push('Sort by title ▼');
        this._sortNoteButtonStore.items.push('Sort by title ▲');
        this._sortNoteButtonStore.items.push('Sort by last updated ▼');
        this._sortNoteButtonStore.items.push('Sort by last updated ▲');
        this._sortNoteButtonStore.items.push('Sort by created ▼');
        this._sortNoteButtonStore.items.push('Sort by created ▲');
    }

    _initDatabase() {
        this._database.load(Config.databaseName)
            .then(() => {
                this.refreshFilterList();
                this.refreshCategoryList();
                this.refreshNoteList();
            }).catch(error => console.error(error));
    }

    enableNoteList() {
        this._addNoteButtonStore.disabled  = false;
        this._sortNoteButtonStore.disabled = false;
    }

    refreshFilterList() {
        this._noteListPresenter.noteListStore.selectedItemId = undefined;
        this._noteEditorPresenter.noteEditorStore.hidden     = true;

        this._filterListPresenter.refreshFilterList();
        this.refreshNoteList();
    }

    refreshCategoryList() {
        this._noteListPresenter.noteListStore.selectedItemId = undefined;
        this._noteEditorPresenter.noteEditorStore.hidden     = true;

        this._filterListPresenter.refreshCategoryList();
        this.refreshNoteList();
    }

    refreshNoteList() {
        this._noteListPresenter.refreshNoteList();
        this._noteEditorPresenter.refreshNoteEditor();
    }

    refreshNoteEditor() {
        this._noteEditorPresenter.refreshNoteEditor(this._noteListPresenter.noteListStore.selectedItemId);
    }

    addNewNote() {
        this._noteListPresenter.addNewNote();
    }

    sortNoteList(index) {
        // TODO
    }

    handleImageButtonBarTouchTap(itemId, index) {
        this._imageButtonBarPresenter.handleTouchTap(itemId, index);
    }
}

module.exports = AppPresenter;
