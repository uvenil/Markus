// @flow
'use strict';

import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import { createEditMenu, createViewMenu, createDeveloperMenu } from './MenuUtils.common';

const { app, Menu } = require('electron').remote;

const createWindowMenu = () : void => {
    const template = [];

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
                click : () : boolean => EventUtils.broadcast('app.about.show')
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

export default createWindowMenu;
