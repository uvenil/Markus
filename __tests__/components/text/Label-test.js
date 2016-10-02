'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import Label from '../../../app/components/text/Label.jsx';

it('renders correctly', () => {
    const label = Renderer.create(
        <Label />
    ).toJSON();

    expect(label).toMatchSnapshot();
});
