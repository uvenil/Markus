// @flow
'use strict';

import React from 'react';
import { extendObservable } from 'mobx';
import Record from '../../data/Record.js';
import DateUtils from '../../utils/DateUtils';
import isEmpty from 'lodash.isempty';
import Config from '../../definitions/config.json';

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

    update(record : Record) : void {
        this.itemId       = record._id;
        this.primaryText  = isEmpty(record.title) ? Config.defaultTitle : record.title;
        this.tertiaryText = DateUtils.fromNow(record.lastUpdatedAt);
        this.tooltip      = 'Modified: ' + new Date(record.lastUpdatedAt).toLocaleDateString() + '/nCreated: ' + new Date(record.createdAt).toLocaleDateString();
        this.record       = record;

        if (record.description && record.description.indexOf('\n') >= 0) {
            const lines = record.description.split('\n');

            this.secondaryText = <span>{lines[0]}<br />{lines[1]}</span>;
        } else {
            this.secondaryText = record.description;
        }
    }
}
