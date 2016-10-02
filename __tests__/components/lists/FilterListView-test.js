'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import FilterListView from '../../../app/components/lists/FilterListView.jsx';
import ListViewStore from '../../../app/components/lists/ListViewStore';
import ListItemStore from '../../../app/components/lists/ListItemStore';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const store = new ListViewStore();
    store.filterStore.headerText = 'Notes';

    const filterEverythingStore = new ListItemStore();
    filterEverythingStore.itemId        = 'filter-everything';
    filterEverythingStore.primaryText   = 'Everything';
    filterEverythingStore.secondaryText = '88';
    store.filterStore.items.push(filterEverythingStore);

    const filterStarredStore = new ListItemStore();
    filterStarredStore.itemId        = 'filter-starred';
    filterStarredStore.primaryText   = 'Starred';
    filterStarredStore.secondaryText = '17';
    store.filterStore.items.push(filterStarredStore);

    const filterArchivedStore = new ListItemStore();
    filterArchivedStore.itemId        = 'filter-archived';
    filterArchivedStore.primaryText   = 'Archived';
    filterArchivedStore.secondaryText = '1';
    store.filterStore.items.push(filterArchivedStore);

    const filterListView = Renderer.create(
        <FilterListView store={store} />
    ).toJSON();

    expect(filterListView).toMatchSnapshot();
});
