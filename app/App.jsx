'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
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
import PromptDialog from './components/dialogs/PromptDialog.jsx';
import EditorSettingsDialog from './components/dialogs/EditorSettingsDialog.jsx';
import ListViewDialog from './components/dialogs/ListViewDialog.jsx';
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
        const theme    = this.props.store.theme === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');
        const muiTheme = this.props.store.theme === 'dark' ? DARK_MUI_THEME : LIGHT_MUI_THEME;
        const sorting  = this.props.store.notesSorting;

        const renderListItem = (primaryText, secondaryText, icon, dialogStore) => {
            return (
                <ListItem
                    primaryText={primaryText}
                    secondaryText={secondaryText}
                    leftIcon={
                        <FontIcon
                            className={'fa fa-fw fa-' + icon}
                            style={{ top : 0, margin : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE }} />
                    }
                    innerDivStyle={{ paddingLeft : '48px', paddingRight : Constants.PADDING_X1, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE }}
                    onTouchTap={() => {
                        this.props.store.drawerOpened = false;
                        dialogStore.visible           = true;
                    }} />
            );
        };

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
                        minSize={this.props.store.showFilterList ? Config.filterListMinWidth : 0}
                        defaultSize={this.props.store.showFilterList ? this.props.store.filterListWidth : 0}
                        allowResize={this.props.store.showFilterList}
                        pane1Style={{ display : this.props.store.showFilterList ? 'block' : 'none' }}
                        style={{ backgroundColor : theme.primaryBackgroundColor }}
                        onChange={size => this._handleFilterListWidthChange(size)}>
                        <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : theme.secondaryBackgroundColor }}>
                            {/* Application menu */}
                            <Button
                                label="Menu"
                                icon="bars"
                                width="100%"
                                height={Constants.TOP_BAR_HEIGHT}
                                align="left"
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
                            <Button
                                label="Add category…"
                                icon="plus"
                                width="100%"
                                height={Constants.BOTTOM_BAR_HEIGHT}
                                align="left"
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
                                        <Button
                                            label="New note"
                                            icon="file-o"
                                            height={Constants.BOTTOM_BAR_HEIGHT}
                                            onTouchTap={() => this.props.presenter.handleAddNoteClick()} />
                                        {/* Sort note list */}
                                        <Button
                                            label={sorting === 0 || sorting === 1 ? 'Name' : sorting === 2 || sorting === 3 ? 'Updated' : 'Created'}
                                            labelPosition="before"
                                            icon={'caret-' + (sorting === 1 || sorting === 3 || sorting === 5 ? 'down' : 'up')}
                                            height={Constants.BOTTOM_BAR_HEIGHT}
                                            align="right"
                                            style={{ flex : '1 1 0' }}
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
                                    <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                    {/* Select category */}
                                    <Button
                                        label={this.props.store.editorStore.record ? this.props.store.editorStore.record.category ? this.props.store.editorStore.record.category : 'Uncategorized' : ''}
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.editorStore.record)}
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
                        open={this.props.store.aboutDialogStore.visible}
                        actions={[
                            <Button
                                label="Close"
                                color="primary"
                                onTouchTap={() => this.props.store.aboutDialogStore.visible = false} />
                        ]}
                        onRequestClose={() => this.props.store.aboutDialogStore.visible = false}>
                        <div style={{ width : '100%', textAlign : 'center' }}>
                            <img src={Path.join(__dirname, './images/artisan.png')} /><br />
                            <Text
                                fontWeight={500}
                                textSize="large"
                                theme={this.props.store.theme}>
                                {Package.productName}
                            </Text>
                            <Text theme={this.props.store.theme}>{'Version ' + Package.version}</Text>
                            <Text
                                fontWeight={300}
                                textSize="small"
                                theme={this.props.store.theme}>
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
                        open={this.props.store.selectCategoryDialogStore.visible}
                        autoScrollBodyContent={true}
                        bodyStyle={{ padding : 0, overflowX : 'hidden' }}
                        actions={[
                            <Button
                                label="Cancel"
                                onTouchTap={() => this.props.store.selectCategoryDialogStore.visible = false} />,
                            <Button
                                label="None"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryNoneClick()} />,
                            <Button
                                label="OK"
                                color="primary"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryOkClick()} />
                        ]}
                        onRequestClose={() => this.props.store.selectCategoryDialogStore.visible = false}>
                        <div style={{ height : '248px', display : 'flex', flexFlow : 'column', overflowY : 'auto', overflowX : 'hidden', backgroundColor : theme.primaryBackgroundColor }}>
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
                                                style={{ width : '100%', padding : Constants.PADDING_X1, borderBottom : '1px solid ' + theme.borderColor }}>
                                                <Text theme={this.props.store.theme}>{item.primaryText}</Text>
                                            </div>
                                        );
                                    })}
                                </ListView>
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
