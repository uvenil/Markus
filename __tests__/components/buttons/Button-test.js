'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import Button from '../../../app/components/buttons/Button.jsx';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const button = Renderer.create(
        <Button>Hello, World!</Button>
    ).toJSON();

    expect(button).toMatchSnapshot();
});
