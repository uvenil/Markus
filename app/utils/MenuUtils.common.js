// @flow
'use strict';

import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import Constants from '../Constants';

const { remote } = require('electron');

const createEditMenu = () : Object => {
    return {
        label   : 'Edit',
        submenu : [
            {
                role        : 'undo',
                accelerator : 'CmdOrCtrl+Z'
            },
            {
                role        : 'redo',
                accelerator : 'CmdOrCtrl+Y'
            },
            {
                type : 'separator'
            },
            {
                role        : 'cut',
                accelerator : 'CmdOrCtrl+X'
            },
            {
                role        : 'copy',
                accelerator : 'CmdOrCtrl+C'
            },
            {
                role        : 'paste',
                accelerator : 'CmdOrCtrl+V'
            },
            {
                role        : 'delete',
                accelerator : 'Delete'
            },
            {
                type : 'separator'
            },
            {
                role        : 'selectall',
                accelerator : 'CmdOrCtrl+A'
            }
        ]
    };
};

const createViewMenu = () : Object => {
    return {
        label   : 'View',
        submenu : [
            {
                label : 'Show master list',
                type  : 'checkbox',
                click : (item) : boolean => EventUtils.broadcast('app.list.master.show', item.checked)
            },
            {
                label : 'Show detail list',
                type  : 'checkbox',
                click : (item) : boolean => EventUtils.broadcast('app.list.detail.show', item.checked)
            },
            {
                type : 'separator'
            },
            {
                role  : 'zoomin',
                click : () : void => remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => {
                    if (zoomFactor > Constants.ZOOM_FACTOR_STEP) remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor + Constants.ZOOM_FACTOR_STEP);
                })
            },
            {
                role  : 'zoomout',
                click : () : void => remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor - Constants.ZOOM_FACTOR_STEP))
            },
            {
                role  : 'resetzoom',
                click : () : void => remote.getCurrentWindow().webContents.setZoomFactor(1)
            },
            {
                type : 'separator'
            },
            {
                role : 'togglefullscreen'
            }
        ]
    };
};

const createDeveloperMenu = () : Object => {
    return {
        label   : 'Developer',
        submenu : [
            {
                label       : 'Reload',
                accelerator : 'CmdOrCtrl+R',
                click       : (item, win) : boolean => win.reload()
            },
            {
                label       : 'Toggle Developer Tools',
                accelerator : EnvironmentUtils.isMacOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click       : (item, win) : void => win.webContents.toggleDevTools()
            },
            {
                type : 'separator'
            },
            {
                label : 'Reset settings',
                click : () : boolean => EventUtils.broadcast('dev.settings.reset')
            },
            {
                label : 'Reset database',
                click : () : boolean => EventUtils.broadcast('dev.database.reset')
            }
        ]
    };
};

module.exports = { createEditMenu, createViewMenu, createDeveloperMenu };
