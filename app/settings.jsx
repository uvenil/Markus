'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import Button from './components/buttons/Button.jsx';
import Label from './components/text/Label.jsx';
import Text from './components/text/Text.jsx';
import ListView from './components/lists/ListView';
import Config from '../config.json';

const WindowManager = require('electron').remote.require('electron-window-manager');

const SettingsDialog = ({}) => {
    return (
        <SplitPane
            split="vertical"
            defaultSize={100}
            allowResize={false}>
            <ListView>
                <Text>Syntax Highlighting</Text>
                <Text>Display</Text>
                <Text>Theme</Text>
            </ListView>
            <div>
                <div style={{ display : 'block' }}>
                    Pane 1
                </div>
                <div style={{ display : 'none' }}>
                    Pane 2
                </div>
                <div style={{ display : 'none' }}>
                    Pane 3
                </div>
            </div>
        </SplitPane>
    );
};

SettingsDialog.propTypes = {};

ReactDOM.render(
    <SettingsDialog />,
    document.getElementById('settings')
);
