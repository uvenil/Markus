// @flow
'use strict';

const _storage = require('electron-json-storage');

const Settings = {
    /**
     * Gets the value associated with the specified key.
     * @param {string} key The key associated with the value to get.
     * @param {any} [defaultValue] The default value to return if no value is associated with the specified key.
     * @return {Promise}
     */
    get : function(key : string, defaultValue : *) : Promise<any> {
        return new Promise((resolve, reject) => this.contains(key).then(hasKey => {
            if (hasKey) {
                _storage.get(key, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            } else if (defaultValue !== undefined) {
                resolve(defaultValue);
            } else {
                resolve();
            }
        }).catch(error => reject(error)));
    },

    /**
     * Sets the value associated with the specified key, or add the specified key-value pair if the specified key does not exist.
     * @param {string} key The key associated with the value.
     * @param {any} value The value associated with the specified key to set.
     * @return {Promise}
     */
    set : function(key : string, value : any) : Promise<*> {
        return new Promise((resolve, reject) => _storage.set(key, value, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    },

    /**
     * Removes the specified key and its associated value.
     * @param {string} key The key to remove.
     * @return {Promise}
     */
    remove : function(key : string) : Promise<*> {
        return new Promise((resolve, reject) => _storage.remove(key, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    },

    /**
     * Clears all stored keys and values.
     * @return {Promise}
     */
    clear : function() : Promise<*> {
        return new Promise((resolve, reject) => _storage.clear(error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    },

    /**
     * Returns true if the specific key exists; otherwise, returns false.
     * @param {string} key The key to check for existence.
     * @return {Promise}
     */
    contains : function(key : string) : Promise<boolean> {
        return new Promise((resolve, reject) => _storage.has(key, (error, hasKey) => {
            if (error) {
                reject(error);
            } else {
                resolve(hasKey);
            }
        }));
    },

    /**
     * Gets all the keys stored.
     * @return {Promise}
     */
    keys : function() : Promise<string[]> {
        return new Promise((resolve, reject) => _storage.keys((error, keys) => {
            if (error) {
                reject(error);
            } else {
                resolve(keys);
            }
        }));
    }
};

export default Settings;
