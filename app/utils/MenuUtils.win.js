'use strict';

import { createPreferencesMenu, createEditMenu, createSyntaxMenu, createThemeMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const { app, Menu } = require('electron').remote;

export default function createWindowMenu() {
    const template = [];

    template.push({
        label   : 'File',
        submenu : [
            {
                label : 'New note',
                click(item, win) {
                    // TODO
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Exit',
                role  : 'quit'
            }
        ]
    });

    const editMenu = createEditMenu();

    editMenu.push({ type : 'separator' });
    editMenu.push(createPreferencesMenu());

    template.push({
        label   : 'Edit',
        submenu : editMenu
    });

    template.push(createViewMenu());

    template.push(createDeveloperMenu());

    template.push({
        label   : 'Help',
        submenu : [
            {
                label : 'About ' + app.getName(),
                click(item, win) {
                    if (win) PubSub.publish('AboutDialog.visible', { visible : true });
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;
