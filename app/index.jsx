'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import AppPresenter from './AppPresenter';
import EnvironmentUtils from './utils/EnvironmentUtils';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const createWindowMenu = EnvironmentUtils.isMacOS() ? require('./utils/MenuUtils.mac') : require('./utils/MenuUtils.win');
createWindowMenu();

const presenter = new AppPresenter();

ReactDOM.render(
    <App
        store={presenter.store}
        presenter={presenter} />,
    document.getElementById('app')
);
