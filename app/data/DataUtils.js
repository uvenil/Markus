'use strict';

import { EditorState, convertToRaw } from 'draft-js';
import PrismDecorator from 'draftjs-prism';

export default class DataUtils {
    /**
     * Creates a new PrismDecorator that recognizes the specified syntax.
     * @param {String} [syntaxName] The name of the syntax, defined in http://prismjs.com/#languages-list
     * @returns {PrismDecorator}
     */
    static createNewEditorDecorator(syntaxName) {
        //return syntaxName ? new PrismDecorator({ defaultSyntax : syntaxName }) : new PrismDecorator();
        return new PrismDecorator();
    }

    /**
     * Creates a new EditorState decorated by a PrismDecorator that recognizes the specified syntax.
     * @param {String} [syntaxName] The name of the syntax, defined in http://prismjs.com/#languages-list
     * @returns {object}
     */
    static createNewEditorState(syntaxName) {
        return convertToRaw(EditorState.createEmpty(DataUtils.createNewEditorDecorator(syntaxName)).getCurrentContent());
    }

    /**
     * Creates a new record object that is suitable for persistence.
     * @param {String} [syntaxName] The name of the syntax, defined in http://prismjs.com/#languages-list
     * @returns {{ title : string, description : string, plainText : string, contentState : Object, lastUpdatedAt : number, createdAt : number }}
     */
    static createNewRecord(syntaxName) {
        const now = Date.now();

        return {
            title         : '',
            description   : '',
            plainText     : '',
            contentState  : DataUtils.createNewEditorState(syntaxName),
            lastUpdatedAt : now,
            createdAt     : now
        };
    }

    /**
     * Returns a record suitable for persistence.
     * @param {EditorState} editorState
     * @returns {object}
     */
    static toRecord(editorState) {
        const now       = Date.now();
        const plainText = editorState.getCurrentContent().getPlainText('\n');

        if (plainText && plainText.length > 0 && plainText.indexOf('\n') > -1) {
            const lines = plainText.split('\n');

            let title       = '';
            let line1       = '';
            let line2       = '';
            let description = '';

            if (lines && lines.length > 0) {
                title = lines[0];

                if (lines.length > 1) {
                    line1 = lines[1];

                    if (lines.length > 2) {
                        line2 = lines[2];

                        description = line1 + '\n' + line2;
                    } else {
                        description = line1;
                    }
                }
            } else {
                title = plainText;
            }

            return {
                title         : title,
                description   : description,
                plainText     : plainText,
                contentState  : convertToRaw(editorState.getCurrentContent()),
                lastUpdatedAt : now,
                createdAt     : now
            };
        }

        return {
            title         : plainText,
            description   : '',
            plainText     : plainText,
            contentState  : convertToRaw(editorState.getCurrentContent()),
            lastUpdatedAt : now,
            createdAt     : now
        };
    }

    /**
     * Updates the specified record using the given EditorState.
     * @param {object} record The record to update.
     * @param {EditorState} editorState The EditorState to update the specified record.
     */
    static updateRecord(record, editorState) {
        const recordTemplate = DataUtils.toRecord(editorState);

        record.title         = recordTemplate.title;
        record.description   = recordTemplate.description;
        record.plainText     = recordTemplate.plainText;
        record.contentState  = convertToRaw(editorState.getCurrentContent());
        record.lastUpdatedAt = Date.now();
    }
}
