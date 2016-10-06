'use strict';

import { extendObservable } from 'mobx';

export default class Record {
    constructor(title, description, fullText, syntax, lastUpdatedAt, createdAt) {
        extendObservable(this, {
            title         : title,
            description   : description,
            fullText      : fullText,
            syntax        : syntax,
            lastUpdatedAt : lastUpdatedAt,
            createdAt     : createdAt
        });
    }

    /**
     * Returns a record suitable for persistence.
     * @param {String} fullText
     * @returns {Record}
     */
    static from(fullText) {
        const now = Date.now();

        if (fullText && fullText.length > 0 && fullText.indexOf('\n') > -1) {
            const lines = fullText.split('\n');

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
                title = fullText;
            }

            return new Record(title, description, fullText, syntax, now, now);
        }

        return new Record(fullText, '', fullText, syntax, now, now);
    }

    /**
     * Updates this record using the given full text.
     * @param {String} fullText The full text to update the specified record.
     */
    update(fullText) {
        const record = Record.from(fullText);

        this.title         = record.title;
        this.description   = record.description;
        this.fullText      = record.fullText;
        this.syntax        = record.syntax;
        this.lastUpdatedAt = Date.now();
    }
}
