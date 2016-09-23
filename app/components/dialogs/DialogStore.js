'use strict';

import { extendObservable } from 'mobx';

export default class DialogStore {
    constructor() {
        extendObservable(this, {
            width   : 600,
            height  : 480,
            hidden  : true,
            title   : '',
            content : undefined
        });
    }
}

module.exports = DialogStore;
