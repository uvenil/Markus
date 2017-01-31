// @flow
'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';

export default class PromptDialogStore extends BooleanStore {
    value : string;

    constructor() {
        super();

        extendObservable(this, {
            value : ''
        });
    }
}
