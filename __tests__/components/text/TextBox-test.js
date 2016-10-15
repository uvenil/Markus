'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import TextBox from '../../../app/components/text/TextBox.jsx';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const textBox = Renderer.create(
        <TextBox />
    ).toJSON();

    expect(textBox).toMatchSnapshot();
});
