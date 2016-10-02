'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import ListView from '../../../app/components/lists/ListView.jsx';
import Text from '../../../app/components/text/Text.jsx';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const listView = Renderer.create(
        <ListView
            header="Section"
            backgroundColor="#f1f2f4">
            <Text>Item 1</Text>
            <Text>Item 2</Text>
            <Text>Item 3</Text>
        </ListView>
    ).toJSON();

    expect(listView).toMatchSnapshot();
});
