'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import ImageButton from '../../../app/components/buttons/ImageButton.jsx';
import ImageButtonBar from '../../../app/components/buttons/ImageButtonBar.jsx';
import ImageButtonStore from '../../../app/components/buttons/ImageButtonStore';
import ImageButtonBarStore from '../../../app/components/buttons/ImageButtonBarStore';

it('renders correctly', () => {
    const _store = new ImageButtonBarStore();

    const undoStore = new ImageButtonStore();

    undoStore.itemId  = 'undo';
    undoStore.icon    = 'fa fa-fw fa-undo';
    undoStore.tooltip = 'Undo';

    const redoStore = new ImageButtonStore();

    redoStore.itemId  = 'redo';
    redoStore.icon    = 'fa fa-fw fa-repeat';
    redoStore.tooltip = 'Redo';

    const divider = new ImageButtonStore();

    divider.itemId = 'divider';
    divider.icon   = '-';

    const boldStore = new ImageButtonStore();

    boldStore.itemId  = 'bold';
    boldStore.icon    = 'fa fa-fw fa-bold';
    boldStore.tooltip = 'Bold';

    this._store.items.push(undoStore);
    this._store.items.push(redoStore);
    this._store.items.push(divider);
    this._store.items.push(boldStore);

    const imageButtonBar = Renderer.create(
        <ImageButtonBar store={_store} />
    ).toJSON();

    expect(imageButtonBar).toMatchSnapshot();
});
