'use strict';

import { extendObservable } from 'mobx';
import moment from 'moment';
import Config from '../../../config.json';
import _ from 'lodash';

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
     * Updates this store using the specific record.
     * @param {{ _id : String, title : String|undefined, description : String, lastUpdatedAt : Date }} record The record to update this store.
     */
    update(record) {
        this.itemId        = record._id;
        this.primaryText   = _.isEmpty(record.title) ? Config.defaultNoteTitle : record.title;
        this.secondaryText = record.description;
        this.tertiaryText  = moment(record.lastUpdatedAt).fromNow();
    }
}
