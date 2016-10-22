'use strict';

import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const setMenuItemEnabled = (items, enabled) => {
    items.forEach(item => {
        if (item.submenu) {
            setMenuItemEnabled(item.submenu.items, enabled);
        } else {
            item.enabled = enabled;
        }
    });
};

const createPreferencesMenu = () => {
    return {
        label   : 'Preferences',
        click   : (item, win) => {
            if (win) PubSub.publish('SettingsDialog.visible');
        }
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
                    if (win) PubSub.publish('View.showFilterList', item.checked);
                }
            },
            {
                label : 'Show note list',
                type  : 'checkbox',
                click : (item, win) => {
                    if (win) PubSub.publish('View.showNoteList', item.checked);
                }
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
                    if (win) PubSub.publish('Settings.reset');
                }
            },
            {
                label : 'Reset database',
                click : (item, win) => {
                    if (win) PubSub.publish('Database.reset');
                }
            }
        ]
    };
};

module.exports = { setMenuItemEnabled, createPreferencesMenu, createViewMenu, createDeveloperMenu };
