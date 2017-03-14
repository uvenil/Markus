'use strict';

import React from 'react';
import Renderer from 'react-test-renderer'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import SearchField from '../../../app/components/text/SearchField.jsx';
import { mount } from 'enzyme';

jest.mock('../../../app/utils/ContextMenuUtils');

it('renders correctly', () => {
    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <SearchField hintText="Search" />
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});

it('triggers onChange after a key press, and clear text after clicking clear button', () => {
    let searchFieldValue = '';

    const component = mount(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <SearchField
                hintText="Search"
                onChange={value => searchFieldValue = value} />
        </MuiThemeProvider>
    );

    const input = component.find('#SearchField_textBoxId');

    input.simulate('focus');
    input.simulate('change', {
        target : {
            value : 'a'
        }
    });

    expect(searchFieldValue).toEqual('a');

    const clearButton = component.find('#SearchField_clearButtonId');
    clearButton.simulate('click');

    expect(searchFieldValue).toEqual('');
});
