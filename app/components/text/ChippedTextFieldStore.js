// @flow
'use strict';

import { extendObservable } from 'mobx';

export default class ChippedTextFieldStore {
    chips : string[];

    constructor() {
        extendObservable(this, {
            chips : []
        });
    }
}
