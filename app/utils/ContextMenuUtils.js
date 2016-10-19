'use strict';

import _ from 'lodash';

const { remote } = require('electron');
const { Menu, MenuItem, clipboard } = remote;

const showTextBoxContextMenu = () => {
    const menu = new Menu();

    menu.append(new MenuItem({
        role        : 'undo',
        accelerator : 'CmdOrCtrl+Z'
    }));

    menu.append(new MenuItem({
        role        : 'redo',
        accelerator : 'CmdOrCtrl+Y'
    }));

    menu.append(new MenuItem({ type : 'separator' }));

    menu.append(new MenuItem({
        role        : 'cut',
        accelerator : 'CmdOrCtrl+X'
    }));

    menu.append(new MenuItem({
        role        : 'copy',
        accelerator : 'CmdOrCtrl+C'
    }));

    menu.append(new MenuItem({
        role        : 'paste',
        accelerator : 'CmdOrCtrl+V',
        enabled     : !_.isNil(clipboard.readText())
    }));

    menu.append(new MenuItem({
        role : 'delete'
    }));

    menu.append(new MenuItem({ type : 'separator' }));

    menu.append(new MenuItem({
        role        : 'selectall',
        accelerator : 'CmdOrCtrl+A'
    }));

    menu.popup(remote.getCurrentWindow());
};

module.exports = { showTextBoxContextMenu };
