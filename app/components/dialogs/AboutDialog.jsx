'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { Text, Button } from 'react-desktop/macOs';
import Dialog from './Dialog';
import DialogStore from './DialogStore';

const { app } = require('electron').remote;

@observer
export default class AboutDialog extends Dialog {
    constructor(props) {
        super(props);

        props.store.title = 'About ' + app.getName();

        props.store.content = (
            <div style={{ width : '100%', textAlign : 'center' }}>
                <Text>{app.getName()}</Text>
                <Text>Version {app.getVersion()}</Text>
                <hr />
                <Button onClick={() => this.props.store.hidden = true}>Close</Button>
            </div>
        );
    }
}

AboutDialog.propTypes = {
    store : React.PropTypes.instanceOf(DialogStore).isRequired
};

module.exports = AboutDialog;
