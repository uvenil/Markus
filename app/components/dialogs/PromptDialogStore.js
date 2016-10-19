'use strict';

import DialogStore from './DialogStore';
import { extendObservable } from 'mobx';

export default class PromptDialogStore extends DialogStore {
    constructor() {
        super();

        extendObservable(this, {
            value : ''
        });
    }
}

module.exports = PromptDialogStore;
