'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import BooleanDialogStore from './BooleanDialogStore';

@observer
export default class BooleanDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Dialog
                title={this.props.store.title}
                open={this.props.store.booleanValue}
                actions={[
                    <Button
                        label={this.props.store.falseLabel}
                        color={this.props.store.falseLabelColor}
                        onTouchTap={() => {
                            this.props.store.booleanValue = false;

                            if (this.props.store.falseAction) {
                                this.props.store.falseAction();
                            }
                        }} />,
                    <Button
                        label={this.props.store.trueLabel}
                        color={this.props.store.trueLabelColor}
                        onTouchTap={() => {
                            this.props.store.booleanValue = false;

                            if (this.props.store.trueAction) {
                                this.props.store.trueAction();
                            }
                        }} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <Text>{this.props.store.message}</Text>
            </Dialog>
        );
    }
}

BooleanDialog.propTypes = {
    store : React.PropTypes.instanceOf(BooleanDialogStore)
};

module.exports = BooleanDialog;
