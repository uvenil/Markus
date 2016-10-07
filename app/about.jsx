'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Button from './components/buttons/Button.jsx';
import Text from './components/text/Text.jsx';
import Path from 'path';
import Package from '../package.json';
import Config from '../config.json';

const WindowManager = require('electron').remote.require('electron-window-manager');

const About = ({ productName, productVersion, copyright, imagePath }) => {
    return (
        <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX0, paddingBottom : Config.paddingX0 }}>
            <img src={imagePath} /><br />
            <Text textSize="large">{productName}</Text>
            <Text>{productVersion}</Text>
            <Text textSize="small">{copyright}</Text>
            <div style={{ padding : Config.paddingX2 }}>
                <Button
                    backgroundColor="primary"
                    onClick={() => WindowManager.getCurrent().close()}>
                    Close
                </Button>
            </div>
        </div>
    );
};

About.propTypes = {
    productName    : React.PropTypes.string.isRequired,
    productVersion : React.PropTypes.string.isRequired,
    copyright      : React.PropTypes.string.isRequired,
    imagePath      : React.PropTypes.string.isRequired
};

ReactDOM.render(
    <About
        productName={Package.productName}
        productVersion={'Version ' + Package.version}
        copyright={'Copyright © ' + new Date().getFullYear()}
        imagePath={Path.join(__dirname, './images/logo.png')} />,
    document.getElementById('about')
);
