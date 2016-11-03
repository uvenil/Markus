'use strict';

import Constants from './Constants';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const { remote } = require('electron');

const createEditMenu = () => {
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

const createViewMenu = () => {
    return {
        label   : 'View',
        submenu : [
            {
                label : 'Show filter list',
                type  : 'checkbox',
                click : (item, win) => {
                    if (win) PubSub.publish('ui.filterList.visibility', item.checked);
                }
            },
            {
                label : 'Show note list',
                type  : 'checkbox',
                click : (item, win) => {
                    if (win) PubSub.publish('ui.categoryList.visibility', item.checked);
                }
            },
            {
                type : 'separator'
            },
            {
                role  : 'zoomin',
                click : (item, win) => {
                    if (win) {
                        remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => {
                            remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor + Constants.ZOOM_FACTOR_STEP);
                        });
                    }
                }
            },
            {
                role  : 'zoomout',
                click : (item, win) => {
                    if (win) {
                        remote.getCurrentWindow().webContents.getZoomFactor(zoomFactor => {
                            remote.getCurrentWindow().webContents.setZoomFactor(zoomFactor - Constants.ZOOM_FACTOR_STEP);
                        });
                    }
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

const createDeveloperMenu = () => {
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
                accelerator : is.macOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
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
                    if (win) PubSub.publish('dev.settings.reset');
                }
            },
            {
                label : 'Reset database',
                click : (item, win) => {
                    if (win) PubSub.publish('dev.database.reset');
                }
            }
        ]
    };
};

module.exports = { createEditMenu, createViewMenu, createDeveloperMenu };
