'use strict';

import React from 'react';
import { extendObservable } from 'mobx';

export default class EditorStore {
    constructor() {
        extendObservable(this, {
            record : null
        });
    }
}

module.exports = EditorStore;
