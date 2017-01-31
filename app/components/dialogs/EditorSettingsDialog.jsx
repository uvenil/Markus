// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Label from '../text/Label.jsx';
import Button from '../buttons/Button.jsx';
import EditorSettingsDialogStore from './EditorSettingsDialogStore';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../utils/Constants';

@observer
export default class EditorSettingsDialog extends React.Component {
    constructor(props : any) {
        super(props);
    }

    render() : any {
        return (
            <Dialog
                title="Editor"
                autoScrollBodyContent
                open={this.props.store.booleanValue}
                bodyStyle={{ padding : Constants.PADDING_X2 }}
                actions={[
                    <Button
                        label="Close"
                        labelSize={Constants.DIALOG_BUTTON_FONT_SIZE}
                        color="primary"
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => this.props.store.booleanValue = false} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <div style={{ width : '100%', fontSize : Constants.DIALOG_TEXT_FONT_SIZE, display : 'table', textAlign : 'center' }}>
                    {/* Highlight current line */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Highlight current line</Label>
                        <Checkbox
                            checked={this.props.store.settings.highlightCurrentLine.booleanValue}
                            labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.highlightCurrentLine.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'highlightActiveLine', value : checked });
                            }} />
                    </div>
                    {/* Show line numbers */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show line numbers</Label>
                        <Checkbox
                            checked={this.props.store.settings.showLineNumbers.booleanValue}
                            labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showLineNumbers.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'showLineNumbers', value : checked });
                            }} />
                    </div>
                    {/* Tab size */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'top', paddingTop : Constants.PADDING_X1, display : 'table-cell', textAlign : 'right' }}>Tab size</Label>
                        <RadioButtonGroup
                            name="tabSize"
                            valueSelected={this.props.store.settings.tabSize2.booleanValue ? 2 : this.props.store.settings.tabSize4.booleanValue ? 4 : 8}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onChange={(event, value) => {
                                this.props.store.settings.tabSize2.booleanValue = value === 2;
                                this.props.store.settings.tabSize4.booleanValue = value === 4;
                                this.props.store.settings.tabSize8.booleanValue = value === 8;

                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'tabSize', value : value });
                            }}>
                            <RadioButton
                                label="2 spaces"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                value={2} />
                            <RadioButton
                                label="4 spaces"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                style={{ paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0 }}
                                value={4} />
                            <RadioButton
                                label="8 spaces"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                value={8} />
                        </RadioButtonGroup>
                    </div>
                    {/* Use soft tabs */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Use soft tabs</Label>
                        <Checkbox
                            checked={this.props.store.settings.useSoftTabs.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.useSoftTabs.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'useSoftTabs', value : checked });
                            }} />
                    </div>
                    {/* Word wrap */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Word wrap</Label>
                        <Checkbox
                            checked={this.props.store.settings.wordWrap.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.wordWrap.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'wordWrap', value : checked });
                            }} />
                    </div>
                    {/* Show print margin */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show print margin</Label>
                        <Checkbox
                            checked={this.props.store.settings.showPrintMargin.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showPrintMargin.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'showPrintMargin', value : checked });
                            }} />
                    </div>
                    {/* Print margin column */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'top', paddingTop : Constants.PADDING_X1, display : 'table-cell', textAlign : 'right' }}>Print margin column</Label>
                        <RadioButtonGroup
                            name="tabSize"
                            valueSelected={this.props.store.settings.printMarginColumn72.booleanValue ? 72 : this.props.store.settings.printMarginColumn80.booleanValue ? 80 : this.props.store.settings.printMarginColumn100.booleanValue ? 100 : 120}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onChange={(event, value) => {
                                this.props.store.settings.printMarginColumn72.booleanValue  = value === 72;
                                this.props.store.settings.printMarginColumn80.booleanValue  = value === 80;
                                this.props.store.settings.printMarginColumn100.booleanValue = value === 100;
                                this.props.store.settings.printMarginColumn120.booleanValue = value === 120;

                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'printMarginColumn', value : value });
                            }}>
                            <RadioButton
                                label="72 characters"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                value={72} />
                            <RadioButton
                                label="80 characters"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                style={{ paddingTop : Constants.PADDING_X0 }}
                                value={80} />
                            <RadioButton
                                label="100 characters"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                style={{ paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0 }}
                                value={100} />
                            <RadioButton
                                label="120 characters"
                                labelStyle={{ fontSize : Constants.DIALOG_TEXT_FONT_SIZE }}
                                value={120} />
                        </RadioButtonGroup>
                    </div>
                    {/* Show invisibles */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show invisibles</Label>
                        <Checkbox
                            checked={this.props.store.settings.showInvisibles.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showInvisibles.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'showInvisibles', value : checked });
                            }} />
                    </div>
                    {/* Show fold widgets */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show fold widgets</Label>
                        <Checkbox
                            checked={this.props.store.settings.showFoldWidgets.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showFoldWidgets.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'showFoldWidgets', value : checked });
                            }} />
                    </div>
                    {/* Show gutter */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show gutter</Label>
                        <Checkbox
                            checked={this.props.store.settings.showGutter.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showGutter.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'showGutter', value : checked });
                            }} />
                    </div>
                    {/* Show indent guides */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Show indent guides</Label>
                        <Checkbox
                            checked={this.props.store.settings.showIndentGuides.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.showIndentGuides.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'displayIndentGuides', value : checked });
                            }} />
                    </div>
                    {/* Scroll past last line */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label style={{ width : '50%', verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>Scroll past last line</Label>
                        <Checkbox
                            checked={this.props.store.settings.scrollPastLastLine.booleanValue}
                            style={{ width : '50%', padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}
                            onCheck={(event, checked) => {
                                this.props.store.settings.scrollPastLastLine.booleanValue = checked;
                                EventUtils.broadcast('NoteEditor.settings.change', { name : 'scrollPastEnd', value : checked });
                            }} />
                    </div>
                </div>
            </Dialog>
        );
    }
}

EditorSettingsDialog.propTypes = {
    store : React.PropTypes.instanceOf(EditorSettingsDialogStore)
};
