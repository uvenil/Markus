'use strict';

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
                click(item, win) {
                    // TODO
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
            },
            {
                type : 'separator'
            },
            {
                label : 'Preferences',
                click(item, win) {
                    if (win) PubSub.publish('PreferencesDialog.visible', { visible : true });
                }
            }
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
                label : 'Toggle Developer Tools',
                accelerator : is.macOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, win) {
                    if (win) win.webContents.toggleDevTools();
                }
            }
        ]
    });

    template.push({
        label   : 'Help',
        submenu : [
            {
                label : 'About ' + app.getName(),
                click(item, win) {
                    if (win) PubSub.publish('AboutDialog.visible', { visible : true });
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = createWindowMenu;