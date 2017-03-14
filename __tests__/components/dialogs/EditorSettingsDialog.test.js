'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import EditorSettingsDialog from '../../../app/components/dialogs/EditorSettingsDialog.jsx';
import EditorSettingsDialogStore from '../../../app/components/dialogs/EditorSettingsDialogStore';

it('renders correctly', () => {
    const store = new EditorSettingsDialogStore();

    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <EditorSettingsDialog store={store} />
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});
