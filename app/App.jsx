'use strict';

import React from 'react';
import SplitPane from 'react-split-pane';
import Button from './components/buttons/Button.jsx';
import Text from './components/text/Text.jsx';
import SearchBox from './components/text/SearchBox.jsx';
import TextEditor from './components/text/TextEditor.jsx';
import Overlay from './components/overlays/Overlay.jsx';
import PopUpMenu from './components/overlays/PopUpMenu.jsx';
import FilterListView from './components/lists/FilterListView.jsx';
import NoteListView from './components/lists/NoteListView.jsx';
import AppStore from './AppStore';
import AppPresenter from './AppPresenter';
import { observer } from 'mobx-react';
import Settings from './utils/Settings';
import PubSub from 'pubsub-js';
import Config from '../config.json';

@observer
export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filterListWidth : Config.filterListWidth,
            noteListWidth   : Config.noteListWidth
        };

        this._filterListWidth = Config.filterListWidth;
        this._noteListWidth   = Config.noteListWidth;

        this._subscriptions = [];
        this._settings      = new Settings();

        this._handleFilterListWidthChange = size => {
            this._filterListWidth = size;

            this._settings.set('filterListWidth', this._filterListWidth).catch(error => console.error(error));
        };

        this._handleNoteListWidthChange = size => {
            this._noteListWidth = size;

            this._settings.set('noteListWidth', this._noteListWidth).catch(error => console.error(error));
        };
    }

    componentDidMount() {
        this._subscriptions.push(PubSub.subscribe('Database.reset', () => this.props.presenter.resetDatabase()));
        this._subscriptions.push(PubSub.subscribe('AboutDialog.visible', () => this.props.presenter.showAboutDialog()));
        this._subscriptions.push(PubSub.subscribe('Syntax.change', (eventName, syntax) => this.props.presenter.changeSyntax(syntax)));
        this._subscriptions.push(PubSub.subscribe('Theme.change', (eventName, theme) => this.props.presenter.changeTheme(theme)));
        this._subscriptions.push(PubSub.subscribe('TextEditor.settings', (eventName, data) => this.props.presenter.changeSettings(data)));
    }

    componentWillUnmount() {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('./theme.dark.json') : require('./theme.light.json');

        return (
            <SplitPane
                split="vertical"
                minSize={Config.filterListMinWidth}
                defaultSize={this.state.filterListWidth}
                onChange={this._handleFilterListWidthChange}>
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
                                onItemClick={index => this.props.presenter.handleCategoryItemClick(index)} />
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
                    minSize={Config.noteListMinWidth}
                    defaultSize={this.state.noteListWidth}
                    onChange={this._handleNoteListWidthChange}>
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
        );
    }
}

App.propTypes = {
    store     : React.PropTypes.instanceOf(AppStore),
    presenter : React.PropTypes.instanceOf(AppPresenter)
};

module.exports = App;
