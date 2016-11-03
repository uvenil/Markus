'use strict';

import { createEditMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';
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
                    if (win) PubSub.publish('app.note.new');
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Import notes…',
                click : (item, win) => {
                    if (win) PubSub.publish('app.note.import');
                }
            },
            {
                label : 'Export notes…',
                click : (item, win) => {
                    if (win) PubSub.publish('app.note.export');
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

    template.push(createEditMenu());

    template.push(createViewMenu());

    if (is.dev()) template.push(createDeveloperMenu());

    template.push({
        label   : 'Help',
        submenu : [
            {
                label : 'About ' + app.getName(),
                click : (item, win) => {
                    if (win) PubSub.publish('app.aboutDialog.visibility');
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;
