'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { Window, TitleBar } from 'react-desktop/macOs';
import DialogStore from './DialogStore';

@observer
export default class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ position : 'absolute', left : '50%', top : '50%', marginLeft : '-' + this.props.store.width / 2 + 'px', marginTop : '-' + this.props.store.height / 2 + 'px', zIndex : 1000 }}>
                <Window
                    width={this.props.store.width}
                    height={this.props.store.height}
                    hidden={this.props.store.hidden}
                    chrome>
                    <TitleBar
                        title={this.props.store.title}
                        controls
                        onCloseClick={() => this.props.store.hidden = true} />
                    {this.props.store.content}
                </Window>
            </div>
        );
    }
}

Dialog.propTypes = {
    store : React.PropTypes.instanceOf(DialogStore).isRequired
};

module.exports = Dialog;
