'use strict';

import { createPreferencesMenu, createEditMenu, createSyntaxMenu, createThemeMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const { app, Menu } = require('electron').remote;

export default function createWindowMenu() {
    const template = [];

    template.push({
        label   : app.getName(),
        submenu : [
            {
                label : 'About ' + app.getName(),
                click(item, win) {
                    if (win) PubSub.publish('AboutDialog.visible', { visible : true });
                }
            },
            {
                type : 'separator'
            },
            createPreferencesMenu(),
            {
                type : 'separator'
            },
            {
                role    : 'services',
                submenu : []
            },
            {
                type : 'separator'
            },
            {
                label : 'Hide ' + app.getName(),
                role  : 'hide'
            },
            {
                role : 'unhide'
            },
            {
                type : 'separator'
            },
            {
                label : 'Quit ' + app.getName(),
                role  : 'quit'
            }
        ]
    });

    template.push({
        label   : 'File',
        submenu : [
            {
                label : 'New note',
                click(item, win) {
                    // TODO
                }
            }
        ]
    });

    template.push({
        label   : 'Edit',
        submenu : createEditMenu()
    });

    template.push(createViewMenu());

    template.push(createDeveloperMenu());

    template.push({
        label   : 'Window',
        submenu : [
            {
                label       : 'Close',
                accelerator : 'CmdOrCtrl+W',
                role        : 'close'
            },
            {
                label       : 'Minimize',
                accelerator : 'CmdOrCtrl+M',
                role        : 'minimize'
            },
            {
                label       : 'Zoom',
                role        : 'zoom'
            },
            {
                type        : 'separator'
            },
            {
                label       : 'Bring All to Front',
                role        : 'front'
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;
