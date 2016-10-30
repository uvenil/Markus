'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Button from './components/buttons/Button.jsx';
import Label from './components/text/Label.jsx';
import Text from './components/text/Text.jsx';
import SearchBox from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import ListView from './components/lists/ListView.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import PromptDialog from './components/dialogs/PromptDialog.jsx';
import EditorSettingsDialog from './components/dialogs/EditorSettingsDialog.jsx';
import ListViewDialog from './components/dialogs/ListViewDialog.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import Settings from './utils/Settings';
import Path from 'path';
import PubSub from 'pubsub-js';
import SyntaxCodes from './definitions/syntax-codes.json';
import ThemeCodes from './definitions/theme-codes.json';
import Package from '../package.json';
import Constants from './utils/Constants';
import is from 'electron-is';
import _ from 'lodash';

if (is.dev()) PubSub.immediateExceptions = true;

const { app, dialog } = require('electron').remote;

const FONTS = is.macOS() ? require('./definitions/fonts.mac.json') : require('./definitions/fonts.win.json');

const LIGHT_THEME = require('./theme.light.json');
const DARK_THEME  = require('./theme.dark.json');

const MUI_LIGHT_THEME = getMuiTheme({
    palette : {
        primary1Color      : LIGHT_THEME.primaryColor,
        primary2Color      : LIGHT_THEME.secondaryBackgroundColor,
        primary3Color      : LIGHT_THEME.disabledBackgroundColor,
        accent1Color       : LIGHT_THEME.accentColor,
        accent2Color       : LIGHT_THEME.selectedBackgroundColor,
        textColor          : LIGHT_THEME.primaryTextColor,
        secondaryTextColor : LIGHT_THEME.secondaryTextColor,
        alternateTextColor : LIGHT_THEME.invertedTextColor,
        canvasColor        : LIGHT_THEME.primaryBackgroundColor,
        borderColor        : LIGHT_THEME.borderColor,
        disabledColor      : LIGHT_THEME.disabledTextColor
    }
});

const MUI_DARK_THEME = getMuiTheme({
    palette : {
        primary1Color      : DARK_THEME.primaryColor,
        primary2Color      : DARK_THEME.secondaryBackgroundColor,
        primary3Color      : DARK_THEME.disabledBackgroundColor,
        accent1Color       : DARK_THEME.accentColor,
        accent2Color       : DARK_THEME.selectedBackgroundColor,
        textColor          : DARK_THEME.primaryTextColor,
        secondaryTextColor : DARK_THEME.secondaryTextColor,
        alternateTextColor : DARK_THEME.invertedTextColor,
        canvasColor        : DARK_THEME.primaryBackgroundColor,
        borderColor        : DARK_THEME.borderColor,
        disabledColor      : DARK_THEME.disabledTextColor
    }
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
        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible', () => this.props.store.aboutDialogStore.booleanValue = true));
        this._subscriptions.push(PubSub.subscribe('View.showFilterList', (eventName, show) => this.props.presenter.showFilterList(show)));
        this._subscriptions.push(PubSub.subscribe('View.showNoteList', (eventName, show) => this.props.presenter.showNoteList(show)));
        this._subscriptions.push(PubSub.subscribe('Syntax.change', (eventName, syntax) => this.props.presenter.changeCurrentSyntax(syntax)));
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
        const sorting  = this.props.store.notesSorting;
        const muiTheme = this.props.store.theme === 'dark' ? MUI_DARK_THEME : MUI_LIGHT_THEME;

        const renderListItem = (primaryText, secondaryText, icon, dialogStore) => {
            return (
                <ListItem
                    primaryText={primaryText}
                    secondaryText={secondaryText}
                    leftIcon={
                        <FontIcon
                            className={'fa fa-fw fa-' + icon}
                            style={{ top : 0, margin : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE, color : muiTheme.palette.textColor }} />
                    }
                    innerDivStyle={{ paddingLeft : '48px', paddingRight : Constants.PADDING_X1, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE }}
                    onTouchTap={() => {
                        this.props.store.drawerOpened = false;
                        dialogStore.booleanValue      = true;
                    }} />
            );
        };

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={{ backgroundColor : muiTheme.palette.canvasColor }}>
                    {/* Drawer */}
                    <Drawer
                        docked={false}
                        width={Constants.DRAWER_WIDTH}
                        open={this.props.store.drawerOpened}
                        onRequestChange={open => this.props.store.drawerOpened = open}>
                        <List>
                            <Subheader style={{ lineHeight : '32px', fontSize : Constants.SUB_HEADING_FONT_SIZE }}>Settings</Subheader>
                            <Divider />
                            {renderListItem('Editor', undefined, 'pencil-square-o', this.props.store.editorSettingsDialogStore)}
                            <Divider />
                            {renderListItem('Syntax', 'For current note', 'code', this.props.store.currentSyntaxDialogStore)}
                            <Divider />
                            {renderListItem('Syntax', 'For default notes', 'code', this.props.store.defaultSyntaxDialogStore)}
                            <Divider />
                            {renderListItem('Theme', undefined, 'eye', this.props.store.themeDialogStore)}
                            <Divider />
                            {renderListItem('Font', undefined, 'font', this.props.store.fontDialogStore)}
                            <Divider />
                        </List>
                    </Drawer>
                    <SplitPane
                        split="vertical"
                        minSize={this.props.store.showFilterList ? Constants.FILTER_LIST_MIN_WIDTH : 0}
                        defaultSize={this.props.store.showFilterList ? this.props.store.filterListWidth : 0}
                        allowResize={this.props.store.showFilterList}
                        pane1Style={{ display : this.props.store.showFilterList ? 'block' : 'none' }}
                        style={{ backgroundColor : muiTheme.palette.canvasColor }}
                        onChange={size => this._handleFilterListWidthChange(size)}>
                        <MuiThemeProvider muiTheme={MUI_DARK_THEME}>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : MUI_DARK_THEME.palette.primary2Color }}>
                                {/* Application menu */}
                                <Button
                                    label="Menu"
                                    icon="bars"
                                    width="100%"
                                    height={Constants.TOP_BAR_HEIGHT}
                                    align="left"
                                    onTouchTap={() => this.props.store.drawerOpened = true} />
                                {/* Filter list */}
                                <div style={{ height : 'calc(100vh - ' + Constants.BOTTOM_BAR_HEIGHT + 'px)', display : 'flex', flexFlow : 'column', flex : '1 1 0', overflow : 'auto' }}>
                                    <FilterListView
                                        store={this.props.store.filtersStore}
                                        onItemClick={index => this.props.presenter.handleFilterItemClick(index)}
                                        onItemRightClick={index => this.props.presenter.handleFilterItemRightClick(index)} />
                                    <div style={{ flex : '1 1 0' }}>
                                        <FilterListView
                                            store={this.props.store.categoriesStore}
                                            onItemClick={index => this.props.presenter.handleCategoryItemClick(index)}
                                            onItemRightClick={index => this.props.presenter.handleCategoryItemRightClick(index)} />
                                    </div>
                                </div>
                                {/* Add category button */}
                                <Button
                                    label="Add category…"
                                    labelWeight="normal"
                                    icon="plus"
                                    width="100%"
                                    height={Constants.BOTTOM_BAR_HEIGHT}
                                    align="left"
                                    onTouchTap={() => this.props.presenter.handleAddCategoryClick()} />
                            </div>
                        </MuiThemeProvider>
                        <SplitPane
                            split="vertical"
                            minSize={this.props.store.showNoteList ? Constants.NOTE_LIST_MIN_WIDTH : 0}
                            defaultSize={this.props.store.showNoteList ? this.props.store.noteListWidth : 0}
                            allowResize={this.props.store.showNoteList}
                            pane1Style={{ display : this.props.store.showNoteList ? 'block' : 'none' }}
                            style={{ backgroundColor : muiTheme.palette.canvasColor }}
                            onChange={size => this._handleNoteListWidthChange(size)}>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Constants.TOP_BAR_HEIGHT}
                                allowResize={false}
                                style={{ backgroundColor : muiTheme.palette.canvasColor }}>
                                {/* Search notes */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row', padding : Constants.PADDING_X0, paddingRight : Constants.PADDING_X1 }}>
                                    <SearchBox
                                        hintText="Search notes"
                                        onChange={value => this.props.presenter.filterNoteList(value)} />
                                </div>
                                <SplitPane
                                    split="horizontal"
                                    defaultSize={Constants.BOTTOM_BAR_HEIGHT}
                                    allowResize={false}
                                    primary="second"
                                    style={{ backgroundColor : muiTheme.palette.canvasColor }}>
                                    {/* Note list */}
                                    <NoteListView
                                        store={this.props.store.notesStore}
                                        onItemClick={index => this.props.presenter.handleNoteItemClick(index)}
                                        onItemRightClick={index => this.props.presenter.handleNoteItemRightClick(index)} />
                                    {/* Note list tools */}
                                    <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                        {/* Add note */}
                                        <Button
                                            label="New note"
                                            labelWeight="normal"
                                            icon="file-o"
                                            height={Constants.BOTTOM_BAR_HEIGHT}
                                            onTouchTap={() => this.props.presenter.handleAddNoteClick()} />
                                        {/* Sort note list */}
                                        <Button
                                            label={sorting === 0 || sorting === 1 ? 'Name' : sorting === 2 || sorting === 3 ? 'Updated' : 'Created'}
                                            labelPosition="before"
                                            labelWeight="normal"
                                            icon={'caret-' + (sorting === 1 || sorting === 3 || sorting === 5 ? 'down' : 'up')}
                                            height={Constants.BOTTOM_BAR_HEIGHT}
                                            align="right"
                                            style={{ flex : '1 1 0' }}
                                            onTouchTap={() => this.props.presenter.handleNotesSortingClick()} />
                                    </div>
                                </SplitPane>
                            </SplitPane>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : muiTheme.palette.canvasColor }}>
                                {/* Note editor */}
                                <div style={{ flex : '1 1 0' }}>
                                    <TextEditor store={this.props.store.editorStore} />
                                </div>
                                {/* Note editor tools */}
                                <div style={{ width : '100%', height : Constants.BOTTOM_BAR_HEIGHT, display : 'flex', flexFlow : 'row' }}>
                                    {/* Star note */}
                                    <Button
                                        icon={'star' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? '' : '-o')}
                                        width={Constants.BOTTOM_BAR_HEIGHT}
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        onTouchTap={() => this.props.presenter.handleStarClick()} />
                                    {/* Archive note */}
                                    <Button
                                        icon={'trash' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? '' : '-o')}
                                        width={Constants.BOTTOM_BAR_HEIGHT}
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        onTouchTap={() => this.props.presenter.handleArchiveClick()} />
                                    <span style={{ marginRight : Constants.PADDING_X1 + 'px' }}></span>
                                    {/* Select category */}
                                    <Button
                                        label={this.props.store.editorStore.record ? this.props.store.editorStore.record.category ? this.props.store.editorStore.record.category : 'Uncategorized' : ''}
                                        labelWeight="normal"
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.editorStore.record)}
                                        onTouchTap={() => this.props.presenter.handleSelectCategoryClick()} />
                                    <div style={{ margin : 'auto', paddingLeft : Constants.PADDING_X0 + 'px', paddingRight : Constants.PADDING_X0 + 'px', flex : '1 1 0', textAlign : 'right' }}>
                                        {/* Overwrite status */}
                                        <Label>{this.props.store.editorStore.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                        <span style={{ marginRight : Constants.PADDING_X1 + 'px' }}></span>
                                        {/* Row/column position */}
                                        <Label>{this.props.store.editorStore.record && this.props.store.editorStore.cursorPosition ? (this.props.store.editorStore.cursorPosition.row + 1) + ' : ' + this.props.store.editorStore.cursorPosition.column : ''}</Label>
                                    </div>
                                </div>
                            </div>
                        </SplitPane>
                    </SplitPane>
                    {/* About dialog */}
                    <Dialog
                        open={this.props.store.aboutDialogStore.booleanValue}
                        actions={[
                            <Button
                                label="Close"
                                color="primary"
                                onTouchTap={() => this.props.store.aboutDialogStore.booleanValue = false} />
                        ]}
                        onRequestClose={() => this.props.store.aboutDialogStore.booleanValue = false}>
                        <div style={{ width : '100%', textAlign : 'center' }}>
                            <img src={Path.join(__dirname, './images/artisan.png')} /><br />
                            <Text
                                fontWeight={500}
                                textSize="large">
                                {app.getName()}
                            </Text>
                            <Text>{'Version ' + Package.version}</Text>
                            <Text
                                fontWeight={300}
                                textSize="small">
                                {'Copyright © ' + new Date().getFullYear()}
                            </Text>
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
                        title="Category"
                        open={this.props.store.selectCategoryDialogStore.booleanValue}
                        autoScrollBodyContent={true}
                        bodyStyle={{ padding : 0, overflowX : 'hidden' }}
                        actions={[
                            <Button
                                label="Cancel"
                                onTouchTap={() => this.props.store.selectCategoryDialogStore.booleanValue = false} />,
                            <Button
                                label="None"
                                color="secondary"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryNoneClick()} />,
                            <Button
                                label="OK"
                                color="primary"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryOkClick()} />
                        ]}
                        onRequestClose={() => this.props.store.selectCategoryDialogStore.booleanValue = false}>
                        <ListView
                            selectedIndex={this.props.store.selectCategoryDialogStore.list.selectedIndex}
                            onItemClick={index => this.props.presenter.handleSelectCategoryItemClick(index)}>
                            {this.props.store.selectCategoryDialogStore.list.items.map(item => {
                                return (
                                    <div
                                        key={item.itemId}
                                        style={{ width : '100%', paddingLeft : Constants.PADDING_X2, paddingRight : Constants.PADDING_X2, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, borderBottom : '1px solid ' + muiTheme.palette.borderColor }}>
                                        <Text>{item.primaryText}</Text>
                                    </div>
                                );
                            })}
                        </ListView>
                    </Dialog>
                    {/* Editor settings dialog */}
                    <EditorSettingsDialog
                        store={this.props.store.editorSettingsDialogStore}
                        settingsStore={this.props.store.settingsStore} />
                    {/* Syntax dialog for current note */}
                    <ListViewDialog
                        store={this.props.store.currentSyntaxDialogStore}
                        title="Syntax for current note"
                        onItemClick={index => {
                            this.props.store.currentSyntaxDialogStore.list.selectedIndex = index;

                            if (this.props.store.editorStore.record) {
                                this.props.presenter.changeCurrentSyntax(SyntaxCodes.items[index]);
                            }
                        }} />
                    {/* Syntax dialog for default notes */}
                    <ListViewDialog
                        store={this.props.store.defaultSyntaxDialogStore}
                        title="Syntax for default notes"
                        onItemClick={index => {
                            this.props.store.defaultSyntaxDialogStore.list.selectedIndex = index;

                            this.props.presenter.changeDefaultSyntax(SyntaxCodes.items[index]);
                        }} />
                    {/* Theme dialog */}
                    <ListViewDialog
                        store={this.props.store.themeDialogStore}
                        title="Theme"
                        onItemClick={index => {
                            this.props.store.themeDialogStore.list.selectedIndex = index;

                            this.props.presenter.changeTheme(ThemeCodes.items[index]);
                        }} />
                    {/* Font dialog */}
                    <ListViewDialog
                        store={this.props.store.fontDialogStore}
                        title="Font"
                        onItemClick={index => {
                            this.props.store.fontDialogStore.list.selectedIndex = index;

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
