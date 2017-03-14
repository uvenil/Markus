// @flow
'use strict';

import { extendObservable } from 'mobx';

export default class BooleanStore {
    booleanValue : boolean;

    constructor(defaultValue : ?boolean) {
        extendObservable(this, {
            booleanValue : defaultValue !== undefined ? defaultValue : false
        });
    }
}
