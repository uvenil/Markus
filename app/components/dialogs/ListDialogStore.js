// @flow
'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';
import ListStore from '../lists/ListStore';

export default class ListDialogStore extends BooleanStore {
    list : ListStore;

    constructor() {
        super();

        extendObservable(this, {
            list : new ListStore()
        });
    }
}
