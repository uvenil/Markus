// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import BooleanDialogStore from './BooleanDialogStore';
import Constants from '../../Constants';

@observer
class BooleanDialog extends React.Component {
    static propTypes : Object;

    render() : any {
        return (
            <Dialog
                title={this.props.store.title}
                open={this.props.store.booleanValue}
                actions={[
                    <Button
                        label={this.props.store.falseLabel}
                        labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                        color={this.props.store.falseLabelColor}
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => {
                            this.props.store.booleanValue = false;

                            if (this.props.store.falseAction) this.props.store.falseAction();
                        }} />,
                    <Button
                        label={this.props.store.trueLabel}
                        labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                        color={this.props.store.trueLabelColor}
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => {
                            this.props.store.booleanValue = false;

                            if (this.props.store.trueAction) this.props.store.trueAction();
                        }} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <Text>{this.props.store.message}</Text>
            </Dialog>
        );
    }
}

BooleanDialog.propTypes = {
    store : React.PropTypes.instanceOf(BooleanDialogStore).isRequired
};

export default muiThemeable()(BooleanDialog);
