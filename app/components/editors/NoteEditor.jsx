'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Draft, { Editor, EditorState, RichUtils } from 'draft-js';
import CodeUtils from 'draft-js-code';
import NoteEditorStore from './NoteEditorStore';
import Theme from '../../Theme';
import Config from '../../../config/config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class NoteEditor extends React.Component {
    constructor(props) {
        super(props);

        this._subscriptions = [];

        this._handleChange = editorState => {
            this.props.store.editorState = editorState;
            this.props.store.editorStateChanges.onNext(editorState);
        };

        this._keyBindingFn = event => {
            let command;

            if (CodeUtils.hasSelectionInBlock(this.props.store.editorState)) {
                command = CodeUtils.getKeyBinding(event);
            }

            if (command) {
                return command;
            }

            return Draft.getDefaultKeyBinding(event);
        };

        this._handleKeyCommand = command => {
            let newState;

            if (CodeUtils.hasSelectionInBlock(this.props.store.editorState)) {
                newState = CodeUtils.handleKeyCommand(this.props.store.editorState, command);
            }

            if (!newState) {
                newState = RichUtils.handleKeyCommand(this.props.store.editorState, command);
            }

            if (newState) {
                this._handleChange(newState);

                return true;
            }

            return false;
        };

        this._handleReturn = event => {
            if (CodeUtils.hasSelectionInBlock(this.props.store.editorState)) {
                this._handleChange(CodeUtils.handleReturn(event, this.props.store.editorState));
            }

            return true;

        };

        this._handleTab = event => {
            if (CodeUtils.hasSelectionInBlock(this.props.store.editorState)) {
                this._handleChange(CodeUtils.handleTab(event, this.props.store.editorState));
            }
        };
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe(this.props.eventScope + '.focus', this.focus.bind(this)));
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    focus() {
        if (this.refs.editor) {
            this.refs.editor.focus();
        }
    }

    render() {
        const customStyleMap = {
            'STRIKETHROUGH' : {
                textDecoration : 'line-through'
            }
        };

        return (
            <div
                id={this.props.eventScope}
                style={{ height : 'calc(100vh - 70px)', padding : Config.paddingX1, backgroundColor : this.props.store.hidden ? Theme.secondayrBackgroundColor : Theme.primaryBackgroundColor, display : 'flex', flexFlow : 'column', overflow : 'auto' }}
                onClick={() => this.focus()}>
                <div style={{ display : this.props.store.hidden ? 'none' : 'block' }}>
                    <Editor
                        ref="editor"
                        editorState={this.props.store.editorState}
                        spellCheck={true}
                        customStyleMap={customStyleMap}
                        onChange={this._handleChange}
                        keyBindingFn={this._keyBindingFn}
                        handleKeyCommand={this._handleKeyCommand}
                        handleReturn={this._handleReturn}
                        onTab={this._handleTab} />
                </div>
            </div>
        );
    }
}

NoteEditor.propTypes = {
    store      : React.PropTypes.instanceOf(NoteEditorStore).isRequired,
    eventScope : React.PropTypes.string
};

NoteEditor.defaultProps = {
    eventScope : 'noteEditor'
};

module.exports = NoteEditor;
