'use strict';

import React from 'react';
import { extendObservable } from 'mobx';
import Record from '../../data/Record.js';
import moment from 'moment';
import Unique from '../../utils/Unique';
import Config from '../../definitions/config.json';
import isEmpty from 'lodash.isempty';

export default class ListItemStore {
    constructor() {
        extendObservable(this, {
            itemId        : undefined,
            icon          : 'tag',
            primaryText   : '',
            secondaryText : '',
            tertiaryText  : '',
            tooltip       : undefined,
            selected      : false,
            record        : undefined
        });
    }

    /**
     * Updates this store using the specific record.
     * @param {Record} record The record to update this store.
     * @return {ListItemStore} The current object.
     */
    update(record) {
        this.itemId        = record._id;
        this.primaryText   = isEmpty(record.title) ? Config.defaultNoteTitle : record.title;
        this.secondaryText = record.description ? record.description.split('\n').map(line => <span key={Unique.nextString()}>{line}<br /></span>) : record.description;
        this.tertiaryText  = moment(record.lastUpdatedAt).fromNow();
        this.tooltip       = 'Modified: ' + moment(record.lastUpdatedAt).format('LLLL') + '\nCreated: ' + moment(record.createdAt).format('LLLL');
        this.record        = record;

        return this;
    }
}

module.exports = ListItemStore;
