// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import AceEditor from 'react-ace';
import ReactMarkdown from 'react-markdown';
import CodeRenderer from './renderers/CodeRenderer.jsx';
import EditorStore from './EditorStore';
import Record from '../../data/Record';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../Constants';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import merge from 'lodash.merge';

require('brace/ext/searchbox');
require('brace/ext/spellcheck');
require('brace/ext/whitespace');

@observer
class Editor extends React.Component {
    static propTypes : Object;

    _events         : any;
    _handleChange   : Function;
    _init           : Function;
    _changeSettings : Function;
    _changeFont     : Function;
    _handleRefresh  : Function;

    constructor(props : Object) {
        super(props);

        this._events = [];

        this._handleChange = (value : string) => {
            if (this.props.store.record) {
                this.props.store.record.update(value);
            } else {
                this.props.store.record = Record.fromText(value);
            }

            this.props.store.changes.onNext(this.props.store.record);
        };

        this._init = (data : Object) => {
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
            this.refs.editor.editor.renderer.$scrollPastEnd = data.scrollPastEnd;

            this.refs.editor.editor.session.selection.on('changeCursor', () : void => this.props.store.cursorPosition = this.refs.editor.editor.getCursorPosition());
            this.refs.editor.editor.session.on('changeOverwrite', () : void => this.props.store.isOverwriteEnabled = this.refs.editor.editor.getOverwrite());

            this.refs.editor.editor.container.addEventListener('contextmenu', event => {
                event.preventDefault();

                showTextBoxContextMenu();

                return false;
            });

            this.refs.editor.editor.container.style.lineHeight = Constants.EDITOR_LINE_HEIGHT;
            this.refs.editor.editor.renderer.updateFontSize();
        };

        this._changeSettings = (data : Object) => {
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
            } else if (data.name === 'scrollPastEnd') {
                this.refs.editor.editor.renderer.$scrollPastEnd = data.value;
            } else {
                console.warn('Unrecognized setting ' + data.name + ' = ' + data.value);
            }
        };

        this._changeFont = (font : string) => this.refs.editor.editor.setOptions({ fontFamily : font });

        this._handleRefresh = () : void => this.refs.editor.editor.resize();
    }

    componentDidMount() : void {
        this._events.push(EventUtils.register('editor.init', data => this._init(data)));
        this._events.push(EventUtils.register('editor.settings.change', data => this._changeSettings(data)));
        this._events.push(EventUtils.register('editor.font.change', font => this._changeFont(font)));
        this._events.push(EventUtils.register('editor.refresh', () => this._handleRefresh()));
    }

    componentWillUnmount() : void {
        this._events.forEach(event => EventUtils.unregister(event));
    }

    render() : any {
        require('brace/mode/markdown');
        require('brace/theme/' + this.props.store.theme);

        const style = {
            width  : '100%',
            height : 'calc(100vh - ' + (Constants.BOTTOM_BAR_HEIGHT + 1) + 'px)'
        };

        return (
            <div style={merge(style, this.props.style)}>
                <div
                    style={{
                        display : this.props.store.record ? 'table' : 'none',
                        width   : '100%'
                    }}>
                    {/* Editor */}
                    <AceEditor
                        ref="editor"
                        mode="markdown"
                        theme={this.props.store.theme}
                        value={this.props.store.record ? this.props.store.record.fullText : undefined}
                        width={this.props.store.editorShown ? this.props.store.previewShown ? '50%' : '100%' : '0'}
                        height={'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT * (this.props.store.record ? 3 : 1)) + 'px)'}
                        fontSize={this.props.store.textSize}
                        showGutter={this.props.store.showGutter}
                        highlightActiveLine={this.props.store.highlightActiveLine}
                        showPrintMargin={this.props.store.showPrintMargin}
                        tabSize={this.props.tabSize}
                        editorProps={{
                            fontFamily          : this.props.store.fontFamily,
                            $blockScrolling     : 'Infinity',
                            $showLineNumbers    : this.props.store.showLineNumbers,
                            $printMarginColumn  : this.props.store.printMarginColumn,
                            $showInvisibles     : this.props.store.showInvisibles,
                            $scrollPastEnd      : this.props.store.scrollPastEnd,
                            $useSoftTabs        : this.props.store.useSoftTabs,
                            $wrap               : this.props.store.wordWrap
                        }}
                        style={{
                            display          : this.props.store.editorShown ? 'table-cell' : 'none',
                            borderRightWidth : 1,
                            borderRightStyle : 'solid',
                            borderRightColor : this.props.muiTheme.palette.borderColor
                        }}
                        onChange={value => this._handleChange(value)} />
                    {/* Preview */}
                    <div
                        style={{
                            display      : this.props.store.previewShown ? 'table-cell' : 'none',
                            width        : this.props.store.previewShown ? this.props.store.editorShown ? '50%' : '100%' : '0',
                            paddingLeft  : Constants.PADDING_X1,
                            paddingRight : Constants.PADDING_X1,
                            color        : this.props.muiTheme.palette.textColor
                        }}>
                        <ReactMarkdown
                            source={this.props.store.record ? this.props.store.record.fullText : undefined}
                            renderers={{
                                Code      : CodeRenderer,
                                CodeBlock : CodeRenderer
                            }} />
                    </div>
                </div>
                <div
                    style={{
                        display         : this.props.store.record ? 'none' : 'block',
                        width           : '100%',
                        height          : 'calc(100vh - ' + (Constants.BOTTOM_BAR_HEIGHT + 1) + 'px)',
                        backgroundColor : this.props.muiTheme.palette.primary3Color
                    }} />
            </div>
        );
    }
}

Editor.propTypes = {
    store : React.PropTypes.instanceOf(EditorStore).isRequired,
    style : React.PropTypes.object
};

export default muiThemeable()(Editor);
