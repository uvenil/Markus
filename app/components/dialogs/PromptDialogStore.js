'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';

export default class PromptDialogStore extends BooleanStore {
    constructor() {
        super();

        extendObservable(this, {
            value : ''
        });
    }
}

module.exports = PromptDialogStore;
