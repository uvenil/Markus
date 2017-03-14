// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Toggle from 'material-ui/Toggle';
import Button from '../buttons/Button.jsx';
import Label from '../text/Label.jsx';
import EditorSettingsDialogStore from './EditorSettingsDialogStore';
import EventUtils from '../../utils/EventUtils';
import Constants from '../../Constants';

@observer
class EditorSettingsDialog extends React.Component {
    static propTypes : Object;

    render() : any {
        return (
            <Dialog
                title="Editor settings"
                autoScrollBodyContent
                open={this.props.store.booleanValue}
                bodyStyle={{ padding : Constants.PADDING_X2 }}
                actions={[
                    <Button
                        label="Close"
                        labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                        color="primary"
                        height={Constants.BUTTON_HEIGHT_X1}
                        onTouchTap={() => this.props.store.booleanValue = false} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <div style={{
                    width     : '100%',
                    fontSize  : Constants.FONT_SIZE_TEXT_DIALOG,
                    display   : 'table',
                    textAlign : 'center' }}>
                    {/* Highlight current line */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Highlight current line</Label>
                        <Toggle
                            toggled={this.props.store.highlightCurrentLine.booleanValue}
                            labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.highlightCurrentLine.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'highlightActiveLine',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Show line numbers */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show line numbers</Label>
                        <Toggle
                            toggled={this.props.store.showLineNumbers.booleanValue}
                            labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showLineNumbers.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'showLineNumbers',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Tab size */}
                    <div
                        style={{
                            width : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'top',
                                paddingTop    : Constants.PADDING_X1,
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Tab size</Label>
                        <RadioButtonGroup
                            name="tabSize"
                            valueSelected={this.props.store.tabSize2.booleanValue ? Constants.TAB_SIZES[0] : this.props.store.tabSize4.booleanValue ? Constants.TAB_SIZES[1] : Constants.TAB_SIZES[2]}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onChange={(event, value : number) => {
                                this.props.store.tabSize2.booleanValue = value === Constants.TAB_SIZES[0];
                                this.props.store.tabSize4.booleanValue = value === Constants.TAB_SIZES[1];
                                this.props.store.tabSize8.booleanValue = value === Constants.TAB_SIZES[2];

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'tabSize',
                                    value : value
                                });
                            }}>
                            <RadioButton
                                label="2 spaces"
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                value={2} />
                            <RadioButton
                                label="4 spaces"
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                style={{
                                    paddingTop    : Constants.PADDING_X0,
                                    paddingBottom : Constants.PADDING_X0 }}
                                value={4} />
                            <RadioButton
                                label="8 spaces"
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                value={8} />
                        </RadioButtonGroup>
                    </div>
                    {/* Use soft tabs */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Use soft tabs</Label>
                        <Toggle
                            toggled={this.props.store.useSoftTabs.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.useSoftTabs.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'useSoftTabs',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Word wrap */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Word wrap</Label>
                        <Toggle
                            toggled={this.props.store.wordWrap.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.wordWrap.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'wordWrap',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Show print margin */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show print margin</Label>
                        <Toggle
                            toggled={this.props.store.showPrintMargin.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showPrintMargin.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'showPrintMargin',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Print margin column */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'top',
                                paddingTop    : Constants.PADDING_X1,
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Print margin column</Label>
                        <RadioButtonGroup
                            name="tabSize"
                            valueSelected={this.props.store.printMarginColumn72.booleanValue ? Constants.PRINT_MARGIN_COLUMNS[0] : this.props.store.printMarginColumn80.booleanValue ? Constants.PRINT_MARGIN_COLUMNS[1] : this.props.store.printMarginColumn100.booleanValue ? Constants.PRINT_MARGIN_COLUMNS[2] : Constants.PRINT_MARGIN_COLUMNS[3]}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onChange={(event, value) => {
                                this.props.store.printMarginColumn72.booleanValue  = value === Constants.PRINT_MARGIN_COLUMNS[0];
                                this.props.store.printMarginColumn80.booleanValue  = value === Constants.PRINT_MARGIN_COLUMNS[1];
                                this.props.store.printMarginColumn100.booleanValue = value === Constants.PRINT_MARGIN_COLUMNS[2];
                                this.props.store.printMarginColumn120.booleanValue = value === Constants.PRINT_MARGIN_COLUMNS[3];

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'printMarginColumn',
                                    value : value
                                });
                            }}>
                            <RadioButton
                                label={Constants.PRINT_MARGIN_COLUMNS[0] + ' characters'}
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                value={Constants.PRINT_MARGIN_COLUMNS[0]} />
                            <RadioButton
                                label={Constants.PRINT_MARGIN_COLUMNS[1] + ' characters'}
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                style={{ paddingTop : Constants.PADDING_X0 }}
                                value={Constants.PRINT_MARGIN_COLUMNS[1]} />
                            <RadioButton
                                label={Constants.PRINT_MARGIN_COLUMNS[2] + ' characters'}
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                style={{
                                    paddingTop    : Constants.PADDING_X0,
                                    paddingBottom : Constants.PADDING_X0 }}
                                value={Constants.PRINT_MARGIN_COLUMNS[2]} />
                            <RadioButton
                                label={Constants.PRINT_MARGIN_COLUMNS[3] + ' characters'}
                                labelStyle={{ fontSize : Constants.FONT_SIZE_TEXT_DIALOG }}
                                value={Constants.PRINT_MARGIN_COLUMNS[3]} />
                        </RadioButtonGroup>
                    </div>
                    {/* Show invisibles */}
                    <div style={{ width : '100%', display : 'table-row' }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show invisibles</Label>
                        <Toggle
                            toggled={this.props.store.showInvisibles.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showInvisibles.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'showInvisibles',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Show fold widgets */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show fold widgets</Label>
                        <Toggle
                            toggled={this.props.store.showFoldWidgets.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showFoldWidgets.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'showFoldWidgets',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Show gutter */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show gutter</Label>
                        <Toggle
                            toggled={this.props.store.showGutter.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showGutter.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'showGutter',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Show indent guides */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Show indent guides</Label>
                        <Toggle
                            toggled={this.props.store.showIndentGuides.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.showIndentGuides.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'displayIndentGuides',
                                    value : checked
                                });
                            }} />
                    </div>
                    {/* Scroll past last line */}
                    <div
                        style={{
                            width   : '100%',
                            display : 'table-row'
                        }}>
                        <Label
                            style={{
                                width         : '50%',
                                verticalAlign : 'middle',
                                display       : 'table-cell',
                                textAlign     : 'right'
                            }}>Scroll past last line</Label>
                        <Toggle
                            toggled={this.props.store.scrollPastLastLine.booleanValue}
                            style={{
                                width     : '50%',
                                padding   : Constants.PADDING_X1,
                                display   : 'table-cell',
                                textAlign : 'left'
                            }}
                            onToggle={(event, checked : boolean) => {
                                this.props.store.scrollPastLastLine.booleanValue = checked;

                                EventUtils.broadcast('editor.settings.change', {
                                    name  : 'scrollPastEnd',
                                    value : checked
                                });
                            }} />
                    </div>
                </div>
            </Dialog>
        );
    }
}

EditorSettingsDialog.propTypes = {
    store : React.PropTypes.instanceOf(EditorSettingsDialogStore).isRequired
};

export default muiThemeable()(EditorSettingsDialog);
