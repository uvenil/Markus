// @flow
'use strict';

import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';

const { remote } = require('electron');
const { Menu, MenuItem, clipboard } = remote;

const showTextBoxContextMenu = () => {
    const menu : Menu = new Menu();

    let text : any;

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else {
        const doc       : any = document;
        const selection : any = doc.selection;

        if (selection && selection.type !== 'Control') text = selection.createRange().text;
    }

    const hasSelectedText : boolean = !isNil(text) && !isEmpty(text);

    text = clipboard.readText();
    const hasCopiedText : boolean = !isNil(text) && !isEmpty(text);

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
