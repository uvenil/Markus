'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Brace from 'brace';
import AceEditor from 'react-ace';
import TextEditorStore from './TextEditorStore';
import Record from '../../data/Record';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class TextEditor extends React.Component {
    constructor(props) {
        super(props);

        this._editorId      = Unique.elementId('a');
        this._placeHolderId = Unique.elementId('b');
        this._subscriptions = [];

        this._handleLoad = editor => {
            // TODO
        };

        this._handleChange = value => {
            if (this.props.store.record) {
                this.props.store.record.update(value);
            } else {
                this.props.store.record = Record.fromText(value);
            }

            this.props.store.changes.onNext(this.props.store.record);
        };

        this._init = data => {
            this.refs.editor.editor.setHighlightActiveLine(data.highlightActiveLine);
            this.refs.editor.editor.$updateHighlightActiveLine();
            this.refs.editor.editor.getSession().setTabSize(data.tabSize);
            this.refs.editor.editor.getSession().setUseSoftTabs(data.useSoftTabs);
            this.refs.editor.editor.getSession().setUseWrapMode(data.wordWrap);
            this.refs.editor.editor.renderer.showLineNumbers = data.showLineNumebrs;
            this.refs.editor.editor.renderer.$gutterLayer.setShowLineNumbers(data.showLineNumebrs);
            this.refs.editor.editor.renderer.$loop.schedule(this.refs.editor.editor.renderer.CHANGE_GUTTER);
            this.refs.editor.editor.setShowInvisibles(data.showInvisibles);
            this.refs.editor.editor.setShowFoldWidgets(data.showFoldWidgets);
            this.refs.editor.editor.renderer.setShowGutter(data.showGutter);
            this.refs.editor.editor.renderer.setDisplayIndentGuides(data.displayIndentGuides);
            this.refs.editor.editor.renderer.$scrollPastEnd = data.scrollPastEnd;
        };

        this._changeSettings = data => {
            if (data.name === 'highlightActiveLine') {
                this.refs.editor.editor.setHighlightActiveLine(data.value);
                this.refs.editor.editor.$updateHighlightActiveLine();
            } else if (data.name === 'tabSize') {
                this.refs.editor.editor.getSession().setTabSize(data.value);
            } else if (data.name === 'useSoftTabs') {
                this.refs.editor.editor.getSession().setUseSoftTabs(data.value);
            } else if (data.name === 'wordWrap') {
                this.refs.editor.editor.getSession().setUseWrapMode(data.value);
            } else if (data.name === 'showLineNumbers') {
                this.refs.editor.editor.renderer.showLineNumbers = data.value;
                this.refs.editor.editor.renderer.$gutterLayer.setShowLineNumbers(data.value);
                this.refs.editor.editor.renderer.$loop.schedule(this.refs.editor.editor.renderer.CHANGE_GUTTER);
            } else if (data.name === 'showInvisibles') {
                this.refs.editor.editor.setShowInvisibles(data.value);
            } else if (data.name === 'showFoldWidgets') {
                this.refs.editor.editor.setShowFoldWidgets(data.value);
            } else if (data.name === 'showGutter') {
                this.refs.editor.editor.renderer.setShowGutter(data.value);
            } else if (data.name === 'displayIndentGuides') {
                this.refs.editor.editor.renderer.setDisplayIndentGuides(data.value);
            } else if (data.name === 'scrollPastEnd') {
                this.refs.editor.editor.renderer.$scrollPastEnd = data.value;
            } else if (data.name === 'spellCheck') {
                //
            } else {
                console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
            }
        };
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe('TextEditor.init', (eventName, data) => this._init(data)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.settings', (eventName, data) => this._changeSettings(data)));
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const theme  = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const syntax = this.props.store.record && this.props.store.record.syntax ? this.props.store.record.syntax : this.props.store.syntax;

        require('brace/mode/' + syntax);
        require('brace/theme/' + this.props.store.theme);

        return (
            <div style={{ width : '100%', height : 'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)' }}>
                <AceEditor
                    id={this._editorId}
                    ref="editor"
                    mode={syntax}
                    theme={this.props.store.theme}
                    value={this.props.store.record ? this.props.store.record.fullText : undefined}
                    width="100%"
                    height={'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)'}
                    fontSize={this.props.store.textSize}
                    showGutter={this.props.store.showGutter}
                    highlightActiveLine={this.props.store.highlightActiveLine}
                    tabSize={this.props.tabSize}
                    editorProps={{ fontFamily : this.props.store.fontFamily, $blockScrolling : true, $showLineNumbers : this.props.store.showLineNumbers, $showInvisibles : this.props.store.showInvisibles, displayIndentGuides : this.props.store.displayIndentGuides, $scrollPastEnd : this.props.store.scrollPastEnd, $useSoftTabs : this.props.store.useSoftTabs, $wrap : this.props.store.wordWrap, $spellcheck : this.props.store.spellCheck }}
                    style={{ display : this.props.store.record ? 'block' : 'none' }}
                    onLoad={editor => this._handleLoad(editor)}
                    onChange={value => this._handleChange(value)} />
                <div
                    id={this._placeHolderId}
                    style={{ display : this.props.store.record ? 'none' : 'block', width : '100%', height : 'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)', backgroundColor : theme.disabledBackgroundColor }} />
            </div>
        );
    }
}

TextEditor.propTypes = {
    store : React.PropTypes.instanceOf(TextEditorStore).isRequired,
    theme : React.PropTypes.oneOf([ 'light', 'dark' ])
};

TextEditor.defaultProps = {
    theme : 'light',
};

module.exports = TextEditor;

