'use strict';

import ListViewPresenter from './ListViewPresenter';
import ListItemStore from './ListItemStore';
import Database from '../../data/Database';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const FILTER_EVERYTHING_INDEX = 0;
const FILTER_STARRED_INDEX    = 1;
const FILTER_ARCHIVED_INDEX   = 2;

export default class FilterListViewPresenter extends ListViewPresenter {
    /**
     * Creates a new instance of FilterListViewPresenter.
     * @param {Database} database
     */
    constructor(database) {
        super(database);
    }

    refresh() {
        this.database.countAll()
            .then(count => this.store.items[FILTER_EVERYTHING_INDEX].secondaryText = count)
            .catch(error => PubSub.publish('Event.error', error));

        this.database.countByStarred()
            .then(count => this.store.items[FILTER_STARRED_INDEX].secondaryText = count)
            .catch(error => PubSub.publish('Event.error', error));

        this.database.countByArchived()
            .then(count => this.store.items[FILTER_ARCHIVED_INDEX].secondaryText = count)
            .catch(error => PubSub.publish('Event.error', error));
    }

    initStore() {
        super.initStore();

        this.store.headerText = 'Notes';

        const filterEverythingStore = new ListItemStore();
        filterEverythingStore.itemId        = FilterListViewPresenter.FILTER_EVERYTHING_ID;
        filterEverythingStore.icon          = 'tags';
        filterEverythingStore.primaryText   = 'Everything';
        filterEverythingStore.secondaryText = '0';
        this.store.items.push(filterEverythingStore);

        const filterStarredStore = new ListItemStore();
        filterStarredStore.itemId        = FilterListViewPresenter.FILTER_STARRED_ID;
        filterStarredStore.icon          = 'star';
        filterStarredStore.primaryText   = 'Starred';
        filterStarredStore.secondaryText = '0';
        this.store.items.push(filterStarredStore);

        const filterArchivedStore = new ListItemStore();
        filterArchivedStore.itemId        = FilterListViewPresenter.FILTER_ARCHIVED_ID;
        filterArchivedStore.icon          = 'trash';
        filterArchivedStore.primaryText   = 'Archived';
        filterArchivedStore.secondaryText = '0';
        this.store.items.push(filterArchivedStore);
    }
}

FilterListViewPresenter.FILTER_EVERYTHING_ID = 'filterListItem-everything';
FilterListViewPresenter.FILTER_STARRED_ID    = 'filterListItem-starred';
FilterListViewPresenter.FILTER_ARCHIVED_ID   = 'filterListItem-archived';

module.exports = FilterListViewPresenter;
