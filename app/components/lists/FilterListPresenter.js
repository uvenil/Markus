// @flow
'use strict';

import ListPresenter from './ListPresenter';
import ListItemStore from './ListItemStore.jsx';
import Database from '../../data/Database';
import EventUtils from '../../utils/EventUtils';

const FILTER_EVERYTHING_INDEX = 0;
const FILTER_STARRED_INDEX    = 1;
const FILTER_ARCHIVED_INDEX   = 2;

export default class FilterListPresenter extends ListPresenter {
    static FILTER_EVERYTHING_ID : string;
    static FILTER_STARRED_ID    : string;
    static FILTER_ARCHIVED_ID   : string;

    /**
     * Creates a new instance of FilterListPresenter.
     * @param {Database} database
     */
    constructor(database : Database) {
        super(database);
    }

    refresh() : void {
        this.database.countAll()
            .then(count => this.store.items[FILTER_EVERYTHING_INDEX].secondaryText = (count).toString())
            .catch(error => EventUtils.broadcast('global.error', error));

        this.database.countByStarred()
            .then(count => this.store.items[FILTER_STARRED_INDEX].secondaryText = (count).toString())
            .catch(error => EventUtils.broadcast('global.error', error));

        this.database.countByArchived()
            .then(count => this.store.items[FILTER_ARCHIVED_INDEX].secondaryText = (count).toString())
            .catch(error => EventUtils.broadcast('global.error', error));
    }

    initStore() : void {
        super.initStore();

        this.store.headerText = 'Notes';

        const filterEverythingStore = new ListItemStore();
        filterEverythingStore.itemId        = FilterListPresenter.FILTER_EVERYTHING_ID;
        filterEverythingStore.icon          = 'tags';
        filterEverythingStore.primaryText   = 'Everything';
        filterEverythingStore.secondaryText = '0';
        this.store.items.push(filterEverythingStore);

        const filterStarredStore = new ListItemStore();
        filterStarredStore.itemId        = FilterListPresenter.FILTER_STARRED_ID;
        filterStarredStore.icon          = 'star';
        filterStarredStore.primaryText   = 'Starred';
        filterStarredStore.secondaryText = '0';
        this.store.items.push(filterStarredStore);

        const filterArchivedStore = new ListItemStore();
        filterArchivedStore.itemId        = FilterListPresenter.FILTER_ARCHIVED_ID;
        filterArchivedStore.icon          = 'trash';
        filterArchivedStore.primaryText   = 'Archived';
        filterArchivedStore.secondaryText = '0';
        this.store.items.push(filterArchivedStore);
    }
}

FilterListPresenter.FILTER_EVERYTHING_ID = 'filterListItem-everything';
FilterListPresenter.FILTER_STARRED_ID    = 'filterListItem-starred';
FilterListPresenter.FILTER_ARCHIVED_ID   = 'filterListItem-archived';
