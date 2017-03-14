// @flow
'use strict';

import React from 'react';
import Dialog from 'material-ui/Dialog';
import Button from '../components/buttons/Button.jsx';
import ListDialog from '../components/dialogs/ListDialog.jsx';
import EditorSettingsDialog from '../components/dialogs/EditorSettingsDialog.jsx';
import EditorSettingsDialogStore from '../components/dialogs/EditorSettingsDialogStore';
import Text from '../components/text/Text.jsx';
import AppStore from '../AppStore';
import Constants from '../Constants';
import AppUtils from '../utils/AppUtils';
import ThemeCodes from '../definitions/themes/theme-codes.json';
import Path from 'path';

const { app } = require('electron').remote;

const renderThemeDialog = (store : AppStore) : any => {
    return (
        <ListDialog
            id="themeListDialog"
            store={store.themeDialog}
            title="Theme"
            onItemClick={(index : number) => {
                store.themeDialog.list.selectedIndex = index;

                AppUtils.changeTheme(store, ThemeCodes.items[index]);
            }} />
    );
};

const renderFontDialog = (store : AppStore) : any => {
    return (
        <ListDialog
            id="fontListDialog"
            store={store.fontDialog}
            title="Font"
            onItemClick={(index : number) => {
                store.fontDialog.list.selectedIndex = index;

                AppUtils.changeFont(Constants.FONTS.items[index]);
            }} />
    );
};

const renderEditorSettingsDialog = (store : AppStore) : any => {
    return (
        <EditorSettingsDialog store={store.editorSettings} />
    );
};

const renderAboutDialog = (store : AppStore) : any => {
    return (
        <Dialog
            open={store.aboutDialog.booleanValue}
            actions={[
                <Button
                    label="Close"
                    labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                    color="primary"
                    height={Constants.BUTTON_HEIGHT_X1}
                    onTouchTap={() => store.aboutDialog.booleanValue = false} />
            ]}
            onRequestClose={() => store.aboutDialog.booleanValue = false}>
            <div
                style={{
                    width     : '100%',
                    textAlign : 'center' }}>
                <img src={Path.join(__dirname, '../../images/logo.png')} /><br />
                <Text
                    style={{
                        fontSize   : 'larger',
                        fontWeight : 500 }}>{app.getName()}</Text>
                <Text>{'Version ' + app.getVersion()}</Text>
                <Text
                    style={{
                        fontSize   : 'smaller',
                        fontWeight : 300
                    }}>{'Copyright © 2016 - ' + new Date().getFullYear()}</Text>
            </div>
        </Dialog>
    );
};

export default { renderThemeDialog, renderFontDialog, renderEditorSettingsDialog, renderAboutDialog };
