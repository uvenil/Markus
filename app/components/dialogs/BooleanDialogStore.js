'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';

export default class BooleanDialogStore extends BooleanStore {
    constructor() {
        super();

        extendObservable(this, {
            title           : undefined,
            message         : undefined,
            trueLabel       : 'Yes',
            falseLabel      : 'No',
            trueLabelColor  : 'primary',
            falseLabelColor : 'default',
            trueAction      : undefined,
            falseAction     : undefined
        });
    }
}

module.exports = BooleanDialogStore;
