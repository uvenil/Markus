// @flow
'use strict';

import EventUtils from './EventUtils';
import EnvironmentUtils from './EnvironmentUtils';
import Constants from './Constants';

const { remote } = require('electron');

const createEditMenu : any = () => {
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

const createViewMenu : any = () => {
    return {
        label   : 'View',
        submenu : [
            {
                label : 'Show filter list',
                type  : 'checkbox',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('ui.filterList.visibility', item.checked);
                }
            },
            {
                label : 'Show note list',
                type  : 'checkbox',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('ui.categoryList.visibility', item.checked);
                }
            },
            {
                type : 'separator'
            },
            {
                role  : 'zoomin',
                click : (item, win) => {
                    if (win) remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor + Constants.ZOOM_FACTOR_STEP));
                }
            },
            {
                role  : 'zoomout',
                click : (item, win) => {
                    if (win) remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor - Constants.ZOOM_FACTOR_STEP));
                }
            },
            {
                role  : 'resetzoom',
                click : (item, win) => {
                    if (win) {
                        remote.getCurrentWindow().webContents.setZoomFactor(1);
                    }
                }
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

const createDeveloperMenu : any = () => {
    return {
        label   : 'Developer',
        submenu : [
            {
                label       : 'Reload',
                accelerator : 'CmdOrCtrl+R',
                click       : (item, win) => {
                    if (win) win.reload();
                }
            },
            {
                label       : 'Toggle Developer Tools',
                accelerator : EnvironmentUtils.isMacOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click       : (item, win) => {
                    if (win) win.webContents.toggleDevTools();
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Reset settings',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('dev.settings.reset');
                }
            },
            {
                label : 'Reset database',
                click : (item, win) => {
                    if (win) EventUtils.broadcast('dev.database.reset');
                }
            }
        ]
    };
};

module.exports = { createEditMenu, createViewMenu, createDeveloperMenu };
