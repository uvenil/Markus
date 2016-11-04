'use strict';

import { extendObservable } from 'mobx';
import BooleanStore from '../BooleanStore';
import SettingsStore from './SettingsStore';

export default class EditorSettingsDialogStore extends BooleanStore {
    constructor() {
        super();

        extendObservable(this, {
            settings : SettingsStore
        });
    }
}

module.exports = EditorSettingsDialogStore;
