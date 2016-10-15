'use strict';

import React from 'react';
import Dialog from './Dialog.jsx';
import DialogStore from './DIalogStore';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import TextBox from '../text/TextBox.jsx';
import Config from '../../../config.json';

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
                store={this.props.store}
                width={this.props.width}
                height={this.props.height}
                onAfterOpen={() => {
                    this.refs.textBox.focus();
                    this.refs.textBox.value = this.props.store.value;
                }}
                onBeforeClose={() => this.refs.textBox.value = ''}>
                <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
                    <Text>{this.props.label}</Text>
                </div>
                <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                    <TextBox
                        ref="textBox"
                        theme={this.props.theme}
                        className="TextBox full-width"
                        onEnter={value => this._handleEnter(value)}
                        onEsc={() => this.props.store.visible = false} />
                </div>
                <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                    <span style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px' }}>
                        <Button
                            width={Config.buttonWidth}
                            theme={this.props.theme}
                            backgroundColor="primary"
                            onClick={() => this._handleEnter(this.refs.textBox.value)}>OK</Button>
                    </span>
                    <span style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px' }}>
                        <Button
                            width={Config.buttonWidth}
                            theme={this.props.theme}
                            backgroundColor="default"
                            onClick={() => this.props.store.visible = false}>Cancel</Button>
                    </span>
                </div>
            </Dialog>
        );
    }
}

PromptDialog.propTypes = {
    store   : React.PropTypes.instanceOf(DialogStore),
    width   : React.PropTypes.number.isRequired,
    height  : React.PropTypes.number.isRequired,
    label   : React.PropTypes.string,
    onEnter : React.PropTypes.func
};

module.exports = PromptDialog;

