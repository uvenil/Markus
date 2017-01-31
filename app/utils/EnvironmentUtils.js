// @flow
'use strict';

export default class EnvironmentUtils {
    static isMacOS() : boolean {
        const p : any = process;
        return p.platform === 'darwin';
    }

    static isWindows() : boolean {
        const p : any = process;
        return p.platform === 'win32';
    }

    static isLinux() : boolean {
        const p : any = process;
        return p.platform === 'linux';
    }

    static isDev() : boolean {
        const p : any = process;
        return p.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(p.execPath) || /[\\/]electron[\\/]/.test(p.execPath);
    }
}
