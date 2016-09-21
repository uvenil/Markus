'use strict';

import NoteListPresenter from '../lists/NoteListPresenter';
import NoteEditorPresenter from '../editors/NoteEditorPresenter';
import ImageButtonStore from './ImageButtonStore';
import ImageButtonBarStore from './ImageButtonBarStore';
import MenuImageButtonStore from './MenuImageButtonStore';
import Database from '../../data/Database';
import DataUtils from '../../data/DataUtils';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const EDITOR_STATE_CHANGES_DEBOUNCE = 10;

const HEADING_1     = 0;
const HEADING_2     = 1;
const HEADING_3     = 2;
const HEADING_4     = 3;
const HEADING_5     = 4;
const HEADING_6     = 5;
const HEADING_COUNT = 6;

export default class ImageButtonBarPresenter {
    /**
     * Creates a new instance of ImageButtonBarPresenter.
     * @param {NoteListPresenter} noteListPresenter
     * @param {NoteEditorPresenter} noteEditorPresenter
     * @param {Database} database
     */
    constructor(noteListPresenter, noteEditorPresenter, database) {
        this._noteListPresenter   = noteListPresenter;
        this._noteEditorPresenter = noteEditorPresenter;
        this._database            = database;

        this._initImageButtonBar();
    }

    /**
     * @returns {ImageButtonBarStore}
     */
    get imageButtonBarStore() {
        return this._imageButtonBarStore;
    }

    _initImageButtonBar() {
        this._imageButtonBarStore = new ImageButtonBarStore();

        const undoStore = new ImageButtonStore();
        undoStore.itemId   = 'undo';
        undoStore.icon     = 'fa fa-fw fa-undo';
        undoStore.tooltip  = 'Undo';
        undoStore.disabled = true;

        const redoStore = new ImageButtonStore();
        redoStore.itemId   = 'redo';
        redoStore.icon     = 'fa fa-fw fa-repeat';
        redoStore.tooltip  = 'Redo';
        redoStore.disabled = true;

        const divider1 = new ImageButtonStore();
        divider1.itemId = 'divider1';
        divider1.icon   = '-';

        const boldStore = new ImageButtonStore();
        boldStore.itemId   = 'bold';
        boldStore.icon     = 'fa fa-fw fa-bold';
        boldStore.tooltip  = 'Bold';
        boldStore.disabled = true;

        const italicStore = new ImageButtonStore();
        italicStore.itemId   = 'italic';
        italicStore.icon     = 'fa fa-fw fa-italic';
        italicStore.tooltip  = 'Italic';
        italicStore.disabled = true;

        const underlineStore = new ImageButtonStore();
        underlineStore.itemId   = 'underline';
        underlineStore.icon     = 'fa fa-fw fa-underline';
        underlineStore.tooltip  = 'Underline';
        underlineStore.disabled = true;

        const strikethroughStore = new ImageButtonStore();
        strikethroughStore.itemId   = 'strikethrough';
        strikethroughStore.icon     = 'fa fa-fw fa-strikethrough';
        strikethroughStore.tooltip  = 'Strikethrough';
        strikethroughStore.disabled = true;

        const codeStore = new ImageButtonStore();
        codeStore.itemId   = 'code';
        codeStore.icon     = 'fa fa-fw fa-font';
        codeStore.tooltip  = 'Fixed width';
        codeStore.disabled = true;

        const divider2 = new ImageButtonStore();
        divider2.itemId = 'divider2';
        divider2.icon   = '-';

        const bulletStore = new ImageButtonStore();
        bulletStore.itemId   = 'bullet';
        bulletStore.icon     = 'fa fa-fw fa-list-ul';
        bulletStore.tooltip  = 'Bullet';
        bulletStore.disabled = true;

        const listStore = new ImageButtonStore();
        listStore.itemId   = 'list';
        listStore.icon     = 'fa fa-fw fa-list-ol';
        listStore.tooltip  = 'List';
        listStore.disabled = true;

        const divider3 = new ImageButtonStore();
        divider3.itemId = 'divider3';
        divider3.icon   = '-';

        const headingStore = new MenuImageButtonStore();
        headingStore.itemId   = 'heading';
        headingStore.icon     = 'fa fa-fw fa-header';
        headingStore.disabled = true;

        for (let i = 1; i <= HEADING_COUNT; i++) {
            headingStore.items.push('Heading ' + i);
        }

        const divider4 = new ImageButtonStore();
        divider4.itemId = 'divider4';
        divider4.icon   = '-';

        const quoteStore = new ImageButtonStore();
        quoteStore.itemId   = 'quote';
        quoteStore.icon     = 'fa fa-fw fa-quote-left';
        quoteStore.tooltip  = 'Quote';
        quoteStore.disabled = true;

        const codeBlockStore = new ImageButtonStore();
        codeBlockStore.itemId   = 'codeBlock';
        codeBlockStore.icon     = 'fa fa-fw fa-code';
        codeBlockStore.tooltip  = 'Code';
        codeBlockStore.disabled = true;

        this._imageButtonBarStore.items.push(undoStore);
        this._imageButtonBarStore.items.push(redoStore);
        this._imageButtonBarStore.items.push(divider1);
        this._imageButtonBarStore.items.push(boldStore);
        this._imageButtonBarStore.items.push(italicStore);
        this._imageButtonBarStore.items.push(underlineStore);
        this._imageButtonBarStore.items.push(strikethroughStore);
        this._imageButtonBarStore.items.push(codeStore);
        this._imageButtonBarStore.items.push(divider2);
        this._imageButtonBarStore.items.push(bulletStore);
        this._imageButtonBarStore.items.push(listStore);
        this._imageButtonBarStore.items.push(divider3);
        this._imageButtonBarStore.items.push(headingStore);
        this._imageButtonBarStore.items.push(divider4);
        this._imageButtonBarStore.items.push(quoteStore);
        this._imageButtonBarStore.items.push(codeBlockStore);

        this._noteEditorPresenter.noteEditorStore.editorStateChanges
            .debounce(EDITOR_STATE_CHANGES_DEBOUNCE)
            .subscribe(editorState => {
                if (this._noteListPresenter.noteListStore.selectedItemId) {
                    // Enables toolbar buttons
                    this._imageButtonBarStore.items.forEach(item => item.disabled = false);

                    boldStore.icon          = 'fa fa-fw fa-bold'          + (this._noteEditorPresenter.noteEditorStore.isBold          ? ' primaryColor' : ' primaryTextColor');
                    italicStore.icon        = 'fa fa-fw fa-italic'        + (this._noteEditorPresenter.noteEditorStore.isItalic        ? ' primaryColor' : ' primaryTextColor');
                    underlineStore.icon     = 'fa fa-fw fa-underline'     + (this._noteEditorPresenter.noteEditorStore.isUnderline     ? ' primaryColor' : ' primaryTextColor');
                    strikethroughStore.icon = 'fa fa-fw fa-strikethrough' + (this._noteEditorPresenter.noteEditorStore.isStrikethrough ? ' primaryColor' : ' primaryTextColor');
                    codeStore.icon          = 'fa fa-fw fa-font'          + (this._noteEditorPresenter.noteEditorStore.isCode          ? ' primaryColor' : ' primaryTextColor');
                    bulletStore.icon        = 'fa fa-fw fa-list-ul'       + (this._noteEditorPresenter.noteEditorStore.isUnorderedList ? ' primaryColor' : ' primaryTextColor');
                    listStore.icon          = 'fa fa-fw fa-list-ol'       + (this._noteEditorPresenter.noteEditorStore.isOrderedList   ? ' primaryColor' : ' primaryTextColor');
                    quoteStore.icon         = 'fa fa-fw fa-quote-left'    + (this._noteEditorPresenter.noteEditorStore.isBlockQuote    ? ' primaryColor' : ' primaryTextColor');
                    codeBlockStore.icon     = 'fa fa-fw fa-code'          + (this._noteEditorPresenter.noteEditorStore.isCodeBlock     ? ' primaryColor' : ' primaryTextColor');

                    if (this._noteEditorPresenter.noteEditorStore.isHeading1) {
                        headingStore.selectedIndex = HEADING_1;
                    } else if (this._noteEditorPresenter.noteEditorStore.isHeading2) {
                        headingStore.selectedIndex = HEADING_2;
                    } else if (this._noteEditorPresenter.noteEditorStore.isHeading3) {
                        headingStore.selectedIndex = HEADING_3;
                    } else if (this._noteEditorPresenter.noteEditorStore.isHeading4) {
                        headingStore.selectedIndex = HEADING_4;
                    } else if (this._noteEditorPresenter.noteEditorStore.isHeading5) {
                        headingStore.selectedIndex = HEADING_5;
                    } else if (this._noteEditorPresenter.noteEditorStore.isHeading6) {
                        headingStore.selectedIndex = HEADING_6;
                    } else {
                        headingStore.selectedIndex = -1;
                    }

                    this._database.findById(this._noteListPresenter.noteListStore.selectedItemId)
                        .then(record => {
                            DataUtils.updateRecord(record, editorState);

                            this._database.addOrUpdate(record)
                                .then(doc => this._noteListPresenter.noteListStore.getSelectedItem().update(doc))
                                .catch(error => console.error(error));
                        }).catch(error => console.error(error));
                } else {
                    // Disables toolbar buttons
                    this._imageButtonBarStore.items.forEach(item => item.disabled = true);
                }
            });
    }

    /**
     * @param {String} itemId
     * @param {number} [index]
     */
    handleTouchTap(itemId, index) {
        switch (itemId) {
            case 'undo'         : this._noteEditorPresenter.noteEditorStore.undo();                break;
            case 'redo'         : this._noteEditorPresenter.noteEditorStore.redo();                break;
            case 'bold'         : this._noteEditorPresenter.noteEditorStore.toggleBold();          break;
            case 'italic'       : this._noteEditorPresenter.noteEditorStore.toggleItalic();        break;
            case 'underline'    : this._noteEditorPresenter.noteEditorStore.toggleUnderline();     break;
            case 'strikethrough': this._noteEditorPresenter.noteEditorStore.toggleStrikethrough(); break;
            case 'code'         : this._noteEditorPresenter.noteEditorStore.toggleCode();          break;
            case 'bullet'       : this._noteEditorPresenter.noteEditorStore.toggleUnorderedList(); break;
            case 'list'         : this._noteEditorPresenter.noteEditorStore.toggleOrderedList();   break;
            case 'quote'        : this._noteEditorPresenter.noteEditorStore.toggleBlockQuote();    break;
            case 'codeBlock'    : this._noteEditorPresenter.noteEditorStore.toggleCodeBlock();     break;

            case 'heading':
                switch (index) {
                    case HEADING_1: this._noteEditorPresenter.noteEditorStore.toggleHeading1(); break;
                    case HEADING_2: this._noteEditorPresenter.noteEditorStore.toggleHeading2(); break;
                    case HEADING_3: this._noteEditorPresenter.noteEditorStore.toggleHeading3(); break;
                    case HEADING_4: this._noteEditorPresenter.noteEditorStore.toggleHeading4(); break;
                    case HEADING_5: this._noteEditorPresenter.noteEditorStore.toggleHeading5(); break;
                    case HEADING_6: this._noteEditorPresenter.noteEditorStore.toggleHeading6(); break;
                }

                break;
        }

        document.getElementById('noteEditor').click();
        PubSub.publish('noteEditor.focus');
    }
}

module.exports = ImageButtonBarPresenter;
