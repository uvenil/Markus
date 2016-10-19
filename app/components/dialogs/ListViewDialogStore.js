'use strict';

import { extendObservable } from 'mobx';
import DialogStore from './DialogStore';
import ListViewStore from '../lists/ListViewStore';

export default class ListViewDialogStore extends DialogStore {
    constructor() {
        super();

        extendObservable(this, {
            list : undefined
        });

        this.list = new ListViewStore();
    }
}

module.exports = ListViewDialogStore;
