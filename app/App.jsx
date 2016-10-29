'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import { Button } from './components/buttons/Button.jsx';
import { Label } from './components/text/Label.jsx';
import { Text } from './components/text/Text.jsx';
import { SearchBox } from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import { ListView } from './components/lists/ListView.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import Dialog from './components/dialogs/Dialog.jsx';
import PromptDialog from './components/dialogs/PromptDialog.jsx';
import EditorSettingsDialog from './components/dialogs/EditorSettingsDialog.jsx';
import ListViewDialog from './components/dialogs/ListViewDialog.jsx';
import SettingsDialog from './components/dialogs/SettingsDialog.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import { observer } from 'mobx-react';
import Settings from './utils/Settings';
import Path from 'path';
import PubSub from 'pubsub-js';
import SyntaxCodes from './definitions/syntax-codes.json';
import ThemeCodes from './definitions/theme-codes.json';
import Package from '../package.json';
import Config from '../config.json';
import Constants from './utils/Constants';
import is from 'electron-is';
import _ from 'lodash';

if (is.dev()) PubSub.immediateExceptions = true;

const { dialog } = require('electron').remote;

const FONTS = is.macOS() ? require('./definitions/fonts.mac.json') : require('./definitions/fonts.win.json');

const LIGHT_MUI_THEME = getMuiTheme({
    palette : {}
});

const DARK_MUI_THEME = getMuiTheme({
    palette : {}
});

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

            this._settings.set('filterListWidth', this.props.store.filterListWidth).catch(error => PubSub.publish('Event.error', error));
        };

        this._handleNoteListWidthChange = size => {
            this.props.store.noteListWidth = size;

            this._settings.set('noteListWidth', this.props.store.noteListWidth).catch(error => PubSub.publish('Event.error', error));
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
        this._subscriptions.push(PubSub.subscribe('Application.importNotes', () => this.props.presenter.handleImportNotes()));
        this._subscriptions.push(PubSub.subscribe('Application.exportNotes', () => this.props.presenter.handleExportNotes()));

        this.props.presenter.init();
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const theme    = this.props.store.theme === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');
        const muiTheme = this.props.store.theme === 'dark' ? DARK_MUI_THEME : LIGHT_MUI_THEME;
        const sorting  = this.props.store.notesSorting;

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={{ backgroundColor : theme.primaryBackgroundColor }}>
                    {/* Drawer */}
                    <Drawer
                        docked={false}
                        width={Constants.DRAWER_WIDTH}
                        open={this.props.store.drawerOpened}
                        onRequestChange={open => this.props.store.drawerOpened = open}>
                        <List>
                            <Subheader>Settings</Subheader>
                            <ListItem
                                primaryText="Editor"
                                leftIcon={<FontIcon className="fa fa-fw fa-pencil-square-o" />}
                                onTouchTap={() => {
                                    this.props.store.drawerOpened                      = false;
                                    this.props.store.editorSettingsDialogStore.visible = true;
                                }} />
                            <ListItem
                                primaryText="Syntax"
                                secondaryText="For current note"
                                leftIcon={<FontIcon className="fa fa-fw fa-code" />}
                                onTouchTap={() => {
                                    this.props.store.drawerOpened                     = false;
                                    this.props.store.currentSyntaxDialogStore.visible = true;
                                }} />
                            <ListItem
                                primaryText="Syntax"
                                secondaryText="For default notes"
                                leftIcon={<FontIcon className="fa fa-fw fa-code" />}
                                onTouchTap={() => {
                                    this.props.store.drawerOpened                     = false;
                                    this.props.store.defaultSyntaxDialogStore.visible = true;
                                }} />
                            <ListItem
                                primaryText="Theme"
                                leftIcon={<FontIcon className="fa fa-fw fa-eye" />}
                                onTouchTap={() => {
                                    this.props.store.drawerOpened             = false;
                                    this.props.store.themeDialogStore.visible = true;
                                }} />
                            <ListItem
                                primaryText="Font"
                                leftIcon={<FontIcon className="fa fa-fw fa-font" />}
                                onTouchTap={() => {
                                    this.props.store.drawerOpened            = false;
                                    this.props.store.fontDialogStore.visible = true;
                                }} />
                        </List>
                    </Drawer>
                    <SplitPane
                        split="vertical"
                        minSize={this.props.store.showFilterList ? Config.filterListMinWidth : 0}
                        defaultSize={this.props.store.showFilterList ? this.props.store.filterListWidth : 0}
                        allowResize={this.props.store.showFilterList}
                        pane1Style={{ display : this.props.store.showFilterList ? 'block' : 'none' }}
                        style={{ backgroundColor : theme.primaryBackgroundColor }}
                        onChange={size => this._handleFilterListWidthChange(size)}>
                        <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : theme.secondaryBackgroundColor }}>
                            {/* Application menu */}
                            <FlatButton
                                label="Menu"
                                icon={
                                    <FontIcon
                                        className="fa fa-fw fa-bars"
                                        style={{ fontSize : Constants.ICON_FONT_SIZE }} />
                                }
                                labelStyle={{ fontSize : Constants.ICON_FONT_SIZE, textTransform : 'none' }}
                                style={{ width : '100%', height : Constants.TOP_BAR_HEIGHT, lineHeight : Constants.TOP_BAR_HEIGHT + 'px', textAlign : 'left' }}
                                onTouchTap={() => this.props.store.drawerOpened = true} />
                            {/* Filter list */}
                            <div style={{ height : 'calc(100vh - ' + Config.bottomBarHeight + 'px)', display : 'flex', flexFlow : 'column', flex : '1 1 0', overflow : 'auto' }}>
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
                            <FlatButton
                                label="Add category…"
                                icon={
                                    <FontIcon
                                        className="fa fa-fw fa-plus"
                                        style={{ fontSize : Constants.TEXT_FONT_SIZE }} />
                                }
                                labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' }}
                                style={{ width : '100%', height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px', textAlign : 'left' }}
                                onTouchTap={() => this.props.presenter.handleAddCategoryClick()} />
                        </div>
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
                                        onItemClick={index => this.props.presenter.handleNoteItemClick(index)}
                                        onItemRightClick={index => this.props.presenter.handleNoteItemRightClick(index)} />
                                    {/* Note list tools */}
                                    <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                        {/* Add note */}
                                        <FlatButton
                                            label="New note"
                                            labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' }}
                                            icon={
                                                <FontIcon
                                                    className="fa fa-fw fa-file-o"
                                                    style={{ fontSize : Constants.TEXT_FONT_SIZE }} />
                                            }
                                            style={{ minWidth : Constants.BOTTOM_BAR_HEIGHT, height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px' }}
                                            onTouchTap={() => this.props.presenter.handleAddNoteClick()} />
                                        {/* Sort note list */}
                                        <FlatButton
                                            label={sorting === 0 || sorting === 1 ? 'Name' : sorting === 2 || sorting === 3 ? 'Updated' : 'Created'}
                                            labelPosition="before"
                                            icon={
                                                <FontIcon
                                                    className={'fa fa-fw fa-caret-' + (sorting === 1 || sorting === 3 || sorting === 5 ? 'down' : 'up')}
                                                    style={{ fontSize : Constants.TEXT_FONT_SIZE }} />
                                            }
                                            labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' }}
                                            style={{ minWidth : Constants.BOTTOM_BAR_HEIGHT, height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px', flex : '1 1 0', textAlign : 'right' }}
                                            onTouchTap={() => this.props.presenter.handleNotesSortingClick()} />
                                    </div>
                                </SplitPane>
                            </SplitPane>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : theme.primaryBackgroundColor }}>
                                {/* Note editor */}
                                <div style={{ flex : '1 1 0' }}>
                                    <TextEditor
                                        store={this.props.store.editorStore}
                                        theme={this.props.store.theme} />
                                </div>
                                {/* Note editor tools */}
                                <div style={{ width : '100%', height : Constants.BOTTOM_BAR_HEIGHT, display : 'flex', flexFlow : 'row' }}>
                                    {/* Star note */}
                                    <FlatButton
                                        icon={
                                            <FontIcon
                                                className={'fa fa-fw fa-star' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? '' : '-o')}
                                                style={{ fontSize : Constants.TEXT_FONT_SIZE }} />
                                        }
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        style={{ width : Constants.BOTTOM_BAR_HEIGHT, minWidth : Constants.BOTTOM_BAR_HEIGHT, height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px' }}
                                        onTouchTap={() => this.props.presenter.handleStarClick()} />
                                    {/* Archive note */}
                                    <FlatButton
                                        icon={
                                            <FontIcon
                                                className={'fa fa-fw fa-trash' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? '' : '-o')}
                                                style={{ fontSize : Constants.TEXT_FONT_SIZE }} />
                                        }
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        style={{ width : Constants.BOTTOM_BAR_HEIGHT, minWidth : Constants.BOTTOM_BAR_HEIGHT, height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px' }}
                                        onTouchTap={() => this.props.presenter.handleArchiveClick()} />
                                    <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                    {/* Select category */}
                                    <FlatButton
                                        label={this.props.store.editorStore.record ? this.props.store.editorStore.record.category ? this.props.store.editorStore.record.category : 'Uncategorized' : ''}
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        labelStyle={{ fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' }}
                                        style={{ height : Constants.BOTTOM_BAR_HEIGHT, lineHeight : Constants.BOTTOM_BAR_HEIGHT + 'px' }}
                                        onTouchTap={() => this.props.presenter.handleSelectCategoryClick()} />
                                    <div style={{ margin : 'auto', paddingLeft : Config.paddingX0 + 'px', paddingRight : Config.paddingX0 + 'px', flex : '1 1 0', textAlign : 'right' }}>
                                        {/* Overwrite status */}
                                        <Label theme={this.props.store.theme}>{this.props.store.editorStore.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                        <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                        {/* Row/column position */}
                                        <Label theme={this.props.store.theme}>{this.props.store.editorStore.record && this.props.store.editorStore.cursorPosition ? (this.props.store.editorStore.cursorPosition.row + 1) + ' : ' + this.props.store.editorStore.cursorPosition.column : ''}</Label>
                                    </div>
                                </div>
                            </div>
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
                        title="Add category"
                        label="New category name"
                        onEnter={value => this.props.presenter.addCategory(value)} />
                    {/* Rename category dialog */}
                    <PromptDialog
                        store={this.props.store.updateCategoryDialogStore}
                        title="Rename category"
                        label="Update category name"
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
                    {/* Editor settings dialog */}
                    <EditorSettingsDialog
                        store={this.props.store.editorSettingsDialogStore}
                        settingsStore={this.props.store.settingsStore} />
                    {/* Syntax dialog for current note */}
                    <ListViewDialog
                        store={this.props.store.currentSyntaxDialogStore}
                        listViewStore={this.props.store.currentSyntaxListViewStore}
                        theme={this.props.store.theme}
                        onItemClick={index => {
                            this.props.store.currentSyntaxListViewStore.selectedIndex = index;

                            if (this.props.store.editorStore.record) {
                                this.props.presenter.changeCurrentSyntax(SyntaxCodes.items[index]);
                            }
                        }} />
                    {/* Syntax dialog for default notes */}
                    <ListViewDialog
                        store={this.props.store.defaultSyntaxDialogStore}
                        listViewStore={this.props.store.defaultSyntaxListViewStore}
                        theme={this.props.store.theme}
                        onItemClick={index => {
                            this.props.store.defaultSyntaxListViewStore.selectedIndex = index;

                            this.props.presenter.changeDefaultSyntax(SyntaxCodes.items[index]);
                        }} />
                    {/* Theme dialog */}
                    <ListViewDialog
                        store={this.props.store.themeDialogStore}
                        listViewStore={this.props.store.themeListViewStore}
                        theme={this.props.store.theme}
                        onItemClick={index => {
                            this.props.store.themeListViewStore.selectedIndex = index;

                            this.props.presenter.changeTheme(ThemeCodes.items[index]);
                        }} />
                    {/* Font dialog */}
                    <ListViewDialog
                        store={this.props.store.fontDialogStore}
                        listViewStore={this.props.store.fontListViewStore}
                        theme={this.props.store.theme}
                        onItemClick={index => {
                            this.props.store.fontListViewStore.selectedIndex = index;

                            this.props.presenter.changeFont(FONTS.items[index]);
                        }} />
                </div>
            </MuiThemeProvider>
        );
    }
}

App.propTypes = {
    store     : React.PropTypes.instanceOf(AppStore),
    presenter : React.PropTypes.instanceOf(AppPresenter)
};

module.exports = App;
