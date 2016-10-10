'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/buttons/Button.jsx';
import Text from './components/text/Text.jsx';
import { setMenuItemEnabled } from './utils/MenuUtils.common';
import Path from 'path';
import Package from '../package.json';
import Config from '../config.json';
import is from 'electron-is';

const { Menu }      = require('electron').remote;
const WindowManager = require('electron').remote.require('electron-window-manager');

const AboutDialog = ({ productName, productVersion, copyright, imagePath }) => {
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
        <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX2, paddingBottom : Config.paddingX2 }}>
            <img src={imagePath} /><br />
            <Text textSize="large">{productName}</Text>
            <Text>{productVersion}</Text>
            <Text textSize="small">{copyright}</Text>
            <div style={{ padding : Config.paddingX2 }}>
                <Button
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
