'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import Button from './components/buttons/Button.jsx';
import Label from './components/text/Label.jsx';
import Text from './components/text/Text.jsx';
import SearchBox from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import Overlay from './components/overlays/Overlay.jsx';
import PopUpMenu from './components/overlays/PopUpMenu.jsx';
import Dialog from './components/overlays/Dialog.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import PromptDialog from './components/overlays/PromptDialog.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import { observer } from 'mobx-react';
import Settings from './utils/Settings';
import Path from 'path';
import PubSub from 'pubsub-js';
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
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe('Event.error', (eventName, message) => this._handleError(message)));
        this._subscriptions.push(PubSub.subscribe('Database.reset', () => this.props.presenter.resetDatabase()));
        this._subscriptions.push(PubSub.subscribe('Settings.reset', () => this.props.presenter.resetSettings()));
        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible', () => this.props.store.aboutDialogStore.visible = true));
        this._subscriptions.push(PubSub.subscribe('View.showFilterList', (eventName, show) => this.props.presenter.showFilterList(show)));
        this._subscriptions.push(PubSub.subscribe('View.showNoteList', (eventName, show) => this.props.presenter.showNoteList(show)));
        this._subscriptions.push(PubSub.subscribe('Syntax.change', (eventName, syntax) => this.props.presenter.changeSyntax(syntax)));
        this._subscriptions.push(PubSub.subscribe('Theme.change', (eventName, theme) => this.props.presenter.changeTheme(theme)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.settings', (eventName, data) => this.props.presenter.changeSettings(data)));

        this.props.presenter.init();
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');

        return (
            <div>
                <SplitPane
                    split="vertical"
                    minSize={this.props.store.showFilterList ? Config.filterListMinWidth : 0}
                    defaultSize={this.props.store.showFilterList ? this.props.store.filterListWidth : 0}
                    allowResize={this.props.store.showFilterList}
                    pane1Style={{ display : this.props.store.showFilterList ? 'block' : 'none' }}
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
                                onItemClick={index => this.props.presenter.handleFilterItemClick(index)} />
                            <div style={{ flex : '1 1 0' }}>
                                <FilterListView
                                    store={this.props.store.categoriesStore}
                                    backgroundColor={theme.secondaryBackgroundColor}
                                    onItemClick={index => this.props.presenter.handleCategoryItemClick(index)}
                                    onItemRightClick={index => this.props.presenter.handleCategoryItemRightClick(index)} />
                            </div>
                        </div>
                        {/* Add category button */}
                        <Button
                            backgroundColor="none"
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
                        onChange={size => this._handleNoteListWidthChange(size)}>
                        <SplitPane
                            split="horizontal"
                            defaultSize={Config.topBarHeight}
                            allowResize={false}>
                            {/* Search notes */}
                            <div style={{ width : '100%', display : 'flex', flexFlow : 'row', padding : Config.paddingX0, paddingRight : Config.paddingX1 }}>
                                <SearchBox
                                    hintText="Search notes" />
                            </div>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.bottomBarHeight}
                                allowResize={false}
                                primary="second">
                                {/* Note list */}
                                <NoteListView
                                    store={this.props.store.notesStore}
                                    onItemClick={index => this.props.presenter.handleNoteItemClick(index)} />
                                {/* Note list tools */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                    <Button
                                        backgroundColor="none"
                                        disabled={!this.props.store.addNoteEnabled}
                                        onClick={() => this.props.presenter.handleAddNoteClick()}>
                                        <i
                                            className="fa fa-fw fa-plus"
                                            title="Add note" />
                                    </Button>
                                    <div style={{ flex : '1 1 0', textAlign : 'right' }}>
                                        <Overlay
                                            trigger="click"
                                            hAnchor="right"
                                            vAnchor="bottom"
                                            popUp={
                                                <PopUpMenu>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Name <i className="fa fa-fw fa-caret-down" /></div></Text>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Name <i className="fa fa-fw fa-caret-up" /></div></Text>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Last updated <i className="fa fa-fw fa-caret-down" /></div></Text>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Last updated <i className="fa fa-fw fa-caret-up" /></div></Text>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Created <i className="fa fa-fw fa-caret-down" /></div></Text>
                                                    <Text><div style={{ padding : Config.paddingX0 }}>Created <i className="fa fa-fw fa-caret-up" /></div></Text>
                                                </PopUpMenu>
                                            }>
                                            <Button
                                                backgroundColor="none">
                                                Last updated <i className="fa fa-fw fa-caret-down" />
                                            </Button>
                                        </Overlay>
                                    </div>
                                </div>
                            </SplitPane>
                        </SplitPane>
                        <SplitPane
                            split="horizontal"
                            defaultSize={Config.topBarHeight}
                            allowResize={false}>
                            {/* Search note contents */}
                            <div style={{ width : '100%', display : 'flex', flexFlow : 'row', padding : Config.paddingX0, paddingRight : Config.paddingX1 }}>
                                <SearchBox
                                    hintText="Search contents" />
                            </div>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.bottomBarHeight}
                                allowResize={false}
                                primary="second">
                                {/* Note editor */}
                                <TextEditor
                                    store={this.props.store.editorStore} />
                                {/* Note editor tools */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                    <div>
                                        {/* Star note */}
                                        <Button
                                            backgroundColor="none"
                                            disabled={_.isNil(this.props.store.editorStore.record)}
                                            onClick={() => this.props.presenter.handleStarClick()}>
                                            <i
                                                className={'fa fa-fw fa-star' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? '' : '-o')}
                                                title={(!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.starred) ? 'Un-star this note' : 'Star this note'} />
                                        </Button>
                                        {/* Archive note */}
                                        <Button
                                            backgroundColor="none"
                                            disabled={_.isNil(this.props.store.editorStore.record)}
                                            onClick={() => this.props.presenter.handleArchiveClick()}>
                                            <i
                                                className={'fa fa-fw fa-trash' + ((!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? '' : '-o')}
                                                title={(!_.isNil(this.props.store.editorStore.record) && this.props.store.editorStore.record.archived) ? 'Un-archive this note' : 'Archive this note'} />
                                        </Button>
                                    </div>
                                    <div style={{ margin : 'auto', paddingLeft : Config.paddingX0 + 'px', paddingRight : Config.paddingX0 + 'px', flex : '1 1 0', textAlign : 'right' }}>
                                        <Label>{this.props.store.editorStore.isOverwriteEnabled ? 'OVR' : ''}</Label>
                                        <span style={{ marginRight : Config.paddingX1 + 'px' }}></span>
                                        <Label>{this.props.store.editorStore.cursorPosition ? this.props.store.editorStore.cursorPosition.row + ' : ' + this.props.store.editorStore.cursorPosition.column : ''}</Label>
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
                    height={260}>
                    <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX1, paddingBottom : Config.paddingX2, backgroundColor : (theme ? theme.dialogBackgroundColor : undefined) }}>
                        <img src={Path.join(__dirname, './images/artisan.png')} /><br />
                        <Text textSize="large">{Package.productName}</Text>
                        <Text>{'Version ' + Package.version}</Text>
                        <Text textSize="small">{'Copyright © ' + new Date().getFullYear()}</Text>
                        <div style={{ paddingLeft : Config.paddingX2, paddingRight : Config.paddingX2, paddingTop : Config.paddingX2, paddingBottom : Config.paddingX1 }}>
                            <Button
                                width={Config.buttonWidth}
                                backgroundColor="primary"
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
                    height={108}
                    label="New category name:"
                    onEnter={value => this.props.presenter.addCategory(value)} />
                {/* Rename category dialog */}
                <PromptDialog
                    store={this.props.store.updateCategoryDialogStore}
                    width={200}
                    height={108}
                    label="Rename category:"
                    onEnter={value => this.props.presenter.updateCategory(this.props.store.updateCategoryDialogStore.value, value)} />
            </div>
        );
    }
}

App.propTypes = {
    store     : React.PropTypes.instanceOf(AppStore),
    presenter : React.PropTypes.instanceOf(AppPresenter)
};

module.exports = App;
