'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import Button from '../../../app/components/buttons/Button.jsx';

it('renders correctly', () => {
    const button = Renderer.create(
        <Button>Hello, World!</Button>
    ).toJSON();

    expect(button).toMatchSnapshot();
});
