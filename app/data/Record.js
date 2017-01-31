// @flow
'use strict';

import { extendObservable } from 'mobx';
import ListItemStore from '../components/lists/ListItemStore';

export default class Record {
    _id            : ?string;
    title          : string;
    description    : string;
    fullText       : string;
    searchableText : string;
    syntax         : string;
    category       : ?string;
    starred        : boolean;
    archived       : boolean;
    lastUpdatedAt  : number;
    createdAt      : number;

    constructor(title : ?string, description : string, fullText : ?string, syntax : string, lastUpdatedAt : number, createdAt : number) {
        extendObservable(this, {
            title          : title,
            description    : description,
            fullText       : fullText,
            searchableText : fullText ? fullText.toLowerCase() : fullText,
            syntax         : syntax,
            category       : null,
            starred        : false,
            archived       : false,
            lastUpdatedAt  : lastUpdatedAt,
            createdAt      : createdAt
        });
    }

    static fromDoc(doc) {
        const record = new Record(doc.title, doc.description, doc.fullText, doc.syntax, doc.lastUpdatedAt, doc.createdAt);

        record._id      = doc._id;
        record.category = doc.category;
        record.starred  = doc.starred;
        record.archived = doc.archived;

        return record;
    }

    /**
     * Returns a record suitable for persistence.
     * @param {String} fullText
     * @returns {Record}
     */
    static fromText(syntax : string, fullText : ?string) : Record {
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
                        line2       = lines[2];
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
     * Converts to a plain JavaScript object suitable for database persistence.
     * @returns {{_id: *, title: *, description: *, fullText: *, syntax: (*|Blocks.syntax), lastUpdatedAt: (number|*), createdAt: (*|number)}}
     */
    toDoc() {
        return {
            _id            : this._id,
            title          : this.title,
            description    : this.description,
            fullText       : this.fullText,
            searchableText : this.fullText ? this.fullText.toLowerCase() : this.fullText,
            syntax         : this.syntax,
            category       : this.category,
            starred        : this.starred,
            archived       : this.archived,
            lastUpdatedAt  : this.lastUpdatedAt,
            createdAt      : this.createdAt
        };
    }

    /**
     * Converts this record to a ListItemStore.
     * @returns {ListItemStore}
     */
    toListItemStore() : ListItemStore {
        return new ListItemStore().update(this);
    }

    /**
     * Updates this record using the given full text.
     * @param {String} fullText The full text to update the specified record.
     */
    update(fullText : string) {
        const record = Record.fromText(this.syntax, fullText);

        this.title          = record.title;
        this.description    = record.description;
        this.fullText       = record.fullText;
        this.searchableText = record.fullText ? record.fullText.toLowerCase() : record.fullText;
        this.lastUpdatedAt  = Date.now();
    }
}
