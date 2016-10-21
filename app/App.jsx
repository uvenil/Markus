'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import Button from './components/buttons/Button.jsx';
import Label from './components/text/Label.jsx';
import Text from './components/text/Text.jsx';
import SearchBox from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import CheckBox from './components/toggles/CheckBox.jsx';
import ListView from './components/lists/ListView.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import Dialog from './components/dialogs/Dialog.jsx';
import PromptDialog from './components/dialogs/PromptDialog.jsx';
import MasterDetailPane from './components/panes/MasterDetailPane.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import { observer } from 'mobx-react';
import Settings from './utils/Settings';
import Path from 'path';
import PubSub from 'pubsub-js';
import SyntaxCodes from './syntax-codes.json';
import ThemeCodes from './theme-codes.json';
import Package from '../package.json';
import Config from '../config.json';
import is from 'electron-is';
import _ from 'lodash';

if (is.dev()) PubSub.immediateExceptions = true;

const { dialog } = require('electron').remote;

@observer
export default class App extends React.Component {
    constructor(props) {
        super(props);

        this._subscriptions = [];
        this._settings      = new Settings();

        this._handleError = message => {
            dialog.showErrorBox('Error', message);
        };

        this._handleFilterListWidthChange = size => {
            this.props.store.filterListWidth = size;

            this._settings.set('filterListWidth', this.props.store.filterListWidth)
                .then(() => console.trace('Saved filterListWidth = ' + size))
                .catch(error => console.error(error));
        };

        this._handleNoteListWidthChange = size => {
            this.props.store.noteListWidth = size;

            this._settings.set('noteListWidth', this.props.store.noteListWidth)
                .then(() => console.trace('Saved noteListWidth = ' + size))
                .catch(error => console.error(error));
        };

        this._handleNewNote = () => {
            if (this.props.store.addNoteEnabled) {
                this.props.presenter.handleAddNoteClick();
            }
        };
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe('Event.error', (eventName, message) => this._handleError(message)));
        this._subscriptions.push(PubSub.subscribe('Database.reset', () => this.props.presenter.resetDatabase()));
        this._subscriptions.push(PubSub.subscribe('Settings.reset', () => this.props.presenter.resetSettings()));
        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible', () => this.props.store.aboutDialogStore.visible = true));
        this._subscriptions.push(PubSub.subscribe('SettingsDialog.visible', () => this.props.store.settingsDialogStore.visible = true));
        this._subscriptions.push(PubSub.subscribe('View.showFilterList', (eventName, show) => this.props.presenter.showFilterList(show)));
        this._subscriptions.push(PubSub.subscribe('View.showNoteList', (eventName, show) => this.props.presenter.showNoteList(show)));
        this._subscriptions.push(PubSub.subscribe('Syntax.change', (eventName, syntax) => this.props.presenter.changeSyntax(syntax)));
        this._subscriptions.push(PubSub.subscribe('Theme.change', (eventName, theme) => this.props.presenter.changeTheme(theme)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.settings', (eventName, data) => this.props.presenter.changeSettings(data)));
        this._subscriptions.push(PubSub.subscribe('Application.newNote', () => this._handleNewNote()));

        this.props.presenter.init();
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const theme   = this.props.store.theme === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');
        const sorting = this.props.store.notesSorting;

        return (
            <div style={{ backgroundColor : theme.primaryBackgroundColor }}>
                <SplitPane
                    split="vertical"
                    minSize={this.props.store.showFilterList ? Config.filterListMinWidth : 0}
                    defaultSize={this.props.store.showFilterList ? this.props.store.filterListWidth : 0}
                    allowResize={this.props.store.showFilterList}
                    pane1Style={{ display : this.props.store.showFilterList ? 'block' : 'none' }}
                    style={{ backgroundColor : theme.primaryBackgroundColor }}
                    onChange={size => this._handleFilterListWidthChange(size)}>
                    <SplitPane
                        split="horizontal"
                        defaultSize={Config.bottomBarHeight}
                        allowResize={false}
                        primary="second"
                        style={{ backgroundColor : theme.secondaryBackgroundColor }}>
                        {/* Filter list */}
                        <div style={{ height : 'calc(100vh - ' + Config.bottomBarHeight + 'px)', display : 'flex', flexFlow : 'column' }}>
                            <FilterListView
                                store={this.props.store.filtersStore}
                                backgroundColor={theme.secondaryBackgroundColor}
                                theme={this.props.store.theme}
                                onItemClick={index => this.props.presenter.handleFilterItemClick(index)}
                                onItemRightClick={index => this.props.presenter.handleFilterItemRightClick(index)} />
                            <div style={{ flex : '1 1 0' }}>
                                <FilterListView
                                    store={this.props.store.categoriesStore}
                                    backgroundColor={theme.secondaryBackgroundColor}
                                    theme={this.props.store.theme}
                                    onItemClick={index => this.props.presenter.handleCategoryItemClick(index)}
                                    onItemRightClick={index => this.props.presenter.handleCategoryItemRightClick(index)} />
                            </div>
                        </div>
                        {/* Add category button */}
                        <Button
                            backgroundColor="none"
                            theme={this.props.store.theme}
                            onClick={() => this.props.presenter.handleAddCategoryClick()}>
                            <i
                                className="fa fa-fw fa-plus"
                                title="Add category…" />
                        </Button>
                    </SplitPane>
                    <SplitPane
                        split="vertical"
                        minSize={this.props.store.showNoteList ? Config.noteListMinWidth : 0}
                        defaultSize={this.props.store.showNoteList ? this.props.store.noteListWidth : 0}
                        allowResize={this.props.store.showNoteList}
                        pane1Style={{ display : this.props.store.showNoteList ? 'block' : 'none' }}
                        style={{ backgroundColor : theme.primaryBackgroundColor }}
                        onChange={size => this._handleNoteListWidthChange(size)}>
                        <SplitPane
                            split="horizontal"
                            defaultSize={Config.topBarHeight}
                            allowResize={false}
                            style={{ backgroundColor : theme.primaryBackgroundColor }}>
                            {/* Search notes */}
                            <div style={{ width : '100%', display : 'flex', flexFlow : 'row', padding : Config.paddingX0, paddingRight : Config.paddingX1 }}>
                                <SearchBox
                                    hintText="Search notes"
                                    theme={this.props.store.theme}
                                    onChange={value => this.props.presenter.filterNoteList(value)} />
                            </div>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.bottomBarHeight}
                                allowResize={false}
                                primary="second"
                                style={{ backgroundColor : theme.primaryBackgroundColor }}>
                                {/* Note list */}
                                <NoteListView
                                    store={this.props.store.notesStore}
                                    theme={this.props.store.theme}
                                    onItemClick={index => this.props.presenter.handleNoteItemClick(index)} />
                                {/* Note list tools */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                    <Button
                                        backgroundColor="none"
                                        theme={this.props.store.theme}
                                        disabled={!this.props.store.addNoteEnabled}
                                        onClick={() => this.props.presenter.handleAddNoteClick()}>
                                        <i
                                            className="fa fa-fw fa-plus"
                                            title="Add note" />
                                    </Button>
                                    <div style={{ flex : '1 1 0', textAlign : 'right' }}>
                                        <Button
                                            backgroundColor="none"
                                            theme={this.props.store.theme}
                                            onClick={() => this.props.presenter.handleNotesSortingClick()}>
                                            {sorting === 0 || sorting === 1 ? 'Name' : sorting === 2 || sorting === 3 ? 'Last updated' : 'Created'} <i className={'fa fa-fw fa-caret-' + (sorting === 0 || sorting === 2 || sorting === 4 ? 'down' : 'up')} />
                                        </Button>
                                    </div>
                                </div>
                            </SplitPane>
                        </SplitPane>
                        <SplitPane
                            split="horizontal"
                            defaultSize={Config.topBarHeight}
                            allowResize={false}
                            style={{ backgroundColor : theme.primaryBackgroundColor }}>
                            {/* Search note contents */}
                            <div style={{ width : '100%', display : 'flex', flexFlow : 'row', padding : Config.paddingX0, paddingRight : Config.paddingX1 }}>
                                <SearchBox
                                    hintText="Search contents"
                                    theme={this.props.store.theme} />
                            </div>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.bottomBarHeight}
                                allowResize={false}
                                primary="second"
                                style={{ backgroundColor : theme.primaryBackgroundColor }}>
                                {/* Note editor */}
                                <TextEditor
                                    store={this.props.store.editorStore}
                                    theme={this.props.store.theme} />
                                {/* Note editor tools */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                    <div>
                                        {/* Star note */}
                                        <Button
                                            backgroundColor="none"
                                            theme={this.props.store.theme}
                                            disabled={_.isNil(this.props.store.editorStore.record)}
                                            onClick={() => this.props.presenter.handleStarClick()}>
                                            <i
                                                className={'fa fa-fw fa-star' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? '' : '-o')}
                                                title={(!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? 'Un-star this note' : 'Star this note'} />
                                        </Button>
                                        {/* Archive note */}
                                        <Button
                                            backgroundColor="none"
                                            theme={this.props.store.theme}
                                            disabled={_.isNil(this.props.store.editorStore.record)}
                                            onClick={() => this.props.presenter.handleArchiveClick()}>
                                            <i
                                                className={'fa fa-fw fa-trash' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? '' : '-o')}
                                                title={(!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? 'Un-archive this note' : 'Archive this note'} />
                                        </Button>
                                        <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                        {/* Select category */}
                                        <Button
                                            backgroundColor="none"
                                            theme={this.props.store.theme}
                                            disabled={_.isNil(this.props.store.editorStore.record)}
                                            onClick={() => this.props.presenter.handleSelectCategoryClick()}>
                                            {this.props.store.editorStore.record ? this.props.store.editorStore.record.category ? this.props.store.editorStore.record.category : 'Uncategorized' : ''}
                                        </Button>
                                    </div>
                                    <div style={{ margin : 'auto', paddingLeft : Config.paddingX0 + 'px', paddingRight : Config.paddingX0 + 'px', flex : '1 1 0', textAlign : 'right' }}>
                                        {/* Overwrite status */}
                                        <Label theme={this.props.store.theme}>{this.props.store.editorStore.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                        <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                        {/* Row/column position */}
                                        <Label theme={this.props.store.theme}>{this.props.store.editorStore.cursorPosition ? this.props.store.editorStore.cursorPosition.row + ' : ' + this.props.store.editorStore.cursorPosition.column : ''}</Label>
                                    </div>
                                </div>
                            </SplitPane>
                        </SplitPane>
                    </SplitPane>
                </SplitPane>
                {/* About dialog */}
                <Dialog
                    store={this.props.store.aboutDialogStore}
                    width={300}
                    height={260}
                    theme={this.props.store.theme}>
                    <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX1, paddingBottom : Config.paddingX2, backgroundColor : theme.dialogBackgroundColor }}>
                        <img src={Path.join(__dirname, './images/artisan.png')} /><br />
                        <Text
                            fontWeight={500}
                            textSize="large"
                            theme={this.props.store.theme}>{Package.productName}</Text>
                        <Text theme={this.props.store.theme}>{'Version ' + Package.version}</Text>
                        <Text
                            fontWeight={300}
                            textSize="small"
                            theme={this.props.store.theme}>{'Copyright © ' + new Date().getFullYear()}</Text>
                        <div style={{ paddingLeft : Config.paddingX2, paddingRight : Config.paddingX2, paddingTop : Config.paddingX2, paddingBottom : Config.paddingX1 }}>
                            <Button
                                width={Config.buttonWidth}
                                backgroundColor="primary"
                                theme={this.props.store.theme}
                                onClick={() => this.props.store.aboutDialogStore.visible = false}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Dialog>
                {/* Add category dialog */}
                <PromptDialog
                    store={this.props.store.addCategoryDialogStore}
                    width={200}
                    height={116}
                    label="New category name:"
                    theme={this.props.store.theme}
                    onEnter={value => this.props.presenter.addCategory(value)} />
                {/* Settings dialog */}
                <Dialog
                    store={this.props.store.settingsDialogStore}
                    width={480}
                    height={360}
                    theme={this.props.store.theme}>
                    <MasterDetailPane
                        masterWidth={120}
                        masterStore={this.props.store.settingsPaneStore}
                        theme={this.props.store.theme}>
                        {/* Editor */}
                        <div style={{ width : 'calc(359px - ' + Config.paddingX2 + 'px)', height : 'calc(360px - ' + Config.paddingX2 + 'px)', padding : Config.paddingX1, display : 'flex', flexFlow : 'column', overflow : 'auto' }}>
                            <div style={{ display : 'table' }}>
                                {/* Highlight current line */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Highlight current line</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.highlightCurrentLine}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.highlightCurrentLine.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'highlightActiveLine', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Show line numbers */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show line numbers</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showLineNumbers}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showLineNumbers.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'showLineNumbers', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Tab size */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Tab size</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.tabSize2}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.tabSize2.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 2 });
                                            }}>2 spaces</CheckBox>
                                        <div style={{ paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                                            <CheckBox
                                                store={this.props.store.settingsStore.tabSize4}
                                                theme={this.props.store.theme}
                                                onChange={checked => {
                                                    this.props.store.settingsStore.tabSize4.checked = checked;
                                                    PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 4 });
                                                }}>4 spaces</CheckBox>
                                        </div>
                                        <CheckBox
                                            store={this.props.store.settingsStore.tabSize8}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.tabSize8.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 8 });
                                            }}>8 spaces</CheckBox>
                                    </div>
                                </div>
                                {/* Use soft tabs */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Use soft tabs</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.useSoftTabs}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.useSoftTabs.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'useSoftTabs', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Word wrap */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Word wrap</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.wordWrap}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.wordWrap.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'wordWrap', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Show print margin */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show print margin</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showPrintMargin}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showPrintMargin.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'showPrintMargin', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Print margin column */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Print margin column</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.printMarginColumn72}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.printMarginColumn72.checked  = true;
                                                this.props.store.settingsStore.printMarginColumn80.checked  = false;
                                                this.props.store.settingsStore.printMarginColumn100.checked = false;
                                                this.props.store.settingsStore.printMarginColumn120.checked = false;
                                                PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 72 });
                                            }}>72</CheckBox>
                                        <div style={{ paddingTop : Config.paddingX1 + 'px' }}>
                                            <CheckBox
                                                store={this.props.store.settingsStore.printMarginColumn80}
                                                theme={this.props.store.theme}
                                                onChange={checked => {
                                                    this.props.store.settingsStore.printMarginColumn72.checked  = false;
                                                    this.props.store.settingsStore.printMarginColumn80.checked  = true;
                                                    this.props.store.settingsStore.printMarginColumn100.checked = false;
                                                    this.props.store.settingsStore.printMarginColumn120.checked = false;
                                                    PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 80 });
                                                }}>80</CheckBox>
                                        </div>
                                        <div style={{ paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                                            <CheckBox
                                                store={this.props.store.settingsStore.printMarginColumn100}
                                                theme={this.props.store.theme}
                                                onChange={checked => {
                                                    this.props.store.settingsStore.printMarginColumn72.checked  = false;
                                                    this.props.store.settingsStore.printMarginColumn80.checked  = false;
                                                    this.props.store.settingsStore.printMarginColumn100.checked = true;
                                                    this.props.store.settingsStore.printMarginColumn120.checked = false;
                                                    PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 100 });
                                                }}>100</CheckBox>
                                        </div>
                                        <CheckBox
                                            store={this.props.store.settingsStore.printMarginColumn120}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.printMarginColumn72.checked  = false;
                                                this.props.store.settingsStore.printMarginColumn80.checked  = false;
                                                this.props.store.settingsStore.printMarginColumn100.checked = false;
                                                this.props.store.settingsStore.printMarginColumn120.checked = true;
                                                PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 120 });
                                            }}>120</CheckBox>
                                    </div>
                                </div>
                                {/* Show invisibles */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show invisibles</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showInvisibles}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showInvisibles.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'showInvisibles', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Show fold widgets */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show fold widgets</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showFoldWidgets}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showFoldWidgets.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'showFoldWidgets', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Show gutter */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show gutter</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showGutter}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showGutter.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'showGutter', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Show indent guides */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Show indent guides</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.showIndentGuides}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.showIndentGuides.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'displayIndentGuides', value : checked });
                                            }} />
                                    </div>
                                </div>
                                {/* Scroll past last line */}
                                <div style={{ display : 'table-row' }}>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'right' }}>
                                        <Label theme={this.props.store.theme}>Scroll past last line</Label>
                                    </div>
                                    <div style={{ padding : Config.paddingX1, display : 'table-cell', textAlign : 'left' }}>
                                        <CheckBox
                                            store={this.props.store.settingsStore.scrollPastLastLine}
                                            theme={this.props.store.theme}
                                            onChange={checked => {
                                                this.props.store.settingsStore.scrollPastLastLine.checked = checked;
                                                PubSub.publish('TextEditor.settings', { name : 'scrollPastEnd', value : checked });
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Current syntax */}
                        <div style={{ width : '359px', height : '360px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                            <div style={{ width : '359px', flex : '1 1 0' }}>
                                <ListView
                                    selectedIndex={this.props.store.currentSyntaxListViewStore.selectedIndex}
                                    backgroundColor={theme.primaryBackgroundColor}
                                    theme={this.props.store.theme}
                                    onItemClick={index => {
                                        if (this.props.store.editorStore.record) {
                                            this.props.store.currentSyntaxListViewStore.selectedIndex = index;
                                            this.props.presenter.changeCurrentSyntax(SyntaxCodes.items[index]);
                                        }
                                    }}>
                                    {this.props.store.currentSyntaxListViewStore.items.map(item => {
                                        return (
                                            <div
                                                key={item.itemId}
                                                style={{ width : 'calc(359px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                                <Text theme={this.props.store.theme}>{item.primaryText}</Text>
                                            </div>
                                        );
                                    })}
                                </ListView>
                            </div>
                        </div>
                        {/* Default syntax */}
                        <div style={{ width : '359px', height : '360px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                            <div style={{ width : '359px', flex : '1 1 0' }}>
                                <ListView
                                    selectedIndex={this.props.store.defaultSyntaxListViewStore.selectedIndex}
                                    backgroundColor={theme.primaryBackgroundColor}
                                    theme={this.props.store.theme}
                                    onItemClick={index => {
                                        this.props.store.defaultSyntaxListViewStore.selectedIndex = index;
                                        this.props.presenter.changeDefaultSyntax(SyntaxCodes.items[index]);
                                    }}>
                                    {this.props.store.defaultSyntaxListViewStore.items.map(item => {
                                        return (
                                            <div
                                                key={item.itemId}
                                                style={{ width : 'calc(359px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                                <Text theme={this.props.store.theme}>{item.primaryText}</Text>
                                            </div>
                                        );
                                    })}
                                </ListView>
                            </div>
                        </div>
                        {/* Theme */}
                        <div style={{ width : '359px', height : '360px', display : 'flex', flexFlow : 'column', overflowX : 'hidden', overflowY : 'auto' }}>
                            <div style={{ width : '359px', flex : '1 1 0' }}>
                                <ListView
                                    selectedIndex={this.props.store.themeListViewStore.selectedIndex}
                                    backgroundColor={theme.primaryBackgroundColor}
                                    theme={this.props.store.theme}
                                    onItemClick={index => {
                                        this.props.store.themeListViewStore.selectedIndex = index;
                                        this.props.presenter.changeTheme(ThemeCodes.items[index]);
                                    }}>
                                    {this.props.store.themeListViewStore.items.map(item => {
                                        return (
                                            <div
                                                key={item.itemId}
                                                style={{ width : 'calc(359px - ' + Config.paddingX2 + 'px)', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                                <Text theme={this.props.store.theme}>{item.primaryText}</Text>
                                            </div>
                                        );
                                    })}
                                </ListView>
                            </div>
                        </div>
                    </MasterDetailPane>
                </Dialog>
                {/* Rename category dialog */}
                <PromptDialog
                    store={this.props.store.updateCategoryDialogStore}
                    width={200}
                    height={116}
                    label="Rename category:"
                    theme={this.props.store.theme}
                    onEnter={value => this.props.presenter.updateCategory(this.props.store.updateCategoryDialogStore.value, value)} />
                {/* Select category dialog */}
                <Dialog
                    store={this.props.store.selectCategoryDialogStore}
                    width={400}
                    height={320}
                    theme={this.props.store.theme}>
                    <div style={{ width : 'calc(100% - ' + 2 * Config.paddingX2 + 'px)', textAlign : 'left', padding : Config.paddingX2 + 'px', backgroundColor : theme.dialogBackgroundColor }}>
                        <div style={{ height : '248px', display : 'flex', flexFlow : 'column', overflow : 'auto', backgroundColor : theme.primaryBackgroundColor }}>
                            <div style={{ flex : '1 1 0' }}>
                                <ListView
                                    backgroundColor={theme.primaryBackgroundColor}
                                    theme={this.props.store.theme}
                                    selectedIndex={this.props.store.selectCategoryDialogStore.list.selectedIndex}
                                    onItemClick={index => this.props.presenter.handleSelectCategoryItemClick(index)}>
                                    {this.props.store.selectCategoryDialogStore.list.items.map(item => {
                                        return (
                                            <div
                                                key={item.itemId}
                                                style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                                <Text theme={this.props.store.theme}>{item.primaryText}</Text>
                                            </div>
                                        );
                                    })}
                                </ListView>
                            </div>
                        </div>
                        <div style={{ width : '100%', textAlign : 'center', paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX2 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                            <span style={{ padding : Config.paddingX1 + 'px' }}>
                                <Button
                                    width={Config.buttonWidth}
                                    backgroundColor="primary"
                                    theme={this.props.store.theme}
                                    onClick={() => this.props.presenter.handleSelectCategoryOkClick()}>
                                    OK
                                </Button>
                            </span>
                            <span style={{ padding : Config.paddingX1 + 'px' }}>
                                <Button
                                    width={Config.buttonWidth}
                                    backgroundColor="default"
                                    theme={this.props.store.theme}
                                    onClick={() => this.props.presenter.handleSelectCategoryNoneClick()}>
                                    None
                                </Button>
                            </span>
                            <span style={{ padding : Config.paddingX1 + 'px' }}>
                                <Button
                                    width={Config.buttonWidth}
                                    backgroundColor="default"
                                    theme={this.props.store.theme}
                                    onClick={() => this.props.store.selectCategoryDialogStore.visible = false}>
                                    Cancel
                                </Button>
                            </span>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}

App.propTypes = {
    store     : React.PropTypes.instanceOf(AppStore),
    presenter : React.PropTypes.instanceOf(AppPresenter)
};

module.exports = App;
