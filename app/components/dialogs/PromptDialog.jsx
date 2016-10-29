'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import { Button } from '../buttons/Button.jsx';
import DialogStore from './DialogStore';

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
                open={this.props.store.visible}
                actions={[
                    <Button
                        label="Cancel"
                        onTouchTap={() => this.props.store.visible = false} />,
                    <Button
                        label="OK"
                        color="primary"
                        onTouchTap={() => this._handleEnter(this.props.store.value)} />
                ]}
                onRequestClose={() => this.props.store.visible = false}>
                <TextField
                    fullWidth={true}
                    hintText={this.props.label}
                    floatingLabelText={this.props.label}
                    value={this.props.store.value}
                    onChange={event => this.props.store.value = event.target.value} />
            </Dialog>
        );
    }
}

PromptDialog.propTypes = {
    store   : React.PropTypes.instanceOf(DialogStore),
    title   : React.PropTypes.string,
    label   : React.PropTypes.string,
    onEnter : React.PropTypes.func
};

module.exports = PromptDialog;
