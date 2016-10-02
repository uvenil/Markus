'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import CheckBox from '../../../app/components/toggles/CheckBox.jsx';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const checkBox = Renderer.create(
        <CheckBox>Hello, World!</CheckBox>
    ).toJSON();

    expect(checkBox).toMatchSnapshot();
});
