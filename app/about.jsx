'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/buttons/Button.jsx';
import Text from './components/text/Text.jsx';
import { setMenuItemEnabled } from './utils/MenuUtils.common';
import Path from 'path';
import Settings from './utils/Settings';
import Unique from './utils/Unique';
import Package from '../package.json';
import Config from '../config.json';
import is from 'electron-is';

const { remote } = require('electron');
const { Menu } = remote;
const WindowManager = remote.require('electron-window-manager');

const AboutDialog = ({ productName, productVersion, copyright, imagePath }) => {
    const componentId = Unique.elementId('about');

    let theme;

    new Settings().get('theme', Config.defaultTheme)
        .then(value => {
            theme = value === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');

            const component = document.getElementById(componentId);

            if (component) {
                component.style.backgroundColor = theme.dialogBackgroundColor;
            }
        }).catch(error => console.error(error));

    WindowManager.getCurrent().object.setClosable(false);
    WindowManager.getCurrent().object.setAlwaysOnTop(true, 'modal-panel');
    WindowManager.getCurrent().object.setSkipTaskbar(true);

    if (is.macOS()) {
        setMenuItemEnabled(Menu.getApplicationMenu().items, false);
    } else {
        WindowManager.getCurrent().object.setMenu(null);
    }

    const handleClick = () => {
        WindowManager.getCurrent().object.setClosable(true);

        if (is.macOS()) {
            setMenuItemEnabled(Menu.getApplicationMenu().items, true);
        }

        WindowManager.getCurrent().close();
    };

    return (
        <div
            id={componentId}
            style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX2, paddingBottom : Config.paddingX2, backgroundColor : (theme ? theme.dialogBackgroundColor : undefined) }}>
            <img src={imagePath} /><br />
            <Text textSize="large">{productName}</Text>
            <Text>{productVersion}</Text>
            <Text textSize="small">{copyright}</Text>
            <div style={{ padding : Config.paddingX2 }}>
                <Button
                    width={Config.buttonWidth}
                    backgroundColor="primary"
                    onClick={() => handleClick()}>
                    Close
                </Button>
            </div>
        </div>
    );
};

AboutDialog.propTypes = {
    productName    : React.PropTypes.string.isRequired,
    productVersion : React.PropTypes.string.isRequired,
    copyright      : React.PropTypes.string.isRequired,
    imagePath      : React.PropTypes.string.isRequired
};

ReactDOM.render(
    <AboutDialog
        productName={Package.productName}
        productVersion={'Version ' + Package.version}
        copyright={'Copyright © ' + new Date().getFullYear()}
        imagePath={Path.join(__dirname, './images/artisan.png')} />,
    document.getElementById('about')
);
