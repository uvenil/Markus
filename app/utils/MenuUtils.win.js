'use strict';

import { createPreferencesMenu, createEditMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';
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
                click : (item, win) => {
                    PubSub.publish('Application.newNote');
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

    const editMenu = [];

    editMenu.push(createPreferencesMenu());

    template.push({
        label   : 'Edit',
        submenu : editMenu
    });

    template.push(createViewMenu());

    if (is.dev()) {
        template.push(createDeveloperMenu());
    }

    template.push({
        label   : 'Help',
        submenu : [
            {
                label : 'About ' + app.getName(),
                click : (item, win) => {
                    if (win) PubSub.publish('AboutDialog.visible');
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;
