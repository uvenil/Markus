'use strict';

import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import { createEditMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';

const { app, Menu } = require('electron').remote;

export default function createWindowMenu() {
    const template = [];

    template.push({
        label   : 'File',
        submenu : [
            {
                label : 'New note',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('app.note.new');
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Import notes…',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('app.note.import');
                }
            },
            {
                label : 'Export notes…',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('app.note.export');
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

    if (EnvironmentUtils.isDev()) template.push(createDeveloperMenu());

    template.push({
        label   : 'Help',
        submenu : [
            {
                label : 'About ' + app.getName(),
                click : (item, win) => {
                    if (win) EventUtils.broadcast('app.aboutDialog.visibility');
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;
