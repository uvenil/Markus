'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Button from '../../../app/components/buttons/Button.jsx';

it('renders correctly', () => {
    const button = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <Button
                label=""
                icon="cog"
                color="primary" />
        </MuiThemeProvider>
    ).toJSON();

    expect(button).toMatchSnapshot();
});
