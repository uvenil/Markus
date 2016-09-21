'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import FilterList from '../../../app/components/lists/FilterList.jsx';
import ListStore from '../../../app/components/lists/ListStore';
import ListItemStore from '../../../app/components/lists/ListItemStore';

it('renders correctly', () => {
    const _store    = new ListStore();
    const _category = new ListStore();

    _store.headerText    = 'Notes';
    _category.headerText = 'Categories';

    const everything = new ListItemStore();
    everything.itemId        = 'filter-list-item-0';
    everything.primaryText   = 'Everything';
    everything.secondaryText = '10';

    const starred = new ListItemStore();
    starred.itemId        = 'filter-list-item-1';
    starred.primaryText   = 'Starred';
    starred.secondaryText = '3';

    const archived = new ListItemStore();
    archived.itemId        = 'filter-list-item-2';
    archived.primaryText   = 'Archived';
    archived.secondaryText = '1';

    _store.items.push(everything);
    _store.items.push(starred);
    _store.items.push(archived);

    const android = new ListItemStore();
    android.itemId        = 'category-list-item-0';
    android.primaryText   = 'Android';
    android.secondaryText = '2';

    const react = new ListItemStore();
    react.itemId        = 'category-list-item-1';
    react.primaryText   = 'React';
    react.secondaryText = '3';

    _category.items.push(android);
    _category.items.push(react);

    const filterList = Renderer.create(
        <FilterList
            store={_store}
            category={_category} />
    ).toJSON();

    expect(filterList).toMatchSnapshot();
});
