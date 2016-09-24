'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { SearchField } from 'react-desktop/macOs';
import SplitPane from 'react-split-pane';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FilterList from './components/lists/FilterList';
import NoteList from './components/lists/NoteList';
import ImageButton from './components/buttons/ImageButton';
import ImageButtonBar from './components/buttons/ImageButtonBar';
import MenuTextButton from './components/buttons/MenuTextButton';
import NoteEditor from './components/editors/NoteEditor';
import AboutDialog from './components/dialogs/AboutDialog';
import SettingsDialog from './components/dialogs/SettingsDialog';
import DialogStore from './components/dialogs/DialogStore';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import Settings from './data/Settings';
import Theme from './Theme';
import Config from '../config/config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const theme = new Theme();

@observer
export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchNotesDisabled    : true,
            searchContentsDisabled : true,
            filterListWidth        : Config.filterListWidth,
            noteListWidth          : Config.noteListWidth
        };

        this._filterListWidth = Config.filterListWidth;
        this._noteListWidth   = Config.noteListWidth;

        this._presenter     = new AppPresenter(this.props.store);
        this._settings      = new Settings();
        this._subscriptions = [];

        this._aboutDialogStore = new DialogStore();
        this._aboutDialogStore.width  = 240;
        this._aboutDialogStore.height = 160;

        this._settingsDialogStore = new DialogStore();
        this._settingsDialogStore.width  = 480;
        this._settingsDialogStore.height = 320;

        this._handleFilterListClick = () => {
            this._presenter.refreshNoteList();
            this._presenter.enableNoteList();

            this.setState({
                searchNotesDisabled    : this._presenter.filterListPresenter.selectedItemCount === 0,
                searchContentsDisabled : true
            });
        };

        this._handleCategoryListClick = () => {
            this._presenter.refreshNoteList();

            this.setState({
                searchNotesDisabled    : this._presenter.filterListPresenter.selectedItemCount === 0,
                searchContentsDisabled : true
            });
        };

        this._handleNoteListClick = () => {
            this._presenter.refreshNoteEditor();

            this.setState({
                searchContentsDisabled : false
            });
        };

        this._handleAddNoteButtonClick = () => this._presenter.addNewNote();

        this._handleSortNoteButtonClick = index => this._presenter.sortNoteList(index);

        this._handleImageButtonBarTouchTap = (itemId, index) => this._presenter.handleImageButtonBarTouchTap(itemId, index);

        this._handleSearchNotes = value => {};

        this._handleSearchContents = value => {};

        this._handleFilterListWidthChange = size => {
            this._filterListWidth = size;

            this._settings.set('filterListWidth', this._filterListWidth).catch(error => console.error(error));
        };

        this._handleNoteListWidthChange = size => {
            this._noteListWidth = size;

            this._settings.set('noteListWidth', this._noteListWidth).catch(error => console.error(error));
        };

        this._loadSettings = () => {
            Promise.all([
                this._settings.get('filterListWidth', Config.filterListWidth),
                this._settings.get('noteListWidth', Config.noteListWidth)
            ]).then(values => {
                this._filterListWidth = values[0];
                this._noteListWidth   = values[1];

                this.setState({
                    filterListWidth : values[0],
                    noteListWidth   : values[1]
                });
            }).catch(error => console.error(error));
        };

        this._saveSettings = () => {
            this._settings.set('filterListWidth', this._filterListWidth).catch(error => console.error(error));
            this._settings.set('noteListWidth', this._noteListWidth).catch(error => console.error(error));
        };
    }

    componentDidMount() {
        this._loadSettings();

        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible',    (eventName, data) => this._aboutDialogStore.hidden    = !data.visible));
        this._subscriptions.push(PubSub.subscribe('SettingsDialog.visible', (eventName, data) => this._settingsDialogStore.hidden = !data.visible));
    }

    componentWillUnmount() {
        this._saveSettings();

        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <AboutDialog store={this._aboutDialogStore} />
                    <SettingsDialog store={this._settingsDialogStore} />
                    <SplitPane
                        split="vertical"
                        minSize={Config.filterListMinWidth}
                        defaultSize={this.state.filterListWidth}
                        onChange={this._handleFilterListWidthChange}>
                        {/* FilterList */}
                        <FilterList
                            store={this.props.store.filterListStore}
                            category={this.props.store.categoryListStore}
                            onItemClick={this._handleFilterListClick}
                            onCategoryClick={this._handleCategoryListClick} />
                        <SplitPane
                            split="vertical"
                            minSize={Config.noteListMinWidth}
                            defaultSize={this.state.noteListWidth}
                            onChange={this._handleNoteListWidthChange}>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.topBarHeight}
                                allowResize={false}>
                                {/* Search Notes */}
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row', pointerEvents : this.state.searchNotesDisabled ? 'none' : 'auto' }}>
                                    <div style={{ flex : '1 1 0' }}>
                                        <SearchField
                                            placeholder="Search notes"
                                            focusRing={false}
                                            margin={Config.paddingX1}
                                            onEnter={event => this._handleSearchNotes(event.target.value)} />
                                    </div>
                                </div>
                                <SplitPane
                                    split="horizontal"
                                    defaultSize={Config.bottomBarHeight}
                                    allowResize={false}
                                    primary="second">
                                    {/* NoteList */}
                                    <NoteList
                                        store={this.props.store.noteListStore}
                                        onItemClick={this._handleNoteListClick} />
                                    <div style={{ width : '100%', paddingLeft : Config.paddingX1, paddingRight : Config.paddingX1, display : 'flex', flexFlow : 'row' }}>
                                        <div style={{ flex : '1 1 0' }}>
                                            {/* Add a new note */}
                                            <ImageButton
                                                store={this._presenter.addNoteButtonStore}
                                                tooltipPosition="top"
                                                onClick={this._handleAddNoteButtonClick} />
                                        </div>
                                        <div style={{ height : Config.bottomBarHeight + 'px', lineHeight : Config.bottomBarHeight + 'px' }}>
                                            {/* Sort note list */}
                                            <MenuTextButton
                                                store={this._presenter.sortNoteButtonStore}
                                                menuPosition="top"
                                                onClick={this._handleSortNoteButtonClick} />
                                        </div>
                                    </div>
                                </SplitPane>
                            </SplitPane>
                            <SplitPane
                                split="horizontal"
                                defaultSize={Config.topBarHeight}
                                allowResize={false}>
                                <div style={{ width : '100%', display : 'flex', flexFlow : 'row', pointerEvents : this.state.searchContentsDisabled ? 'none' : 'auto' }}>
                                    <div style={{ flex : '1 1 0' }}>
                                        {/* Search keyword within a note */}
                                        <SearchField
                                            placeholder="Search contents"
                                            focusRing={false}
                                            margin={Config.paddingX1}
                                            onEnter={event => this._handleSearchContents(event.target.value)} />
                                    </div>
                                </div>
                                <SplitPane
                                    split="horizontal"
                                    defaultSize={Config.bottomBarHeight}
                                    allowResize={false}
                                    primary="second">
                                    {/* Note editor */}
                                    <NoteEditor store={this.props.store.noteEditorStore} />
                                    <div style={{ width : '100%', paddingLeft : Config.paddingX1, paddingRight : Config.paddingX1, display : 'flex', flexFlow : 'row' }}>
                                        <div style={{ flex : '1 1 0' }}>
                                            {/* Rich text styles toolbar */}
                                            <ImageButtonBar
                                                store={this.props.store.imageButtonBarStore}
                                                tooltipPosition="top"
                                                onTouchTap={this._handleImageButtonBarTouchTap} />
                                        </div>
                                    </div>
                                </SplitPane>
                            </SplitPane>
                        </SplitPane>
                    </SplitPane>
                </div>
            </MuiThemeProvider>
        );
    }
}

App.propTypes = {
    store : React.PropTypes.instanceOf(AppStore)
};

module.exports = App;
