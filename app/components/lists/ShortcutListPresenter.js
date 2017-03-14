// @flow
'use strict';

import MasterListPresenter from './MasterListPresenter';
import ListItemStore from './ListItemStore.jsx';
import ListStore from './ListStore';
import Database from '../../data/Database';
import EventUtils from '../../utils/EventUtils';

const INDEX_EVERYTHING : number = 0;
const INDEX_STARRED    : number = 1;
const INDEX_ARCHIVED   : number = 2;

const createStore = () : ListStore => {
    const store = new ListStore();

    store.headerText = 'Notes';

    const everythingStore = new ListItemStore();
    everythingStore.itemId        = ShortcutListPresenter.ID_EVERYTHING;
    everythingStore.icon          = 'tags';
    everythingStore.primaryText   = 'Everything';
    everythingStore.secondaryText = '0';
    store.items.push(everythingStore);

    const starredStore = new ListItemStore();
    starredStore.itemId        = ShortcutListPresenter.ID_STARRED;
    starredStore.icon          = 'star';
    starredStore.primaryText   = 'Starred';
    starredStore.secondaryText = '0';
    store.items.push(starredStore);

    const archivedStore = new ListItemStore();
    archivedStore.itemId        = ShortcutListPresenter.ID_ARCHIVED;
    archivedStore.icon          = 'trash';
    archivedStore.primaryText   = 'Archived';
    archivedStore.secondaryText = '0';
    store.items.push(archivedStore);

    return store;
};

export default class ShortcutListPresenter extends MasterListPresenter {
    static ID_EVERYTHING : string;
    static ID_STARRED    : string;
    static ID_ARCHIVED   : string;

    constructor(database : Database) {
        super(database, createStore());
    }

    refresh() : void {
        this._database.countAll().then(count => this._store.items[INDEX_EVERYTHING].secondaryText = (count).toString()).catch(error => EventUtils.broadcast('app.error', error));
        this._database.countStarred().then(count => this._store.items[INDEX_STARRED].secondaryText = (count).toString()).catch(error => EventUtils.broadcast('app.error', error));
        this._database.countArchived().then(count => this._store.items[INDEX_ARCHIVED].secondaryText = (count).toString()).catch(error => EventUtils.broadcast('app.error', error));
    }
}

ShortcutListPresenter.ID_EVERYTHING = 'shortcutListItem-everything';
ShortcutListPresenter.ID_STARRED    = 'shortcutListItem-starred';
ShortcutListPresenter.ID_ARCHIVED   = 'shortcutListItem-archived';
