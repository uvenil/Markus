'use strict';

import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';

const { remote } = require('electron');
const { Menu, MenuItem, clipboard } = remote;

const showTextBoxContextMenu = () => {
    const menu = new Menu();

    let text = undefined;

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== 'Control') {
        text = document.selection.createRange().text;
    }

    const hasSelectedText = !isNil(text) && !isEmpty(text);

    text = clipboard.readText();
    const hasCopiedText = !isNil(text) && !isEmpty(text);

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
        label       : 'Cut',
        role        : hasSelectedText ? 'cut' : undefined,
        accelerator : 'CmdOrCtrl+X',
        enabled     : hasSelectedText
    }));

    menu.append(new MenuItem({
        label       : 'Copy',
        role        : hasSelectedText ? 'copy' : undefined,
        accelerator : 'CmdOrCtrl+C',
        enabled     : hasSelectedText
    }));

    menu.append(new MenuItem({
        label       : 'Paste',
        role        : hasCopiedText ? 'paste' : undefined,
        accelerator : 'CmdOrCtrl+V',
        enabled     : hasCopiedText
    }));

    menu.append(new MenuItem({
        label   : 'Delete',
        role    : hasSelectedText ? 'delete' : undefined,
        enabled : hasSelectedText
    }));

    menu.append(new MenuItem({ type : 'separator' }));

    menu.append(new MenuItem({
        role        : 'selectall',
        accelerator : 'CmdOrCtrl+A'
    }));

    menu.popup(remote.getCurrentWindow());
};

module.exports = { showTextBoxContextMenu };
