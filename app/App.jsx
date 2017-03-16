// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
import Snackbar from 'material-ui/Snackbar';
import Subheader from 'material-ui/Subheader';
import SplitPane from 'react-split-pane';
import AppPresenter from './AppPresenter';
import AppStore from './AppStore';
import Button from './components/buttons/Button.jsx';
import TabbedButtonBar from './components/buttons/TabbedButtonBar.jsx';
import ChippedTextField from './components/text/ChippedTextField.jsx';
import Editor from './components/text/Editor.jsx';
import Label from './components/text/Label.jsx';
import SearchField from './components/text/SearchField.jsx';
import DetailList from './components/lists/DetailList.jsx';
import MasterList from './components/lists/MasterList.jsx';
import BooleanDialog from './components/dialogs/BooleanDialog.jsx';
import ListDialogStore from './components/dialogs/ListDialogStore';
import AppUtils from './utils/AppUtils';
import DialogUtils from './utils/DialogUtils.jsx';
import EnvironmentUtils from './utils/EnvironmentUtils';
import EventUtils from './utils/EventUtils';
import Constants from './Constants';
import ShortcutManager from 'react-shortcuts/lib/shortcut-manager';
import isNil from 'lodash.isnil';

const remote = require('electron').remote;

const renderDraggableRegion = () : any => {
    if (EnvironmentUtils.isMacOS()) {
        return (
            <div
                className="draggable-region"
                style={{
                    width    : '100%',
                    height   : Constants.TITLE_BAR_CONTROL_HEIGHT,
                    overflow : 'hidden'
                }}>
                &nbsp;
            </div>
        );
    }

    return undefined;
};

const renderDrawerItem = (primaryText : string, icon : string, color : string, store : AppStore, dialogStore : ListDialogStore) : any => {
    return (
        <ListItem
            primaryText={primaryText}
            leftIcon={
                <FontIcon
                    className={'fa fa-fw fa-' + icon}
                    style={{
                        top      : 0,
                        margin   : Constants.PADDING_X1,
                        fontSize : Constants.FONT_SIZE_HEADER,
                        color    : color
                    }} />
            }
            innerDivStyle={{
                paddingLeft   : 48,
                paddingRight  : Constants.PADDING_X1,
                paddingTop    : Constants.PADDING_X1,
                paddingBottom : Constants.PADDING_X1,
                fontSize      : Constants.FONT_SIZE_HEADER
            }}
            onTouchTap={() : void => {
                store.drawerOpened       = false;
                dialogStore.booleanValue = true;
            }} />
    );
};

const renderButton = (icon : string, size : number, onTouchTap : ?Function, disabled : ?boolean) : any => {
    return (
        <Button
            icon={icon}
            width={size}
            height={size}
            disabled={disabled}
            onTouchTap={onTouchTap} />
    );
};

@observer
export default class App extends React.Component {
    _events : any;

    constructor(props : Object) {
        super(props);

        this._events = [];
    }

    getChildContext() : Object {
        return { shortcuts : this.props.shortcuts };
    }

    componentDidMount() : void {
        this._events.push(EventUtils.register('app.error', (error : Object) : void => AppUtils.handleMessage(this.props.store, error)));
        this._events.push(EventUtils.register('app.list.master.show', (show : boolean) : void => this.props.presenter.showMasterList(show)));
        this._events.push(EventUtils.register('app.list.detail.show', (show : boolean) : void => this.props.presenter.showDetailList(show)));
        this._events.push(EventUtils.register('app.note.add', () : void => AppUtils.handleAddNote(this.props.store, this.props.presenter)));
        this._events.push(EventUtils.register('app.note.import', () : void => AppUtils.handleImportNotes(this.props.store, this.props.presenter._database)));
        this._events.push(EventUtils.register('app.note.export', () : void => AppUtils.handleExportNotes(this.props.store, this.props.presenter._database)));
        this._events.push(EventUtils.register('app.about.show', () => this.props.store.aboutDialog.booleanValue = true));
        this._events.push(EventUtils.register('editor.settings.change', (data : Object) => AppUtils.changeSettings(this.props.store, data)));
        this._events.push(EventUtils.register('dev.database.reset', () : void => this.props.presenter.resetDatabase()));
        this._events.push(EventUtils.register('dev.settings.reset', () : void => AppUtils.resetSettings()));

        this.props.presenter.initialize();
    }

    componentWillUnmount() : void {
        this._events.forEach(token => EventUtils.unregister(token));
    }

    render() : any {
        const muiTheme = this.props.store.theme === 'dark' ? Constants.MUI_DARK_THEME : Constants.MUI_LIGHT_THEME;

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={{ backgroundColor : muiTheme.palette.canvasColor }}>
                    {/* To display message */}
                    <Snackbar
                        open={this.props.store.messageShown}
                        message={this.props.store.message}
                        autoHideDuration={Constants.MESSAGE_DURATION}
                        onRequestClose={() => this.props.store.messageShown = false} />
                    {/* Confirmation dialog */}
                    <BooleanDialog store={this.props.store.booleanDialog} />
                    {/* Application menu drawer */}
                    <Drawer
                        docked={false}
                        width={Constants.DRAWER_WIDTH}
                        open={this.props.store.drawerOpened}
                        onRequestChange={(open : boolean) => this.props.store.drawerOpened = open}>
                        <List>
                            <div style={{ height : EnvironmentUtils.isMacOS() ? Constants.TITLE_BAR_CONTROL_HEIGHT : 0 }} />
                            <Subheader
                                style={{
                                    lineHeight : '32px',
                                    fontSize   : Constants.FONT_SIZE_SUB_HEADER,
                                    fontWeight : 'bolder'
                                }}>Settings</Subheader>
                            <Divider />
                            {renderDrawerItem('Theme', 'paint-brush', muiTheme.palette.textColor, this.props.store, this.props.store.themeDialog)}
                            <Divider />
                        </List>
                    </Drawer>
                    <SplitPane
                        split="vertical"
                        minSize={this.props.store.masterListShown ? Constants.MASTER_LIST_MIN_WIDTH : 0}
                        defaultSize={this.props.store.masterListShown ? this.props.store.masterListWidth : 0}
                        allowResize={this.props.store.masterListShown}
                        pane1Style={{ display : this.props.store.masterListShown ? 'block' : 'none' }}
                        style={{ backgroundColor : muiTheme.palette.canvasColor }}
                        onChange={(size : number) : void => AppUtils.handleMasterListWidthChange(this.props.store, size)}>
                        <MuiThemeProvider muiTheme={Constants.MUI_DARK_THEME}>
                            <div
                                style={{
                                    height          : '100vh',
                                    display         : 'flex',
                                    flexFlow        : 'column',
                                    backgroundColor : Constants.MUI_DARK_THEME.palette.primary2Color
                                }}>
                                {/* Draggable region for macOS */}
                                {renderDraggableRegion()}
                                {/* Application menu */}
                                <Button
                                    label="Menu"
                                    labelWeight="normal"
                                    icon="bars"
                                    width="100%"
                                    height={Constants.BUTTON_HEIGHT_X2}
                                    align="left"
                                    style={{
                                        paddingLeft  : Constants.PADDING_X0,
                                        paddingRight : Constants.PADDING_X0
                                    }}
                                    onTouchTap={() => this.props.store.drawerOpened = true} />
                                {/* Master list */}
                                <div
                                    style={{
                                        height   : 'calc(100vh - ' + (Constants.BUTTON_HEIGHT_X1 + Constants.BUTTON_HEIGHT_X2) + 'px)',
                                        display  : 'flex',
                                        flexFlow : 'column',
                                        flex     : '1 1 0',
                                        overflow : 'auto'
                                    }}>
                                    {/* Shortcut list */}
                                    <MasterList
                                        store={this.props.store.shortcutList}
                                        icon="tags"
                                        onItemClick={(index : number) => this.props.presenter.handleShortcutItemClick(index)}
                                        onItemRightClick={(index : number) => this.props.presenter.handleShortcutItemRightClick(index)} />
                                    {/* Hashtag list */}
                                    <div style={{ flex : '1 1 0' }}>
                                        <MasterList
                                            store={this.props.store.hashTagList}
                                            icon="hashtag"
                                            onItemClick={(index : number) => this.props.presenter.handleHashTagItemClick(index)}
                                            onItemRightClick={(index : number) => this.props.presenter.handleHashTagItemRightClick(index)} />
                                    </div>
                                </div>
                            </div>
                        </MuiThemeProvider>
                        <SplitPane
                            split="vertical"
                            minSize={this.props.store.detailListShown ? Constants.DETAIL_LIST_MIN_WIDTH : 0}
                            defaultSize={this.props.store.detailListShown ? this.props.store.detailListWidth : 0}
                            allowResize={this.props.store.detailListShown}
                            pane1Style={{ display : this.props.store.detailListShown ? 'block' : 'none' }}
                            style={{ backgroundColor : muiTheme.palette.canvasColor }}
                            onChange={(size : number) : void => AppUtils.handleDetailListWidthChange(this.props.store, size)}>
                            <div
                                style={{
                                    height          : '100vh',
                                    display         : 'flex',
                                    flexFlow        : 'column',
                                    backgroundColor : muiTheme.palette.canvasColor
                                }}>
                                {/* Search field for notes */}
                                <SearchField
                                    hintText="Search notes"
                                    disabled={!this.props.store.hasSourceSelected}
                                    className="SearchField"
                                    style={{
                                        width           : 'calc(100% - ' + Constants.PADDING_X2 + 'px)',
                                        display         : 'flex',
                                        flexFlow        : 'row',
                                        padding         : Constants.PADDING_X1,
                                        borderBottom    : '1px solid ' + muiTheme.palette.borderColor,
                                        backgroundColor : muiTheme.palette.primary2Color
                                    }}
                                    onChange={(keyword : ?string) => this.props.presenter.filterDetailList(keyword)} />
                                {/* Note list */}
                                <DetailList
                                    store={this.props.store.detailList}
                                    style={{ flex : '1 1 0' }}
                                    onItemClick={(index : number) => this.props.presenter.handleNoteItemClick(index)}
                                    onItemRightClick={(index : number) => AppUtils.handleNoteItemRightClick(this.props.store, this.props.presenter, this.props.presenter._database, index)} />
                                {/* Note list tools */}
                                <div
                                    style={{
                                        width           : '100%',
                                        display         : 'flex',
                                        flexFlow        : 'row',
                                        backgroundColor : muiTheme.palette.primary2Color
                                    }}>
                                    {/* Add note */}
                                    <Button
                                        label="New note"
                                        labelSize={Constants.FONT_SIZE}
                                        labelWeight="normal"
                                        icon="file-o"
                                        height={Constants.BUTTON_HEIGHT_X0}
                                        onTouchTap={() : void => AppUtils.handleAddNote(this.props.store, this.props.presenter)} />
                                    <span style={{ flex : '1 1 0' }} />
                                    {/* Sort note list */}
                                    <Button
                                        label={this.props.store.sorting === Constants.SORTINGS[0] || this.props.store.sorting === Constants.SORTINGS[1] ? 'Name' : this.props.store.sorting === Constants.SORTINGS[2] || this.props.store.sorting === Constants.SORTINGS[3] ? 'Updated' : 'Created'}
                                        labelPosition="before"
                                        labelWeight="normal"
                                        labelSize={Constants.FONT_SIZE}
                                        icon={'caret-' + (this.props.store.sorting === Constants.SORTINGS[1] || this.props.store.sorting === Constants.SORTINGS[3] || this.props.store.sorting === Constants.SORTINGS[5] ? 'down' : 'up')}
                                        height={Constants.BUTTON_HEIGHT_X0}
                                        align="right"
                                        onTouchTap={() : void => AppUtils.handleSortNotesClick(this.props.presenter)} />
                                </div>
                            </div>
                            <div
                                style={{
                                    height          : '100vh',
                                    display         : 'flex',
                                    flexFlow        : 'column',
                                    backgroundColor : muiTheme.palette.canvasColor
                                }}>
                                {/* Note editor tools */}
                                <div
                                    style={{
                                        width           : '100%',
                                        height          : Constants.TOP_BAR_HEIGHT,
                                        display         : 'flex',
                                        flexFlow        : 'row',
                                        backgroundColor : muiTheme.palette.primary2Color,
                                        overflow        : 'hidden'
                                    }}>
                                    {/* View options */}
                                    <TabbedButtonBar
                                        icons={[ 'code', 'columns', 'eye' ]}
                                        initialSelectedIndex={1}
                                        disabled={this.props.store.editor.record === undefined}
                                        onSelectedIndexChange={(index : number) => {
                                            if (!isNil(this.props.store.editor.record)) {
                                                this.props.store.editor.editorShown  = index === 0 || index === 1;
                                                this.props.store.editor.previewShown = index === 1 || index === 2;
                                            }
                                        }} />
                                    <span style={{ flex : '1 1 0' }} />
                                    {/* Export note */}
                                    {renderButton('share-square-o', Constants.TOP_BAR_HEIGHT, () : void => AppUtils.handleExportNote(this.props.store), isNil(this.props.store.editor.record))}
                                    {/* Change font */}
                                    {renderButton('font', Constants.TOP_BAR_HEIGHT, () => this.props.store.fontDialog.booleanValue = true, isNil(this.props.store.editor.record))}
                                    {/* Zoom-in */}
                                    {renderButton('search-plus', Constants.TOP_BAR_HEIGHT, () => remote.getCurrentWindow().webContents.getZoomFactor((zoomFactor : number) => remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor + Constants.ZOOM_FACTOR_STEP)))}
                                    {/* Zoom-out */}
                                    {renderButton('search-minus', Constants.TOP_BAR_HEIGHT, () => remote.getCurrentWindow().webContents.getZoomFactor((zoomFactor : number) => remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor - Constants.ZOOM_FACTOR_STEP)))}
                                    {/* Editor settings */}
                                    {renderButton('cog', Constants.TOP_BAR_HEIGHT, () => this.props.store.editorSettings.booleanValue = true, isNil(this.props.store.editor.record))}
                                </div>
                                {/* Editor */}
                                <Editor
                                    store={this.props.store.editor}
                                    style={{
                                        height : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT * (this.props.store.editor.record ? 3 : 1)) + 'px)',
                                        flex   : '1 1 0'
                                    }} />
                                <div
                                    style={{
                                        width           : '100%',
                                        height          : Constants.BOTTOM_BAR_HEIGHT * (this.props.store.editor.record ? 3 : 1),
                                        backgroundColor : muiTheme.palette.primary2Color
                                    }}>
                                    {/* Hashtags input field */}
                                    <div
                                        style={{
                                            width   : '100%',
                                            height  : Constants.BOTTOM_BAR_HEIGHT * 2,
                                            display : this.props.store.editor.record ? 'inherit' : 'none'
                                        }}>
                                        <ChippedTextField
                                            store={this.props.store.hashTags}
                                            hintText="#hashtag"
                                            chipBackground={muiTheme.palette.canvasColor}
                                            textBackground={muiTheme.palette.primary2Color}
                                            onChange={(hashTags : string[]) => this.props.presenter.handleHashTagsChanged(hashTags)} />
                                    </div>
                                    {/* Editor status */}
                                    <div
                                        style={{
                                            width    : '100%',
                                            height   : Constants.BOTTOM_BAR_HEIGHT,
                                            display  : 'flex',
                                            flexFlow : 'row'
                                        }}>
                                        {/* Star note */}
                                        {renderButton('star' + ((!isNil(this.props.store.editor.record) && this.props.store.editor.record.starred) ? '' : '-o'), Constants.BOTTOM_BAR_HEIGHT, () : void => this.props.presenter.handleStarNoteClick(), isNil(this.props.store.editor.record))}
                                        {/* Archive note */}
                                        {renderButton('trash' + ((!isNil(this.props.store.editor.record) && this.props.store.editor.record.archived) ? '' : '-o'), Constants.BOTTOM_BAR_HEIGHT, () : void => this.props.presenter.handleArchiveNoteClick(), isNil(this.props.store.editor.record))}
                                        <span style={{ marginRight : Constants.PADDING_X1 }} />
                                        <div
                                            style={{
                                                margin       : 'auto',
                                                paddingLeft  : Constants.PADDING_X1,
                                                paddingRight : Constants.PADDING_X1,
                                                flex         : '1 1 0',
                                                textAlign    : 'right'
                                            }}>
                                            {/* Overwrite status */}
                                            <Label>{this.props.store.editor.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                            <span style={{ marginRight : Constants.PADDING_X1 }} />
                                            {/* Row/column position */}
                                            <Label>{this.props.store.editor.record && this.props.store.editor.cursorPosition ? (this.props.store.editor.cursorPosition.row + 1) + ' : ' + this.props.store.editor.cursorPosition.column : ''}</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SplitPane>
                    </SplitPane>
                    {DialogUtils.renderThemeDialog(this.props.store)}
                    {DialogUtils.renderFontDialog(this.props.store)}
                    {DialogUtils.renderEditorSettingsDialog(this.props.store)}
                    {DialogUtils.renderAboutDialog(this.props.store)}
                </div>
            </MuiThemeProvider>
        );
    }
}

App.propTypes = {
    store     : React.PropTypes.instanceOf(AppStore).isRequired,
    presenter : React.PropTypes.instanceOf(AppPresenter).isRequired,
    shortcuts : React.PropTypes.instanceOf(ShortcutManager)
};

App.childContextTypes = {
    shortcuts : React.PropTypes.object
};
