'use strict';

import { extendObservable } from 'mobx';
import moment from 'moment';
import Config from '../../../config/config.json';

export default class ListItemStore {
    constructor() {
        extendObservable(this, {
            itemId        : undefined,
            primaryText   : '',
            secondaryText : '',
            tertiaryText  : '',
            selected      : false
        });
    }

    /**
     * Updates this store using the specified record.
     * @param {object} record The record to update this store.
     */
    update(record) {
        this.itemId        = record._id;
        this.primaryText   = record.title && record.title.length > 0 ? record.title : Config.defaultNoteTitle;
        this.secondaryText = record.description;
        this.tertiaryText  = moment(record.lastUpdatedAt).fromNow();
    }
}

module.exports = ListItemStore;
