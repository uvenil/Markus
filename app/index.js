'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import AppStore from './AppStore';
import PubSub from 'pubsub-js';
import is from 'electron-is';
import injectTapEventPlugin from 'react-tap-event-plugin';

if (is.dev()) PubSub.immediateExceptions = true;

injectTapEventPlugin();

const remote  = require('electron').remote;
const { app } = require('electron').remote;
const Menu    = remote.Menu;

function createWindowMenu() {
    const template = [];

    if (is.macOS()) {
        template.push({
            label   : app.getName(),
            submenu : [
                {
                    label   : 'About ' + app.getName(),
                    click(item, focusedWindow) {
                        if (focusedWindow) PubSub.publish('AboutDialog.visible', { visible : true });
                    }
                },
                {
                    type    : 'separator'
                },
                {
                    role    : 'services',
                    submenu : []
                },
                {
                    label   : 'Hide ' + app.getName(),
                    role    : 'hide'
                },
                {
                    role    : 'unhide'
                },
                {
                    type    : 'separator'
                },
                {
                    label   : 'Quit ' + app.getName(),
                    role    : 'quit'
                }
            ]
        });
    }

    const fileMenu = [
        {
            label : 'New note',
            click(item, focusedWindow) {
                // TODO
            }
        },
        {
            label : 'New task',
            click(item, focusedWindow) {
                // TODO
            }
        }
    ];

    if (!is.macOS()) {
        fileMenu.push({
            type  : 'separator'
        });

        fileMenu.push({
            label : 'Exit',
            role  : 'quit'
        });
    }

    template.push({
        label   : 'File',
        submenu : fileMenu
    });

    const editMenu = [
        {
            role        : 'undo',
            accelerator : 'CmdOrCtrl+Z'
        },
        {
            role        : 'redo',
            accelerator : 'Shift+CmdOrCtrl+Z'
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
            type        : 'separator'
        },
        {
            role        : 'selectall',
            accelerator : 'CmdOrCtrl+A'
        }
    ];

    if (!is.macOS() && !is.windows()) {
        editMenu.push({
            type  : 'separator'
        });

        editMenu.push({
            label : 'Settings',
            click(item, focusedWindow) {
                if (focusedWindow) PubSub.publish('SettingsDialog.visible', { visible : true });
            }
        });
    }

    template.push({
        label   : 'Edit',
        submenu : editMenu
    });

    const viewMenu = [
        {
            label       : 'Reload',
            accelerator : 'CmdOrCtrl+R',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.reload();
            }
        },
        {
            type        : 'separator'
        },
        {
            role        : 'togglefullscreen'
        }
    ];

    template.push({
        label   : 'View',
        submenu : viewMenu
    });

    const toolsMenu = [
        {
            label       : 'Toggle Developer Tools',
            accelerator : is.macOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) {
                if (focusedWindow) focusedWindow.webContents.toggleDevTools();
            }
        }
    ];

    if (is.windows()) {
        toolsMenu.push({
            type  : 'separator'
        });

        toolsMenu.push({
            label : 'Settings',
            click(item, focusedWindow) {
                if (focusedWindow) PubSub.publish('SettingsDialog.visible', { visible : true });
            }
        });
    }

    template.push({
        label   : 'Tools',
        submenu : toolsMenu
    });

    if (is.macOS()) {
        const windowMenu = [
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
        ];

        template.push({
            label   : 'Window',
            submenu : windowMenu
        });
    }

    if (!is.macOS()) {
        const helpMenu = [
            {
                label : 'About',
                click(item, focusedWindow) {
                    if (focusedWindow) PubSub.publish('AboutDialog.visible', { visible : true });
                }
            }
        ];

        template.push({
            label   : 'Help',
            submenu : helpMenu
        });
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createContextMenu() {
    const template = [
        { role : 'undo'      },
        { role : 'redo'      },
        { type : 'separator' },
        { role : 'cut'       },
        { role : 'copy'      },
        { role : 'paste'     },
        { type : 'separator' },
        { role : 'selectall' }
    ];

    const contextMenu = Menu.buildFromTemplate(template);

    document.body.addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopPropagation();

        let node = event.target;

        while (node) {
            if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
                contextMenu.popup(remote.getCurrentWindow());

                break;
            }

            node = node.parentNode;
        }
    });

    window.onresize = event => {
        PubSub.publish('Window.resize', event.currentTarget.innerWidth);
    };
}

createWindowMenu();
createContextMenu();

const store = new AppStore();

ReactDOM.render(<App store={store} />, document.getElementById('app'));
