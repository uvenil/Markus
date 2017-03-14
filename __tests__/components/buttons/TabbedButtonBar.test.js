'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import TabbedButtonBar from '../../../app/components/buttons/TabbedButtonBar.jsx';

it('renders correctly', () => {
    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <TabbedButtonBar
                icons={[ 'code', 'columns', 'eye' ]}
                initialSelectedIndex={1} />
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});
