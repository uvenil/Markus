'use strict';

export default class EnvironmentUtils {
    static isMacOS() {
        return process.platform === 'darwin';
    }

    static isWindows() {
        return process.platform === 'win32';
    }

    static isLinux() {
        return process.platform === 'linux';
    }

    static isDev() {
        return process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
    }
}
