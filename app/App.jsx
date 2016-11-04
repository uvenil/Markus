'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Button from './components/buttons/Button.jsx';
import Label from './components/text/Label.jsx';
import Text from './components/text/Text.jsx';
import SearchField from './components/text/SearchField.jsx';
import NoteEditor from './components/text/NoteEditor.jsx';
import SourceList from './components/lists/SourceList.jsx';
import NoteList from './components/lists/NoteList.jsx';
import BooleanDialog from './components/dialogs/BooleanDialog.jsx';
import PromptDialog from './components/dialogs/PromptDialog.jsx';
import EditorSettingsDialog from './components/dialogs/EditorSettingsDialog.jsx';
import ListDialog from './components/dialogs/ListDialog.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import Settings from './utils/Settings';
import EventUtils from './utils/EventUtils';
import Constants from './utils/Constants';
import SyntaxNames from './definitions/syntax-names.json';
import SyntaxCodes from './definitions/syntax-codes.json';
import ThemeCodes from './definitions/theme-codes.json';
import Path from 'path';
import is from 'electron-is';
import _ from 'lodash';

const { app } = require('electron').remote;

const FONTS = is.macOS() ? require('./definitions/fonts.mac.json') : require('./definitions/fonts.win.json');

const LIGHT_THEME = require('./definitions/theme.light.json');
const DARK_THEME  = require('./definitions/theme.dark.json');

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

        this._events   = [];
        this._settings = new Settings();

        this._handleError = message => {
            this.props.store.snackbarMessage = message;
            this.props.store.snackbarOpened  = true;
        };

        this._handleFilterListWidthChange = size => {
            this.props.store.filterListWidth = size;

            this._settings.set('filterListWidth', this.props.store.filterListWidth).catch(error => EventUtils.broadcast('global.error', error));
        };

        this._handleNoteListWidthChange = size => {
            this.props.store.noteListWidth = size;

            this._settings.set('noteListWidth', this.props.store.noteListWidth).catch(error => EventUtils.broadcast('global.error', error));
        };

        this._handleNewNote = () => {
            if (this.props.store.addNoteEnabled) {
                this.props.presenter.handleAddNoteClick();
            }
        };
    }

    componentDidMount() {
        this._events.push(EventUtils.register('global.error', message => this._handleError(message)));
        this._events.push(EventUtils.register('dev.database.reset', () => this.props.presenter.resetDatabase()));
        this._events.push(EventUtils.register('dev.settings.reset', () => this.props.presenter.resetSettings()));
        this._events.push(EventUtils.register('ui.filterList.visibility', show => this.props.presenter.showFilterList(show)));
        this._events.push(EventUtils.register('ui.categoryList.visibility', show => this.props.presenter.showNoteList(show)));
        this._events.push(EventUtils.register('ui.theme.change', theme => this.props.presenter.changeTheme(theme)));
        this._events.push(EventUtils.register('app.aboutDialog.visibility', () => this.props.store.aboutDialog.booleanValue = true));
        this._events.push(EventUtils.register('app.note.new', () => this._handleNewNote()));
        this._events.push(EventUtils.register('app.note.import', () => this.props.presenter.handleImportNotes()));
        this._events.push(EventUtils.register('app.note.export', () => this.props.presenter.handleExportNotes()));
        this._events.push(EventUtils.register('NoteEditor.syntax.change', syntax => this.props.presenter.changeCurrentSyntax(syntax)));
        this._events.push(EventUtils.register('NoteEditor.settings.change', data => this.props.presenter.changeSettings(data)));

        this.props.presenter.init();
    }

    componentWillUnmount() {
        this._events.forEach(subscription => EventUtils.unregister(subscription));
    }

    render() {
        const sorting  = this.props.store.notesSorting;
        const muiTheme = this.props.store.theme === 'dark' ? MUI_DARK_THEME : MUI_LIGHT_THEME;

        const renderListItem = (primaryText, icon, dialogStore) => {
            return (
                <ListItem
                    primaryText={primaryText}
                    leftIcon={
                        <FontIcon
                            className={'fa fa-fw fa-' + icon}
                            style={{ top : 0, margin : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE, color : muiTheme.palette.textColor }} />
                    }
                    innerDivStyle={{ paddingLeft : 48, paddingRight : Constants.PADDING_X1, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, fontSize : Constants.HEADING_FONT_SIZE }}
                    onTouchTap={() => {
                        this.props.store.drawerOpened = false;
                        dialogStore.booleanValue      = true;
                    }} />
            );
        };

        const renderDraggableRegion = () => {
            if (is.macOS()) {
                return (
                    <div
                        className="draggable-region"
                        style={{ width : '100%', height : Constants.TITLE_BAR_CONTROL_HEIGHT, overflow : 'hidden' }}>&nbsp;</div>
                );
            }

            return undefined;
        };

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={{ backgroundColor : muiTheme.palette.canvasColor }}>
                    {/* Error or information message */}
                    <Snackbar
                        open={this.props.store.snackbarOpened}
                        message={this.props.store.snackbarMessage}
                        autoHideDuration={Constants.SNACKBAR_DURATION}
                        onRequestClose={() => this.props.store.snackbarOpened = false} />
                    {/* Confirmation dialog */}
                    <BooleanDialog store={this.props.store.booleanDialog} />
                    {/* Drawer */}
                    <Drawer
                        docked={false}
                        width={Constants.DRAWER_WIDTH}
                        open={this.props.store.drawerOpened}
                        onRequestChange={open => this.props.store.drawerOpened = open}>
                        <List>
                            <div style={{ height : Constants.TITLE_BAR_CONTROL_HEIGHT }} />
                            <Subheader style={{ lineHeight : '32px', fontSize : Constants.SUB_HEADING_FONT_SIZE, fontWeight : 'bolder' }}>Settings</Subheader>
                            <Divider />
                            {renderListItem('Note Editor', 'pencil-square-o', this.props.store.editorSettingsDialog)}
                            <Divider />
                            {renderListItem('Default Syntax', 'code', this.props.store.defaultSyntaxDialog)}
                            <Divider />
                            {renderListItem('App Theme', 'eye', this.props.store.themeDialog)}
                            <Divider />
                            {renderListItem('Note Font', 'font', this.props.store.fontDialog)}
                            <Divider />
                        </List>
                    </Drawer>
                    <SplitPane
                        split="vertical"
                        minSize={this.props.store.filterListShown ? Constants.SOURCE_LIST_MIN_WIDTH : 0}
                        defaultSize={this.props.store.filterListShown ? this.props.store.filterListWidth : 0}
                        allowResize={this.props.store.filterListShown}
                        pane1Style={{ display : this.props.store.filterListShown ? 'block' : 'none' }}
                        style={{ backgroundColor : muiTheme.palette.canvasColor }}
                        onChange={size => this._handleFilterListWidthChange(size)}>
                        <MuiThemeProvider muiTheme={MUI_DARK_THEME}>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : MUI_DARK_THEME.palette.primary2Color }}>
                                {/* Draggable region for macOS */}
                                {renderDraggableRegion()}
                                {/* Application menu */}
                                <Button
                                    label="Menu"
                                    icon="bars"
                                    width="100%"
                                    height={Constants.BUTTON_HEIGHT_X2}
                                    align="left"
                                    style={{ paddingLeft : Constants.PADDING_X0, paddingRight : Constants.PADDING_X0 }}
                                    onTouchTap={() => this.props.store.drawerOpened = true} />
                                {/* Filter list */}
                                <div style={{ height : 'calc(100vh - ' + (Constants.BUTTON_HEIGHT_X1 + Constants.BUTTON_HEIGHT_X2) + 'px)', display : 'flex', flexFlow : 'column', flex : '1 1 0', overflow : 'auto' }}>
                                    <SourceList
                                        store={this.props.store.filterList}
                                        onItemClick={index => this.props.presenter.handleFilterItemClick(index)}
                                        onItemRightClick={index => this.props.presenter.handleFilterItemRightClick(index)} />
                                    <div style={{ flex : '1 1 0' }}>
                                        <SourceList
                                            store={this.props.store.categoryList}
                                            onItemClick={index => this.props.presenter.handleCategoryItemClick(index)}
                                            onItemRightClick={index => this.props.presenter.handleCategoryItemRightClick(index)} />
                                    </div>
                                </div>
                                {/* Add category button */}
                                <Button
                                    label="Add category…"
                                    labelWeight="normal"
                                    labelSize={Constants.DEFAULT_FONT_SIZE}
                                    icon="plus"
                                    width="100%"
                                    height={Constants.BUTTON_HEIGHT_X1}
                                    align="left"
                                    style={{ paddingLeft : Constants.PADDING_X0, paddingRight : Constants.PADDING_X0 }}
                                    onTouchTap={() => this.props.presenter.handleAddCategoryClick()} />
                            </div>
                        </MuiThemeProvider>
                        <SplitPane
                            split="vertical"
                            minSize={this.props.store.noteListShown ? Constants.NOTE_LIST_MIN_WIDTH : 0}
                            defaultSize={this.props.store.noteListShown ? this.props.store.noteListWidth : 0}
                            allowResize={this.props.store.noteListShown}
                            pane1Style={{ display : this.props.store.noteListShown ? 'block' : 'none' }}
                            style={{ backgroundColor : muiTheme.palette.canvasColor }}
                            onChange={size => this._handleNoteListWidthChange(size)}>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : muiTheme.palette.canvasColor }}>
                                {/* Search notes */}
                                <SearchField
                                    hintText="Search notes"
                                    disabled={!this.props.store.hasSourceSelected}
                                    className="SearchField"
                                    style={{ width : 'calc(100% - ' + Constants.PADDING_X2 + 'px)', display : 'flex', flexFlow : 'row', padding : Constants.PADDING_X1, borderBottom : '1px solid ' + muiTheme.palette.borderColor, backgroundColor : muiTheme.palette.primary2Color }}
                                    onChange={value => this.props.presenter.filterNoteList(value)} />
                                {/* Note list */}
                                <NoteList
                                    store={this.props.store.noteList}
                                    style={{ flex : '1 1 0' }}
                                    onItemClick={index => this.props.presenter.handleNoteItemClick(index)}
                                    onItemRightClick={index => this.props.presenter.handleNoteItemRightClick(index)} />
                                {/* Note list tools */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row', backgroundColor : muiTheme.palette.primary2Color }}>
                                    {/* Add note */}
                                    <Button
                                        label="New note"
                                        labelWeight="normal"
                                        labelSize={Constants.DEFAULT_FONT_SIZE}
                                        icon="file-o"
                                        height={Constants.BUTTON_HEIGHT_X0}
                                        onTouchTap={() => this.props.presenter.handleAddNoteClick()} />
                                    <span style={{ flex : '1 1 0' }} />
                                    {/* Sort note list */}
                                    <Button
                                        label={sorting === 0 || sorting === 1 ? 'Name' : sorting === 2 || sorting === 3 ? 'Updated' : 'Created'}
                                        labelPosition="before"
                                        labelWeight="normal"
                                        labelSize={Constants.DEFAULT_FONT_SIZE}
                                        icon={'caret-' + (sorting === 1 || sorting === 3 || sorting === 5 ? 'down' : 'up')}
                                        height={Constants.BUTTON_HEIGHT_X0}
                                        align="right"
                                        onTouchTap={() => this.props.presenter.handleNotesSortingClick()} />
                                </div>
                            </div>
                            <div style={{ height : '100vh', display : 'flex', flexFlow : 'column', backgroundColor : muiTheme.palette.canvasColor }}>
                                {/* Note editor tools */}
                                <div style={{ width : '100%', height : Constants.TOP_BAR_HEIGHT, display : 'flex', flexFlow : 'row', backgroundColor : muiTheme.palette.primary2Color, overflow : 'hidden' }}>
                                    <Button
                                        label={SyntaxNames.items[_.indexOf(SyntaxCodes.items, this.props.store.noteEditor.syntax)]}
                                        labelSize={Constants.DEFAULT_FONT_SIZE}
                                        icon="code"
                                        height={Constants.TOP_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.noteEditor.record)}
                                        onTouchTap={() => {
                                            this.props.store.currentSyntaxDialog.list.selectedIndex = _.indexOf(SyntaxCodes.items, this.props.store.noteEditor.syntax);
                                            this.props.store.currentSyntaxDialog.booleanValue       = true;
                                        }} />
                                </div>
                                {/* Note editor */}
                                <NoteEditor
                                    store={this.props.store.noteEditor}
                                    style={{ height : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT) + 'px)', flex : '1 1 0' }} />
                                {/* Note editor status */}
                                <div style={{ width : '100%', height : Constants.BOTTOM_BAR_HEIGHT, display : 'flex', flexFlow : 'row', backgroundColor : muiTheme.palette.primary2Color }}>
                                    {/* Star note */}
                                    <Button
                                        icon={'star' + ((!_.isNil(this.props.store.noteEditor.record) && this.props.store.noteEditor.record.starred) ? '' : '-o')}
                                        width={Constants.BOTTOM_BAR_HEIGHT}
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.noteEditor.record)}
                                        onTouchTap={() => this.props.presenter.handleStarClick()} />
                                    {/* Archive note */}
                                    <Button
                                        icon={'trash' + ((!_.isNil(this.props.store.noteEditor.record) && this.props.store.noteEditor.record.archived) ? '' : '-o')}
                                        width={Constants.BOTTOM_BAR_HEIGHT}
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.noteEditor.record)}
                                        onTouchTap={() => this.props.presenter.handleArchiveClick()} />
                                    <span style={{ marginRight : Constants.PADDING_X1 }}></span>
                                    {/* Select category */}
                                    <Button
                                        label={this.props.store.noteEditor.record ? this.props.store.noteEditor.record.category ? this.props.store.noteEditor.record.category : 'Uncategorized' : ''}
                                        labelWeight="normal"
                                        labelSize={Constants.DEFAULT_FONT_SIZE}
                                        icon="tag"
                                        height={Constants.BOTTOM_BAR_HEIGHT}
                                        disabled={_.isNil(this.props.store.noteEditor.record)}
                                        onTouchTap={() => this.props.presenter.handleSelectCategoryClick()} />
                                    <div style={{ margin : 'auto', paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, flex : '1 1 0', textAlign : 'right' }}>
                                        {/* Overwrite status */}
                                        <Label>{this.props.store.noteEditor.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                        <span style={{ marginRight : Constants.PADDING_X1 }}></span>
                                        {/* Row/column position */}
                                        <Label>{this.props.store.noteEditor.record && this.props.store.noteEditor.cursorPosition ? (this.props.store.noteEditor.cursorPosition.row + 1) + ' : ' + this.props.store.noteEditor.cursorPosition.column : ''}</Label>
                                    </div>
                                </div>
                            </div>
                        </SplitPane>
                    </SplitPane>
                    {/* About dialog */}
                    <Dialog
                        open={this.props.store.aboutDialog.booleanValue}
                        actions={[
                            <Button
                                label="Close"
                                color="primary"
                                onTouchTap={() => this.props.store.aboutDialog.booleanValue = false} />
                        ]}
                        onRequestClose={() => this.props.store.aboutDialog.booleanValue = false}>
                        <div style={{ width : '100%', textAlign : 'center' }}>
                            <img src={Path.join(__dirname, './images/artisan.png')} /><br />
                            <Text
                                fontWeight={500}
                                textSize="large">
                                {app.getName()}
                            </Text>
                            <Text>{'Version ' + app.getVersion()}</Text>
                            <Text
                                fontWeight={300}
                                textSize="small">
                                {'Copyright © ' + new Date().getFullYear()}
                            </Text>
                        </div>
                    </Dialog>
                    {/* Add category dialog */}
                    <PromptDialog
                        store={this.props.store.addCategoryDialog}
                        title="Add category"
                        label="New category name"
                        onEnter={value => this.props.presenter.addCategory(value)} />
                    {/* Rename category dialog */}
                    <PromptDialog
                        store={this.props.store.updateCategoryDialog}
                        title="Rename category"
                        label="Update category name"
                        onEnter={value => this.props.presenter.updateCategory(this.props.store.updateCategoryDialog.value, value)} />
                    {/* Select category dialog */}
                    <ListDialog
                        store={this.props.store.selectCategoryDialog}
                        title="Category"
                        neutralAction={
                            <Button
                                label="None"
                                color="secondary"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryNoneClick()} />
                        }
                        positiveAction={
                            <Button
                                label="OK"
                                color="primary"
                                onTouchTap={() => this.props.presenter.handleSelectCategoryOkClick()} />
                        }
                        onItemClick={index => {
                            this.props.store.selectCategoryDialog.list.selectedIndex = index;

                            this.props.presenter.handleSelectCategoryItemClick(index);
                        }} />
                    {/* Editor settings dialog */}
                    <EditorSettingsDialog store={this.props.store.editorSettingsDialog} />
                    {/* Syntax dialog for current note */}
                    <ListDialog
                        store={this.props.store.currentSyntaxDialog}
                        title="Syntax for current note"
                        onItemClick={index => {
                            this.props.store.currentSyntaxDialog.list.selectedIndex = index;

                            if (this.props.store.noteEditor.record) {
                                this.props.presenter.changeCurrentSyntax(SyntaxCodes.items[index]);
                            }
                        }} />
                    {/* Syntax dialog for default notes */}
                    <ListDialog
                        store={this.props.store.defaultSyntaxDialog}
                        title="Syntax for default notes"
                        onItemClick={index => {
                            this.props.store.defaultSyntaxDialog.list.selectedIndex = index;

                            this.props.presenter.changeDefaultSyntax(SyntaxCodes.items[index]);
                        }} />
                    {/* Theme dialog */}
                    <ListDialog
                        store={this.props.store.themeDialog}
                        title="Theme"
                        onItemClick={index => {
                            this.props.store.themeDialog.list.selectedIndex = index;

                            this.props.presenter.changeTheme(ThemeCodes.items[index]);
                        }} />
                    {/* Font dialog */}
                    <ListDialog
                        store={this.props.store.fontDialog}
                        title="Font"
                        onItemClick={index => {
                            this.props.store.fontDialog.list.selectedIndex = index;

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
