'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import ImageButton from '../../../app/components/buttons/ImageButton.jsx';
import ImageButtonStore from '../../../app/components/buttons/ImageButtonStore';

it('renders correctly', () => {
    const _store = new ImageButtonStore();

    _store.icon    = 'fa fa-fw fa-undo';
    _store.tooltip = 'Undo';

    const imageButton = Renderer.create(
        <ImageButton store={_store} />
    ).toJSON();

    expect(imageButton).toMatchSnapshot();
});
