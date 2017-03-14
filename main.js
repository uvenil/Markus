// @flow
'use strict';

import { BrowserWindow, app, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import EnvironmentUtils from './app/utils/EnvironmentUtils';
import Constants from './app/Constants';
import Path from 'path';

let win : BrowserWindow;

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
        titleBarStyle   : 'hidden',
        backgroundColor : '#f0f2f4',
        show            : false,
        webPreferences  : {
            defaultEncoding          : 'UTF-8',
            defaultFontSize          : Constants.FONT_SIZE,
            defaultMonospaceFontSize : Constants.FONT_SIZE_MONOSPACED,
            webaudio                 : false,
            webgl                    : false
        }
    });

    winStateKeeper.manage(win);

    win.once('ready-to-show', () : void => win.show());
    win.on('close', () : any => win = null);
    win.loadURL('file://' + Path.join(__dirname, 'app/index.html'));

    win.webContents.on('will-navigate', (event, url) : void => {
        event.preventDefault();

        shell.openExternal(url);
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () : void => {
    if (!EnvironmentUtils.isMacOS()) app.quit();
});

app.on('activate', () : void => {
    if (win === null) createWindow();
});
