// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Button from '../buttons/Button.jsx';
import PromptDialogStore from './PromptDialogStore';
import Constants from '../../Constants';

@observer
class PromptDialog extends React.Component {
    static propTypes : Object;

    render() : any {
        return (
            <Dialog
                title={this.props.title}
                open={this.props.store.booleanValue}
                actions={[
                    <Button
                        label="Cancel"
                        labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => this.props.store.booleanValue = false} />,
                    <Button
                        label="OK"
                        labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                        color="primary"
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => {
                            if (this.props.onEnter) this.props.onEnter(this.props.store.value)
                        }} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <TextField
                    fullWidth
                    floatingLabelText={this.props.label}
                    value={this.props.store.value}
                    onChange={event => this.props.store.value = event.target.value} />
            </Dialog>
        );
    }
}

PromptDialog.propTypes = {
    store   : React.PropTypes.instanceOf(PromptDialogStore).isRequired,
    title   : React.PropTypes.string,
    label   : React.PropTypes.string,
    onEnter : React.PropTypes.func
};

export default muiThemeable()(PromptDialog);
