'use strict';

import React from 'react';
import Renderer from 'react-test-renderer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Editor from '../../../app/components/text/Editor.jsx';
import EditorStore from '../../../app/components/text/EditorStore';

jest.mock('../../../app/utils/ContextMenuUtils');

it('renders correctly', () => {
    const store = new EditorStore();

    const component = Renderer.create(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
            <Editor store={store} />
        </MuiThemeProvider>
    ).toJSON();

    expect(component).toMatchSnapshot();
});
