'use strict';

import { EditorState, RichUtils } from 'draft-js';
import { extendObservable, computed } from 'mobx';
import Rx from 'rx-lite';

export default class NoteEditorStore {
    constructor() {
        extendObservable(this, {
            editorState : undefined,
            hidden      : false
        });

        this._editorStateSubject = new Rx.Subject();
    }

    /**
     * @returns {Rx.Subject}
     */
    get editorStateChanges() {
        return this._editorStateSubject;
    }

    undo() {
        this.editorState = EditorState.undo(this.editorState);
    }

    redo() {
        this.editorState = EditorState.redo(this.editorState);
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isBold() {
        return this.editorState.getCurrentInlineStyle().has('BOLD');
    }

    toggleBold() {
        this.editorState = RichUtils.toggleInlineStyle(this.editorState, 'BOLD');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isItalic() {
        return this.editorState.getCurrentInlineStyle().has('ITALIC');
    }

    toggleItalic() {
        this.editorState = RichUtils.toggleInlineStyle(this.editorState, 'ITALIC');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isUnderline() {
        return this.editorState.getCurrentInlineStyle().has('UNDERLINE');
    }

    toggleUnderline() {
        this.editorState = RichUtils.toggleInlineStyle(this.editorState, 'UNDERLINE');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isStrikethrough() {
        return this.editorState.getCurrentInlineStyle().has('STRIKETHROUGH');
    }

    toggleStrikethrough() {
        this.editorState = RichUtils.toggleInlineStyle(this.editorState, 'STRIKETHROUGH');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isCode() {
        return this.editorState.getCurrentInlineStyle().has('CODE');
    }

    toggleCode() {
        this.editorState = RichUtils.toggleInlineStyle(this.editorState, 'CODE');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isUnorderedList() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'unordered-list-item';
    }

    toggleUnorderedList() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'unordered-list-item');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isOrderedList() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'ordered-list-item';
    }

    toggleOrderedList() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'ordered-list-item');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isBlockQuote() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'blockquote';
    }

    toggleBlockQuote() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'blockquote');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isCodeBlock() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'code-block';
    }

    toggleCodeBlock() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'code-block');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading1() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-one';
    }

    toggleHeading1() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-one');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading2() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-two';
    }

    toggleHeading2() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-two');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading3() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-three';
    }

    toggleHeading3() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-three');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading4() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-four';
    }

    toggleHeading4() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-four');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading5() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-five';
    }

    toggleHeading5() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-five');
    }

    /**
     * @returns {boolean}
     */
    @computed
    get isHeading6() {
        return this.editorState.getCurrentContent().getBlockForKey(this.editorState.getSelection().getStartKey()).getType() === 'header-six';
    }

    toggleHeading6() {
        this.editorState = RichUtils.toggleBlockType(this.editorState, 'header-six');
    }
}

module.exports = NoteEditorStore;
