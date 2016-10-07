'use strict';

import React from 'react';
import Brace from 'brace';
import AceEditor from 'react-ace';
import TextEditorStore from './TextEditorStore';
import Record from '../../data/Record';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

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
                this.props.store.record = Record.from(value);
            }

            this.props.store.changes.onNext(record);
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        require('brace/mode/' + this.props.syntax);
        require('brace/theme/' + this.props.theme);

        return (
            <div style={{ width : '100%', height : 'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)' }}>
                <AceEditor
                    id={this._editorId}
                    ref="editor"
                    mode={this.props.syntax}
                    theme={this.props.theme}
                    value={this.props.store.record ? this.props.store.record.fullText : undefined}
                    width="100%"
                    height={'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)'}
                    fontSize={this.props.textSize}
                    showGutter={this.props.showGutter}
                    highlightActiveLine={this.props.highlightActiveLine}
                    tabSize={this.props.tabSize}
                    editorProps={{ fontFamily : this.props.fontFamily, $blockScrolling : true, showLineNumbers : this.props.showLineNumbers, showInvisibles : this.props.showInvisibles, showFoldWidgets : this.props.showFoldWidgets, displayIndentGuides : this.props.displayIndentGuides, scrollPastEnd : this.props.scrollPastEnd, useSoftTabs : this.props.useSoftTabs, wrap : this.props.wordWrap, spellcheck : this.props.spellcheck }}
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
    syntax              : React.PropTypes.string.isRequired,
    theme               : React.PropTypes.string.isRequired,
    store               : React.PropTypes.instanceOf(TextEditorStore).isRequired,
    fontFamily          : React.PropTypes.string,
    textSize            : React.PropTypes.number,
    highlightActiveLine : React.PropTypes.bool,
    tabSize             : React.PropTypes.number,
    useSoftTabs         : React.PropTypes.bool,
    wordWrap            : React.PropTypes.bool,
    showLineNumbers     : React.PropTypes.bool,
    showInvisibles      : React.PropTypes.bool,
    showFoldWidgets     : React.PropTypes.bool,
    showGutter          : React.PropTypes.bool,
    displayIndentGuides : React.PropTypes.bool,
    scrollPastEnd       : React.PropTypes.bool,
    spellcheck          : React.PropTypes.bool
};

TextEditor.defaultProps = {
    highlightActiveLine : true,
    tabSize             : 4,
    useSoftTabs         : true,
    wordWrap            : false,
    showLineNumbers     : true,
    showInvisibles      : false,
    showFoldWidgets     : true,
    showGutter          : true,
    displayIndentGuides : true,
    scrollPastEnd       : false,
    spellcheck          : true
};

module.exports = TextEditor;

