'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';
import ListViewStore from '../lists/ListViewStore';

export default class ListViewDialogStore extends BooleanStore {
    constructor() {
        super();

        extendObservable(this, {
            list : new ListViewStore()
        });
    }
}

module.exports = ListViewDialogStore;
