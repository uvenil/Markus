'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Brace from 'brace';
import AceEditor from 'react-ace';
import TextEditorStore from './TextEditorStore';
import Record from '../../data/Record';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

@observer
export default class TextEditor extends React.Component {
    constructor(props) {
        super(props);

        this._editorId      = Unique.elementId('a');
        this._placeHolderId = Unique.elementId('b');

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
                    editorProps={{ fontFamily : this.props.store.fontFamily, $blockScrolling : true, showLineNumbers : this.props.store.showLineNumbers, showInvisibles : this.props.store.showInvisibles, showFoldWidgets : this.props.store.showFoldWidgets, displayIndentGuides : this.props.store.displayIndentGuides, scrollPastEnd : this.props.store.scrollPastEnd, useSoftTabs : this.props.store.useSoftTabs, wrap : this.props.store.wordWrap, spellcheck : this.props.store.spellCheck }}
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

