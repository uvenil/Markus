'use strict';

import { EditorState, convertFromRaw } from 'draft-js';
import ImageButtonBarPresenter from '../buttons/ImageButtonBarPresenter';
import NoteEditorStore from './NoteEditorStore';
import Database from '../../data/Database';
import DataUtils from '../../data/DataUtils';

export default class NoteEditorPresenter {
    /**
     * Creates a new instance of NoteEditorPresenter.
     * @param {Database} database
     */
    constructor(database) {
        this._database   = database;
        this._syntaxName = undefined;

        this._initNoteEditor();
    }

    /**
     * @returns {NoteEditorStore}
     */
    get noteEditorStore() {
        return this._noteEditorStore;
    }

    /**
     * @param {ImageButtonBarPresenter}imageButtonBarPresenter
     */
    set imageButtonBarPresenter(imageButtonBarPresenter) {
        this._imageButtonBarPresenter = imageButtonBarPresenter;
    }

    /**
     * Sets the syntax to highlight.
     * @param {String} syntaxName
     */
    set syntax(syntaxName) {
        this._syntaxName = syntaxName;

        this._noteEditorStore.editorState = EditorState.set(this._noteEditorStore.editorState, { decorator : DataUtils.createNewEditorDecorator(syntaxName) });
    }

    _initNoteEditor() {
        this._noteEditorStore = new NoteEditorStore();
        this._noteEditorStore.editorState = EditorState.createWithContent(convertFromRaw(DataUtils.createNewEditorState()));
        this._noteEditorStore.hidden      = true;
    }

    /**
     * @param {String} [selectedNoteListItem]
     */
    refreshNoteEditor(selectedNoteListItem) {
        if (selectedNoteListItem) {
            this._database.findById(selectedNoteListItem)
                .then(record => {
                    this._noteEditorStore.editorState = EditorState.createWithContent(convertFromRaw(record.contentState), DataUtils.createNewEditorDecorator(this._syntaxName));
                    this._noteEditorStore.hidden      = false;

                    // Enables toolbar buttons
                    this._imageButtonBarPresenter.imageButtonBarStore.items.forEach(item => item.disabled = false);
                }).catch(error => console.error(error));
        } else {
            this._noteEditorStore.hidden = true;

            // Enables toolbar buttons
            this._imageButtonBarPresenter.imageButtonBarStore.items.forEach(item => item.disabled = true);
        }
    }
}

module.exports = NoteEditorPresenter;
