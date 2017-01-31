// @flow
'use strict';

import React from 'react';
import { extendObservable } from 'mobx';
import Record from '../../data/Record.js';
import moment from 'moment';
import Unique from '../../utils/Unique';
import Config from '../../definitions/config.json';
import isEmpty from 'lodash.isempty';

export default class ListItemStore {
    itemId        : ?string;
    icon          : string;
    primaryText   : string;
    secondaryText : any;
    tertiaryText  : string;
    tooltip       : string;
    selected      : boolean;
    record        : Record;

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
    update(record : Record) : ListItemStore {
        this.itemId       = record._id;
        this.primaryText  = isEmpty(record.title) ? Config.defaultNoteTitle : record.title;
        this.tertiaryText = moment(record.lastUpdatedAt).fromNow();
        this.tooltip      = 'Modified: ' + moment(record.lastUpdatedAt).format('LLLL') + '\nCreated: ' + moment(record.createdAt).format('LLLL');
        this.record       = record;

        if (record.description && record.description.indexOf('\n') > -1) {
            const lines = record.description.split('\n');

            this.secondaryText = <span key={Unique.nextString()}>{lines[0]}<br />{lines[1]}</span>;
        } else {
            this.secondaryText = record.description;
        }

        return this;
    }
}
