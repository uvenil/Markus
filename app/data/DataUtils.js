'use strict';

import { EditorState, convertToRaw } from 'draft-js';

export default class DataUtils {
    static createNewEditorState() {
        return convertToRaw(EditorState.createEmpty().getCurrentContent());
    }

    static createNewRecord() {
        const now = Date.now();

        return {
            title         : '',
            description   : '',
            plainText     : '',
            contentState  : DataUtils.createNewEditorState(),
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
