// @flow
'use strict';

import { extendObservable } from 'mobx';
import removeMarkdown from 'remove-markdown';

const toArray = (values : any) : string[] => {
    const array : string[] = [];

    for (let i = 0; i < values.length; i++) array.push(values[i]);

    return array;
};

export default class Record {
    _id            : ?string;
    title          : string;
    description    : string;
    fullText       : string;
    searchableText : string;
    hashTags       : string[];
    starred        : boolean;
    archived       : boolean;
    lastUpdatedAt  : number;
    createdAt      : number;

    constructor(title : ?string, description : ?string, fullText : ?string, lastUpdatedAt : number, createdAt : number) {
        extendObservable(this, {
            title          : title,
            description    : description,
            fullText       : fullText,
            searchableText : fullText ? removeMarkdown(fullText) : fullText,
            hashTags       : [],
            starred        : false,
            archived       : false,
            lastUpdatedAt  : lastUpdatedAt,
            createdAt      : createdAt
        });
    }

    static fromDoc(doc : Object) : Record {
        const record = new Record(doc.title, doc.description, doc.fullText, doc.lastUpdatedAt, doc.createdAt);

        record._id            = doc._id;
        record.searchableText = doc.fullText ? removeMarkdown(doc.fullText) : doc.fullText;
        record.hashTags       = doc.hashTags;
        record.starred        = doc.starred;
        record.archived       = doc.archived;

        return record;
    }

    static fromText(fullText : string) : Record {
        const now = Date.now();

        if (fullText && fullText.length > 0 && fullText.indexOf('\n') > -1) {
            const lines = fullText.split('\n');

            let title;
            let description;

            if (lines && lines.length > 0) {
                title = lines[0];

                if (lines.length > 1) {
                    if (lines.length > 2) {
                        description = lines[1] + '\n' + lines[2];
                    } else {
                        description = lines[1];
                    }
                }
            } else {
                title = fullText;
            }

            return new Record(title, description, fullText, now, now);
        }

        return new Record(fullText, undefined, fullText, now, now);
    }

    toDoc() : Object {
        return {
            _id            : this._id,
            title          : this.title,
            description    : this.description,
            fullText       : this.fullText,
            searchableText : this.fullText ? removeMarkdown(this.fullText) : this.fullText,
            hashTags       : toArray(this.hashTags),
            starred        : this.starred,
            archived       : this.archived,
            lastUpdatedAt  : this.lastUpdatedAt,
            createdAt      : this.createdAt
        };
    }

    update(fullText : string) : void {
        const record = Record.fromText(fullText);

        this.title          = record.title;
        this.description    = record.description;
        this.fullText       = record.fullText;
        this.searchableText = record.fullText ? removeMarkdown(record.fullText) : record.fullText;
        this.lastUpdatedAt  = Date.now();
    }
}
