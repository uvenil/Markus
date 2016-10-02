'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
//import { shallow } from 'enzyme';
import SearchBox from '../../../app/components/text/SearchBox.jsx';

jest.mock('../../../app/utils/Unique');

it('renders correctly', () => {
    const searchBox = Renderer.create(
        <SearchBox />
    ).toJSON();

    expect(searchBox).toMatchSnapshot();
});

/*it('shows clear button after text input', () => {
    const searchBox = shallow(
        <SearchBox />
    );

    const input       = searchBox.find('input');
    const clearButton = searchBox.find('i')[1];

    expect(input.value).toEqual('');
    expect(clearButton.style.display).toEqual('none');

    input.simulate('keyPress', { which : 'a' });

    expect(input.value).toEqual('a');
    expect(clearButton.style.display).toEqual('block');
});*/
