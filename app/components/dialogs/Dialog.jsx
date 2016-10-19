'use strict';

import React from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react';
import DialogStore from './DialogStore';
import Config from '../../../config.json';

@observer
export default class Dialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        return (
            <Modal
                isOpen={this.props.store.visible}
                shouldCloseOnOverlayClick={false}
                overlayClassName="DialogOverlay"
                className="DialogContent"
                style={{ overlay : { backgroundColor : theme.overlayColor }, content : { width : this.props.width + 'px', height : this.props.height + 'px', backgroundColor : theme.dialogBackgroundColor, border : '1px solid ' + theme.borderColor, borderRadius : Config.paddingX0 + 'px', outline : 'none' } }}
                onAfterOpen={this.props.onAfterOpen}
                onRequestClose={this.props.onBeforeClose}>
                {this.props.children}
            </Modal>
        );
    }
}

Dialog.propTypes = {
    store         : React.PropTypes.instanceOf(DialogStore).isRequired,
    width         : React.PropTypes.number.isRequired,
    height        : React.PropTypes.number.isRequired,
    theme         : React.PropTypes.oneOf([ 'light', 'dark' ]),
    onAfterOpen   : React.PropTypes.func,
    onBeforeClose : React.PropTypes.func
};

Dialog.defaultProps = {
    theme : 'light'
};

module.exports = Dialog;
