'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Label from '../text/Label.jsx';
import Text from '../text/Text.jsx';
import CheckBox from '../toggles/CheckBox.jsx';
import Dialog from '../dialogs/Dialog.jsx';
import MasterDetailPane from '../panes/MasterDetailPane.jsx';
import ListView from '../lists/ListView.jsx';
import DialogStore from './DialogStore';
import ListViewStore from '../lists/ListViewStore';
import SettingsStore from '../../SettingsStore';
import Config from '../../../config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class SettingsDialog extends React.Component {
    constructor(props) {
        super(props);

        this._handleCurrentSyntaxChanged = index => {
            this.props.currentSyntaxListViewStore.selectedIndex = index;

            if (this.props.onCurrentSyntaxChanged) {
                this.props.onCurrentSyntaxChanged(index);
            }
        };

        this._handleDefaultSyntaxChanged = index => {
            this.props.defaultSyntaxListViewStore.selectedIndex = index;

            if (this.props.onDefaultSyntaxChanged) {
                this.props.onDefaultSyntaxChanged(index);
            }
        };

        this._handleThemeChanged = index => {
            this.props.themeListViewStore.selectedIndex = index;

            if (this.props.onThemeChanged) {
                this.props.onThemeChanged(index);
            }
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        return (
            <Dialog
                store={this.props.store}
                width={this.props.width}
                height={this.props.height}
                theme={this.props.theme}
                onAfterOpen={() => this.props.masterStore.selectedIndex = 0}>
                <MasterDetailPane
                    masterWidth={this.props.masterWidth}
                    masterStore={this.props.masterStore}
                    theme={this.props.theme}
                    onClose={() => this.props.store.visible = false}>
                    {/* Editor */}
                    <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px - ' + Config.paddingX2 + 'px)', height : 'calc(' + this.props.height + 'px - ' + Config.paddingX2 + 'px)', padding : Config.paddingX1, display : 'flex', flexFlow : 'column', overflow : 'auto' }}>
                        <div style={{ display : 'table' }}>
                            {/* Highlight current line */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Highlight current line</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.highlightCurrentLine}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.highlightCurrentLine.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'highlightActiveLine', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Show line numbers */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show line numbers</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showLineNumbers}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showLineNumbers.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'showLineNumbers', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Tab size */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Tab size</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.tabSize2}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.tabSize2.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 2 });
                                        }}>2 spaces</CheckBox>
                                    <div style={{ paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                                        <CheckBox
                                            store={this.props.settingsStore.tabSize4}
                                            theme={this.props.theme}
                                            onChange={checked => {
                                                this.props.settingsStore.tabSize4.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 4 });
                                            }}>4 spaces</CheckBox>
                                    </div>
                                    <CheckBox
                                        store={this.props.settingsStore.tabSize8}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.tabSize8.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 8 });
                                        }}>8 spaces</CheckBox>
                                </div>
                            </div>
                            {/* Use soft tabs */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Use soft tabs</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.useSoftTabs}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.store.settingsStore.useSoftTabs.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'useSoftTabs', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Word wrap */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Word wrap</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.wordWrap}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.wordWrap.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'wordWrap', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Show print margin */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show print margin</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showPrintMargin}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showPrintMargin.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'showPrintMargin', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Print margin column */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Print margin column</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.printMarginColumn72}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.printMarginColumn72.checked  = true;
                                            this.props.settingsStore.printMarginColumn80.checked  = false;
                                            this.props.settingsStore.printMarginColumn100.checked = false;
                                            this.props.settingsStore.printMarginColumn120.checked = false;
                                            PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 72 });
                                        }}>72</CheckBox>
                                    <div style={{ paddingTop : Config.paddingX1 + 'px' }}>
                                        <CheckBox
                                            store={this.props.settingsStore.printMarginColumn80}
                                            theme={this.props.theme}
                                            onChange={checked => {
                                                this.props.settingsStore.printMarginColumn72.checked  = false;
                                                this.props.settingsStore.printMarginColumn80.checked  = true;
                                                this.props.settingsStore.printMarginColumn100.checked = false;
                                                this.props.settingsStore.printMarginColumn120.checked = false;
                                                PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 80 });
                                            }}>80</CheckBox>
                                    </div>
                                    <div style={{ paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                                        <CheckBox
                                            store={this.props.settingsStore.printMarginColumn100}
                                            theme={this.props.theme}
                                            onChange={checked => {
                                                this.props.settingsStore.printMarginColumn72.checked  = false;
                                                this.props.settingsStore.printMarginColumn80.checked  = false;
                                                this.props.settingsStore.printMarginColumn100.checked = true;
                                                this.props.settingsStore.printMarginColumn120.checked = false;
                                                PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 100 });
                                            }}>100</CheckBox>
                                    </div>
                                    <CheckBox
                                        store={this.props.settingsStore.printMarginColumn120}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.printMarginColumn72.checked  = false;
                                            this.props.settingsStore.printMarginColumn80.checked  = false;
                                            this.props.settingsStore.printMarginColumn100.checked = false;
                                            this.props.settingsStore.printMarginColumn120.checked = true;
                                            PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 120 });
                                        }}>120</CheckBox>
                                </div>
                            </div>
                            {/* Show invisibles */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show invisibles</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showInvisibles}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showInvisibles.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'showInvisibles', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Show fold widgets */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show fold widgets</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showFoldWidgets}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showFoldWidgets.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'showFoldWidgets', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Show gutter */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show gutter</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showGutter}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showGutter.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'showGutter', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Show indent guides */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Show indent guides</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.showIndentGuides}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.showIndentGuides.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'displayIndentGuides', value : checked });
                                        }} />
                                </div>
                            </div>
                            {/* Scroll past last line */}
                            <div style={{ display : 'table-row' }}>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                    <Label theme={this.props.theme}>Scroll past last line</Label>
                                </div>
                                <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                    <CheckBox
                                        store={this.props.settingsStore.scrollPastLastLine}
                                        theme={this.props.theme}
                                        onChange={checked => {
                                            this.props.settingsStore.scrollPastLastLine.checked = checked;
                                            PubSub.publish('TextEditor.settings', { name : 'scrollPastEnd', value : checked });
                                        }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Current syntax */}
                    <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', height : this.props.height + 'px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                        <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', flex : '1 1 0' }}>
                            <ListView
                                selectedIndex={this.props.currentSyntaxListViewStore.selectedIndex}
                                backgroundColor={theme.primaryBackgroundColor}
                                theme={this.props.theme}
                                onItemClick={index => this._handleCurrentSyntaxChanged(index)}>
                                {this.props.currentSyntaxListViewStore.items.map(item => {
                                    return (
                                        <div
                                            key={item.itemId}
                                            style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                            <Text theme={this.props.theme}>{item.primaryText}</Text>
                                        </div>
                                    );
                                })}
                            </ListView>
                        </div>
                    </div>
                    {/* Default syntax */}
                    <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', height : this.props.height + 'px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                        <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', flex : '1 1 0' }}>
                            <ListView
                                selectedIndex={this.props.defaultSyntaxListViewStore.selectedIndex}
                                backgroundColor={theme.primaryBackgroundColor}
                                theme={this.props.theme}
                                onItemClick={index => this._handleDefaultSyntaxChanged(index)}>
                                {this.props.defaultSyntaxListViewStore.items.map(item => {
                                    return (
                                        <div
                                            key={item.itemId}
                                            style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                            <Text theme={this.props.theme}>{item.primaryText}</Text>
                                        </div>
                                    );
                                })}
                            </ListView>
                        </div>
                    </div>
                    {/* Theme */}
                    <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', height : this.props.height + 'px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                        <div style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px)', flex : '1 1 0' }}>
                            <ListView
                                selectedIndex={this.props.themeListViewStore.selectedIndex}
                                backgroundColor={theme.primaryBackgroundColor}
                                theme={this.props.theme}
                                onItemClick={index => this._handleThemeChanged(index)}>
                                {this.props.themeListViewStore.items.map(item => {
                                    return (
                                        <div
                                            key={item.itemId}
                                            style={{ width : 'calc(' + this.props.width + 'px - 1px - ' + this.props.masterWidth + 'px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                            <Text theme={this.props.theme}>{item.primaryText}</Text>
                                        </div>
                                    );
                                })}
                            </ListView>
                        </div>
                    </div>
                </MasterDetailPane>
            </Dialog>
        );
    }
}

SettingsDialog.propTypes = {
    store                      : React.PropTypes.instanceOf(DialogStore).isRequired,
    masterStore                : React.PropTypes.instanceOf(ListViewStore).isRequired,
    settingsStore              : React.PropTypes.instanceOf(SettingsStore).isRequired,
    currentSyntaxListViewStore : React.PropTypes.instanceOf(ListViewStore).isRequired,
    defaultSyntaxListViewStore : React.PropTypes.instanceOf(ListViewStore).isRequired,
    themeListViewStore         : React.PropTypes.instanceOf(ListViewStore).isRequired,
    width                      : React.PropTypes.number.isRequired,
    height                     : React.PropTypes.number.isRequired,
    masterWidth                : React.PropTypes.number.isRequired,
    theme                      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    onCurrentSyntaxChanged     : React.PropTypes.func,
    onDefaultSyntaxChanged     : React.PropTypes.func,
    onThemeChanged             : React.PropTypes.func
};

SettingsDialog.defaultProps = {
    theme : 'light'
};

module.exports = SettingsDialog;
