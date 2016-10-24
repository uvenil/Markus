'use strict';

import { BrowserWindow, app, shell } from 'electron';
import Config from './config.json';
import Path from 'path';
import is from 'electron-is';

let win;

const createWindow = () => {
    win = new BrowserWindow({
        title           : app.getName(),
        width           : Config.windowWidth,
        height          : Config.windowHeight,
        minWidth        : Config.windowMinWidth,
        minHeight       : Config.windowMinHeight,
        backgroundColor : '#f0f2f4',
        show            : false,
        webPreferences  : {
            defaultEncoding          : 'UTF-8',
            defaultFontSize          : 13,
            defaultMonospaceFontSize : 13,
            webaudio                 : false,
            webgl                    : false
        }
    });

    win.once('ready-to-show', () => win.show());
    win.on('close', () => win = null);
    win.loadURL('file://' + Path.join(__dirname, 'app/index.html'));

    win.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();

        shell.openExternal(url);
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (!is.macOS()) app.quit();
});

app.on('activate', () => {
    if (win === null) createWindow();
});
