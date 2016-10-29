'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';;
import Checkbox from 'material-ui/Checkbox';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { Label } from '../text/Label.jsx';
import { Button } from '../buttons/Button.jsx';
import DialogStore from './DialogStore';
import SettingsStore from '../../SettingsStore';
import Constants from '../../utils/Constants';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class EditorSettingsDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Dialog
                title="Editor"
                autoScrollBodyContent={true}
                open={this.props.store.visible}
                bodyStyle={{ padding : Constants.PADDING_X2 }}
                actions={[
                    <Button
                        label="Close"
                        color="primary"
                        onTouchTap={() => this.props.store.visible = false} />
                ]}
                onRequestClose={() => this.props.store.visible = false}>
                <div style={{ width : '100%', display : 'table', textAlign : 'center' }}>
                    {/* Highlight current line */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Highlight current line</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.highlightCurrentLine.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.highlightCurrentLine.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'highlightActiveLine', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Show line numbers */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show line numbers</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showLineNumbers.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showLineNumbers.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'showLineNumbers', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Tab size */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'top', paddingTop : Constants.PADDING_X1, display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Tab size</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <RadioButtonGroup
                                name="tabSize"
                                valueSelected={this.props.settingsStore.tabSize2.checked ? 2 : this.props.settingsStore.tabSize4.checked ? 4 : 8}
                                onChange={(event, value) => {
                                    this.props.settingsStore.tabSize2.checked = value === 2;
                                    this.props.settingsStore.tabSize4.checked = value === 4;
                                    this.props.settingsStore.tabSize8.checked = value === 8;

                                    PubSub.publish('TextEditor.settings', { name : 'tabSize', value : value });
                                }}>
                                <RadioButton
                                    label="2 spaces"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={2} />
                                <RadioButton
                                    label="4 spaces"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={4} />
                                <RadioButton
                                    label="8 spaces"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={8} />
                            </RadioButtonGroup>
                        </div>
                    </div>
                    {/* Use soft tabs */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Use soft tabs</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.useSoftTabs.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.useSoftTabs.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'useSoftTabs', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Word wrap */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Word wrap</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.wordWrap.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.wordWrap.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'wordWrap', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Show print margin */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show print margin</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showPrintMargin.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showPrintMargin.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'showPrintMargin', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Print margin column */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'top', paddingTop : Constants.PADDING_X1, display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Print margin column</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <RadioButtonGroup
                                name="tabSize"
                                valueSelected={this.props.settingsStore.printMarginColumn72.checked ? 72 : this.props.settingsStore.printMarginColumn80.checked ? 80 : this.props.settingsStore.printMarginColumn100.checked ? 100 : 120}
                                onChange={(event, value) => {
                                    this.props.settingsStore.printMarginColumn72.checked  = value === 72;
                                    this.props.settingsStore.printMarginColumn80.checked  = value === 80;
                                    this.props.settingsStore.printMarginColumn100.checked = value === 100;
                                    this.props.settingsStore.printMarginColumn120.checked = value === 120;

                                    PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : value });
                                }}>
                                <RadioButton
                                    label="72"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={72} />
                                <RadioButton
                                    label="80"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={80} />
                                <RadioButton
                                    label="100"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={100} />
                                <RadioButton
                                    label="120"
                                    labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE }}
                                    value={120} />
                            </RadioButtonGroup>
                        </div>
                    </div>
                    {/* Show invisibles */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show invisibles</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showInvisibles.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showInvisibles.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'showInvisibles', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Show fold widgets */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show fold widgets</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showFoldWidgets.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showFoldWidgets.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'showFoldWidgets', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Show gutter */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show gutter</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showGutter.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showGutter.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'showGutter', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Show indent guides */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Show indent guides</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.showIndentGuides.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.showIndentGuides.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'displayIndentGuides', value : checked });
                                }} />
                        </div>
                    </div>
                    {/* Scroll past last line */}
                    <div style={{ display : 'table-row' }}>
                        <div style={{ verticalAlign : 'middle', display : 'table-cell', textAlign : 'right' }}>
                            <Label theme={this.props.theme}>Scroll past last line</Label>
                        </div>
                        <div style={{ padding : Constants.PADDING_X1, display : 'table-cell', textAlign : 'left' }}>
                            <Checkbox
                                checked={this.props.settingsStore.scrollPastLastLine.checked}
                                onCheck={(event, checked) => {
                                    this.props.settingsStore.scrollPastLastLine.checked = checked;
                                    PubSub.publish('TextEditor.settings', { name : 'scrollPastEnd', value : checked });
                                }} />
                        </div>
                    </div>
                </div>
            </Dialog>
        );
    }
}

EditorSettingsDialog.propTypes = {
    store         : React.PropTypes.instanceOf(DialogStore),
    settingsStore : React.PropTypes.instanceOf(SettingsStore)
};

module.exports = EditorSettingsDialog;
