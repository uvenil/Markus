'use strict';

import { BrowserWindow, app, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import Constants from './app/utils/Constants';
import Path from 'path';
import is from 'electron-is';

let win;

const createWindow = () => {
    const winStateKeeper = windowStateKeeper({
        defaultWidth  : Constants.WINDOW_MIN_WIDTH,
        defaultHeight : Constants.WINDOW_MIN_HEIGHT
    });

    win = new BrowserWindow({
        title           : app.getName(),
        x               : winStateKeeper.x,
        y               : winStateKeeper.y,
        width           : winStateKeeper.width,
        height          : winStateKeeper.height,
        minWidth        : Constants.WINDOW_MIN_WIDTH,
        minHeight       : Constants.WINDOW_MIN_HEIGHT,
        backgroundColor : '#f0f2f4',
        show            : false,
        webPreferences  : {
            defaultEncoding          : 'UTF-8',
            defaultFontSize          : Constants.DEFAULT_FONT_SIZE,
            defaultMonospaceFontSize : Constants.DEFAULT_FONT_SIZE,
            webaudio                 : false,
            webgl                    : false
        }
    });

    winStateKeeper.manage(win);

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
