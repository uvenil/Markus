// @flow
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppPresenter from './AppPresenter';
import EnvironmentUtils from './utils/EnvironmentUtils';
import ShortcutManager from 'react-shortcuts/lib/shortcut-manager';
import KeyMap from './definitions/keys/keymap.json';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const createWindowMenu = EnvironmentUtils.isMacOS() ? require('./utils/MenuUtils.mac').default : require('./utils/MenuUtils.win').default;
createWindowMenu();

const presenter = new AppPresenter();

ReactDOM.render(
    <App
        store={presenter.store}
        presenter={presenter}
        shortcuts={new ShortcutManager(KeyMap)} />,
    document.getElementById('app')
);
