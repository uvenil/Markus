'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Label from '../../../app/components/text/Label.jsx';

it('renders correctly', () => {
    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <Label style={{ fontWeight : 300 }}>Hello, World!</Label>
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});
