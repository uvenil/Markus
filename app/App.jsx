'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import Button from './components/buttons/Button.jsx';
import Text from './components/text/Text.jsx';
import TextBox from './components/text/TextBox.jsx';
import SearchBox from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import Overlay from './components/overlays/Overlay.jsx';
import PopUpMenu from './components/overlays/PopUpMenu.jsx';
import Dialog from './components/overlays/Dialog.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import { observer } from 'mobx-react';
import Settings from './utils/Settings';
import PubSub from 'pubsub-js';
import Config from '../config.json';
import is from 'electron-is';

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
        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible', () => this.props.presenter.showAboutDialog()));
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
                            <i className="fa fa-fw fa-plus" />
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
                                        <i className="fa fa-fw fa-plus" />
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
                                <div>Note editor tools</div>
                            </SplitPane>
                        </SplitPane>
                    </SplitPane>
                </SplitPane>
                {/* Add category dialog */}
                <Dialog
                    store={this.props.store.addCategoryDialogStore}
                    width={200}
                    height={108}
                    onAfterOpen={() => this.refs.addCategoryName.focus()}
                    onBeforeClose={() => this.refs.addCategoryName.value = ''}>
                    <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
                        <Text>New category name:</Text>
                    </div>
                    <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                        <TextBox
                            ref="addCategoryName"
                            theme={this.props.theme}
                            className="TextBox full-width"
                            onEnter={value => this.props.presenter.addCategory(value)}
                            onEsc={() => this.props.store.addCategoryDialogStore.visible = false} />
                    </div>
                    <div style={{ width : '100%', textAlign : 'center', paddingTop : Config.paddingX1 + 'px', paddingBottom : Config.paddingX1 + 'px' }}>
                        <span style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px' }}>
                            <Button
                                width={Config.buttonWidth}
                                theme={this.props.theme}
                                backgroundColor="primary"
                                onClick={() => this.props.presenter.addCategory(this.refs.addCategoryName.value)}>OK</Button>
                        </span>
                        <span style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px' }}>
                            <Button
                                width={Config.buttonWidth}
                                theme={this.props.theme}
                                backgroundColor="default"
                                onClick={() => this.props.store.addCategoryDialogStore.visible = false}>Cancel</Button>
                        </span>
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
