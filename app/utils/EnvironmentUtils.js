// @flow
'use strict';

const EnvironmentUtils = {
    /**
     * Returns true if the current platform is Mac OS X or macOS; otherwise, returns false.
     * @return {boolean}
     */
    isMacOS : function() : boolean {
        return process.platform === 'darwin';
    },

    /**
     * Returns true if the current platform is Windows; otherwise, returns false.
     * @return {boolean}
     */
    isWindows : function() : boolean {
        return process.platform === 'win32';
    },

    /**
     * Returns true if the current platform is Linux; otherwise, returns false.
     * @return {boolean}
     */
    isLinux : function() : boolean {
        return process.platform === 'linux';
    },

    /**
     * Returns true if the current runtime is in development environment; otherwise, returns false.
     * @return {*|boolean}
     */
    isDev : function() : boolean {
        return process.defaultApp !== undefined || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
    }
};

export default EnvironmentUtils;
