'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import Text from '../../../app/components/text/Text.jsx';

it('renders correctly', () => {
    const text = Renderer.create(
        <Text />
    ).toJSON();

    expect(text).toMatchSnapshot();
});
