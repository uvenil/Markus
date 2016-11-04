'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Button from '../buttons/Button.jsx';
import PromptDialogStore from './PromptDialogStore';
import Constants from '../../utils/Constants';

@observer
export default class PromptDialog extends React.Component {
    constructor(props) {
        super(props);

        this._handleEnter = value => {
            if (this.props.onEnter) {
                this.props.onEnter(value);
            }
        };
    }

    render() {
        return (
            <Dialog
                title={this.props.title}
                open={this.props.store.booleanValue}
                actions={[
                    <Button
                        label="Cancel"
                        labelSize={Constants.DIALOG_BUTTON_FONT_SIZE}
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => this.props.store.booleanValue = false} />,
                    <Button
                        label="OK"
                        labelSize={Constants.DIALOG_BUTTON_FONT_SIZE}
                        color="primary"
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => this._handleEnter(this.props.store.value)} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <TextField
                    fullWidth={true}
                    floatingLabelText={this.props.label}
                    value={this.props.store.value}
                    onChange={event => this.props.store.value = event.target.value} />
            </Dialog>
        );
    }
}

PromptDialog.propTypes = {
    store   : React.PropTypes.instanceOf(PromptDialogStore),
    title   : React.PropTypes.string,
    label   : React.PropTypes.string,
    onEnter : React.PropTypes.func
};

module.exports = PromptDialog;
