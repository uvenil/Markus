// @flow
'use strict';

import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import { createEditMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';

const { app, Menu } = require('electron').remote;

const createWindowMenu = () : void => {
    const template = [];

    template.push({
        label   : app.getName(),
        submenu : [
            {
                label : 'About ' + app.getName(),
                click : () : boolean => EventUtils.broadcast('app.about.show')
            },
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
                role : 'hideothers'
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
                click : () : boolean => EventUtils.broadcast('app.note.add')
            },
            {
                type : 'separator'
            },
            {
                label : 'Import notes…',
                click : () : boolean => EventUtils.broadcast('app.note.import')
            },
            {
                label : 'Export notes…',
                click : () : boolean => EventUtils.broadcast('app.note.export')
            }
        ]
    });

    template.push(createEditMenu());
    template.push(createViewMenu());

    if (EnvironmentUtils.isDev()) template.push(createDeveloperMenu());

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
};

export default createWindowMenu;
