'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppPresenter from './AppPresenter';
import is from 'electron-is';

const createWindowMenu = is.macOS() ? require('./utils/MenuUtils.mac') : require('./utils/MenuUtils.win');
createWindowMenu();

const presenter = new AppPresenter();

ReactDOM.render(
    <App
        store={presenter.store}
        presenter={presenter} />,
    document.getElementById('app')
);
