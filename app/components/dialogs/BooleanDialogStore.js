// @flow
'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';

export default class BooleanDialogStore extends BooleanStore {
    title           : ?string;
    message         : ?string;
    trueLabel       : ?string;
    falseLabel      : ?string;
    trueLabelColor  : ?string;
    falseLabelColor : ?string;
    trueAction      : ?Function;
    falseAction     : ?Function;

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
