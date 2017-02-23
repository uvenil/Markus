'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Text from '../../../app/components/text/Text.jsx';

it('renders correctly', () => {
    const text = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <Text style={{ fontWeight : 'bold' }}>Hello, World!</Text>
        </MuiThemeProvider>
    ).toJSON();

    expect(text).toMatchSnapshot();
});
