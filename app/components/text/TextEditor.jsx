'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Brace from 'brace';
import AceEditor from 'react-ace';
import TextEditorStore from './TextEditorStore';
import Record from '../../data/Record';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import PubSub from 'pubsub-js';
import is from 'electron-is';
import _ from 'lodash';

require('brace/ext/searchbox');
require('brace/ext/spellcheck');
require('brace/ext/whitespace');

if (is.dev()) PubSub.immediateExceptions = true;

@observer
class TextEditor extends React.Component {
    constructor(props) {
        super(props);

        this._editorId      = Unique.nextString();
        this._placeHolderId = Unique.nextString();
        this._subscriptions = [];

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
            this.refs.editor.editor.setShowPrintMargin(data.showPrintMargin);
            this.refs.editor.editor.setPrintMarginColumn(data.printMarginColumn);
            this.refs.editor.editor.renderer.$loop.schedule(this.refs.editor.editor.renderer.CHANGE_GUTTER);
            this.refs.editor.editor.setShowInvisibles(data.showInvisibles);
            this.refs.editor.editor.setShowFoldWidgets(data.showFoldWidgets);
            this.refs.editor.editor.renderer.setShowGutter(data.showGutter);
            this.refs.editor.editor.renderer.setDisplayIndentGuides(data.displayIndentGuides);
            this.refs.editor.editor.renderer.$scrollPastEnd = data.scrollPastEnd;

            this.refs.editor.editor.session.selection.on('changeCursor', () => {
                this.props.store.cursorPosition = this.refs.editor.editor.getCursorPosition();
            });

            this.refs.editor.editor.session.on('changeOverwrite', () => {
                this.props.store.isOverwriteEnabled = this.refs.editor.editor.getOverwrite();
            });

            this.refs.editor.editor.container.addEventListener('contextmenu', event => {
                event.preventDefault();

                showTextBoxContextMenu();

                return false;
            });
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
            } else if (data.name === 'showPrintMargin') {
                this.refs.editor.editor.setShowPrintMargin(data.value);
            } else if (data.name === 'printMarginColumn') {
                this.refs.editor.editor.setPrintMarginColumn(data.value);
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
            } else {
                console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
            }
        };

        this._changeFont = font => this.refs.editor.editor.setOptions({ fontFamily : font });

        this._handleRefresh = () => {
            this.refs.editor.editor.resize();
        };
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe('TextEditor.init', (eventName, data) => this._init(data)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.settings.change', (eventName, data) => this._changeSettings(data)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.changeFont', (eventName, font) => this._changeFont(font)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.refresh', () => this._handleRefresh()));
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const syntax = this.props.store.record && this.props.store.record.syntax ? this.props.store.record.syntax : this.props.store.syntax;

        require('brace/mode/' + syntax);
        require('brace/theme/' + this.props.store.theme);

        const style = { width : '100%', height : 'calc(100vh - ' + (Constants.BOTTOM_BAR_HEIGHT + 1) + 'px)' };

        return (
            <div style={_.assign(style, this.props.style)}>
                <AceEditor
                    id={this._editorId}
                    ref="editor"
                    mode={syntax}
                    theme={this.props.store.theme}
                    value={this.props.store.record ? this.props.store.record.fullText : undefined}
                    width="100%"
                    height={'calc(100vh - ' + (Constants.BOTTOM_BAR_HEIGHT + 1) + 'px)'}
                    fontSize={this.props.store.textSize}
                    showGutter={this.props.store.showGutter}
                    highlightActiveLine={this.props.store.highlightActiveLine}
                    showPrintMargin={this.props.store.showPrintMargin}
                    tabSize={this.props.tabSize}
                    editorProps={{ fontFamily : this.props.store.fontFamily, $blockScrolling : 'Infinity', $showLineNumbers : this.props.store.showLineNumbers, $printMarginColumn : this.props.store.printMarginColumn, $showInvisibles : this.props.store.showInvisibles, displayIndentGuides : this.props.store.displayIndentGuides, $scrollPastEnd : this.props.store.scrollPastEnd, $useSoftTabs : this.props.store.useSoftTabs, $wrap : this.props.store.wordWrap }}
                    style={{ display : this.props.store.record ? 'block' : 'none' }}
                    onChange={value => this._handleChange(value)} />
                <div
                    id={this._placeHolderId}
                    style={{ display : this.props.store.record ? 'none' : 'block', width : '100%', height : 'calc(100vh - ' + (Constants.BOTTOM_BAR_HEIGHT + 1) + 'px)', backgroundColor : this.props.muiTheme.palette.primary3Color }} />
            </div>
        );
    }
}

TextEditor.propTypes = {
    store : React.PropTypes.instanceOf(TextEditorStore).isRequired,
    style : React.PropTypes.object
};

export default muiThemeable()(TextEditor);
