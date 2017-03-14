'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import ChippedTextField from '../../../app/components/text/ChippedTextField.jsx';
import ChippedTextFieldStore from '../../../app/components/text/ChippedTextFieldStore';
import { mount } from 'enzyme';

jest.mock('../../../app/utils/ContextMenuUtils');

const store = new ChippedTextFieldStore();

it('renders correctly', () => {
    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <ChippedTextField
                store={store} />
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});

it('triggers onChange after keying in a space', () => {
    let values = [];

    const component = mount(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <ChippedTextField
                store={store}
                onChange={chips => values = chips} />
        </MuiThemeProvider>
    );

    const input = component.find('#ChippedTextField_textBoxId');

    input.simulate('focus');
    input.simulate('change', {
        target : {
            value : 'test1 '
        }
    });

    expect(values).toEqual([ 'test1' ]);

    input.simulate('change', {
        target : {
            value : 'test2 '
        }
    });

    expect(values).toEqual([ 'test1', 'test2' ]);
});
