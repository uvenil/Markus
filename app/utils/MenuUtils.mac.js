'use strict';

import { createSyntaxMenu, createThemeMenu } from './MenuUtils.common';
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
            {
                label : 'Preferences',
                click(item, win) {
                    if (win) PubSub.publish('PreferencesDialog.visible', { visible : true });
                }
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
        submenu : [
            {
                role        : 'undo',
                accelerator : 'CmdOrCtrl+Z'
            },
            {
                role        : 'redo',
                accelerator : 'Shift+CmdOrCtrl+Z'
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
                type : 'separator'
            },
            {
                role        : 'selectall',
                accelerator : 'CmdOrCtrl+A'
            }
        ]
    });

    template.push({
        label   : 'View',
        submenu : [
            createSyntaxMenu(),
            createThemeMenu()
        ]
    });

    template.push({
        label   : 'Developer',
        submenu : [
            {
                label       : 'Reload',
                accelerator : 'CmdOrCtrl+R',
                click(item, win) {
                    if (win) win.reload();
                }
            },
            {
                label       : 'Toggle Developer Tools',
                accelerator : is.macOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, win) {
                    if (win) win.webContents.toggleDevTools();
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Reset database',
                click(item, win) {
                    if (win) PubSub.publish('Database.reset');
                }
            }
        ]
    });

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
