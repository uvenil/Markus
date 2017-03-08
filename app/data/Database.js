// @flow
'use strict';

import Nedb from 'nedb';
import Settings from '../utils/Settings';
import Path from 'path';
import indexOf from 'lodash.indexof';
import pull from 'lodash.pull';
import sortBy from 'lodash.sortby';

const { app } = require('electron').remote;

const SORTINGS = [
    { title         :  1 },
    { title         : -1 },
    { lastUpdatedAt :  1 },
    { lastUpdatedAt : -1 },
    { createdAt     :  1 },
    { createdAt     : -1 }
];

const _KEY_CATEGORIES = '_categories';

export default class Database {
    _db       : Nedb;
    _settings : Settings;

    constructor() {
        this._db       = undefined;
        this._settings = new Settings();
    }

    /**
     * Loads the database into memory.
     * @param {String} name The name of the database.
     * @return {Promise}
     */
    load(name : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            if (this._db) {
                resolve();
            } else {
                this._db = new Nedb({
                    filename : Path.join(app.getPath('userData'), name)
                });

                this._db.loadDatabase(error => {
                    if (error) {
                        reject(error);
                    } else {
                        this._db.ensureIndex({
                            fieldName : 'title',
                            sparse    : true
                        }, error => {
                            if (error) console.error(error);
                        });

                        this._db.ensureIndex({
                            fieldName : 'category',
                            sparse    : true
                        }, error => {
                            if (error) console.error(error);
                        });

                        this._db.ensureIndex({
                            fieldName : 'lastUpdatedAt',
                            sparse    : true
                        }, error => {
                            if (error) console.error(error);
                        });

                        this._db.ensureIndex({
                            fieldName : 'createdAt',
                            sparse    : true
                        }, error => {
                            if (error) console.error(error);
                        });

                        resolve();
                    }
                });
            }
        });
    }

    /**
     * Returns the record specified by an unique ID in the database.
     * @param {String} id An unique ID of the record to find.
     * @return {Promise}
     */
    findById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.findOne({ _id : id }, (error, doc) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(doc);
                }
            });
        });
    }

    /**
     * Returns all records in the order specified by the give sorting.
     * @param {number} sorting One of the pre-defined sorting.
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @return {Promise}
     */
    findAll(sorting : number, keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                searchableText : new RegExp(keyword.toLowerCase()),
                archived       : false
            } : { archived : false }).sort(SORTINGS[sorting]).exec((error, docs) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    /**
     * Returns the number of all records excluding archived ones.
     * @returns {Promise}
     */
    countAll() : Promise<number> {
        return new Promise((resolve, reject) => {
            this._db.count({ archived : false }, (error, count) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(count);
                }
            });
        });
    }

    /**
     * Returns starred records in the order specified by the given sorting.
     * @param {number} sorting The sorting order.
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByStarred(sorting : number, keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                searchableText : new RegExp(keyword.toLowerCase()),
                starred        : true,
                archived       : false
            } : {
                starred  : true,
                archived : false
            }).sort(SORTINGS[sorting]).exec((error, docs) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    /**
     * Returns the number of records starred.
     * @returns {Promise}
     */
    countByStarred() : Promise<number> {
        return new Promise((resolve, reject) => {
            this._db.count({
                starred  : true,
                archived : false
            }, (error, count) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(count);
                }
            });
        });
    }

    /**
     * Returns archived records in the order specified by the given sorting.
     * @param {number} sorting The sorting order.
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByArchived(sorting : number, keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                searchableText : new RegExp(keyword.toLowerCase()),
                archived       : true
            } : { archived : true }).sort(SORTINGS[sorting]).exec((error, docs) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    /**
     * Returns the number of records archived.
     * @returns {Promise}
     */
    countByArchived() : Promise<number> {
        return new Promise((resolve, reject) => {
            this._db.count({ archived : true }, (error, count) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(count);
                }
            });
        });
    }

    /**
     * Returns the records of the specified category.
     * @param {String} category The specific category of records to get.
     * @param {number} sorting The sorting order.
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByCategory(category : string, sorting : number, keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                searchableText : new RegExp(keyword.toLowerCase()),
                category       : category,
                archived       : false
            } : {
                category : category,
                archived : false
            }).sort(SORTINGS[sorting]).exec((error, docs) => {
                if (error) {
                    reject(error);
                } else {
                    if (docs) {
                        if (docs[0] && Object.keys(docs[0]).length === 0) {
                            resolve(undefined);
                        } else {
                            resolve(docs);
                        }
                    } else {
                        resolve(undefined);
                    }
                }
            });
        });
    }

    /**
     * Returns the number of records that belong to the specified category.
     * @param {String} category
     * @returns {Promise}
     */
    countByCategory(category : string) : Promise<number> {
        return new Promise((resolve, reject) => {
            this._db.count({
                category : category,
                archived : false
            }, (error, count) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(count);
                }
            });
        });
    }

    /**
     * Returns all categories.
     * @returns {Promise}
     */
    findCategories() : Promise<string[]> {
        return new Promise((resolve, reject) => {
            this._settings.get(_KEY_CATEGORIES, [])
                .then(categories => resolve(categories && categories.length > 0 ? categories : []))
                .catch(error => reject(error));
        });
    }

    /**
     * Returns true if the specified category exist.
     * @param {String} category The category to check for existence.
     * @return {Promise}
     */
    hasCategory(category : string) : Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.findCategories()
                .then(categories => {
                    resolve(indexOf(categories, category) >= 0);
                }).catch(error => reject(error));
        });
    }

    /**
     * Adds a new category
     * @param {String} category The category to add.
     */
    addCategory(category : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this.hasCategory(category)
                .then(hasCategory => {
                    if (hasCategory) {
                        reject(new Error('Duplicate category: ' + category));
                    } else {
                        this.findCategories()
                            .then(categories => {
                                categories.push(category);

                                this._settings.set(_KEY_CATEGORIES, sortBy(categories))
                                    .then(() => resolve())
                                    .catch(error => reject(error));
                            }).catch(error => reject(error));
                    }
                }).catch(error => reject(error));
        });
    }

    /**
     * Updates an existing category with the specified category.
     * @param {String} oldCategory An existing category to update.
     * @param {String} newCategory The category to update.
     * @returns {Promise}
     */
    updateCategory(oldCategory : string, newCategory : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this.hasCategory(oldCategory)
                .then(hasCategory => {
                    if (hasCategory) {
                        this.findCategories()
                            .then(categories => {
                                const newCategories = pull(categories, oldCategory);
                                newCategories.push(newCategory);

                                this._settings.set(_KEY_CATEGORIES, sortBy(newCategories))
                                    .then(() => {
                                        this._db.update({ category : oldCategory }, { $set : { category : newCategory }}, { multi : true }, error => {
                                            if (error) {
                                                reject(error);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    }).catch(error => reject(error));
                            }).catch(error => reject(error));
                    } else {
                        reject(new Error('No such category: ' + oldCategory));
                    }
                }).catch(error => reject(error));
        });
    }

    /**
     * Removes a category.
     * @param {String} category The category to remove.
     * @param {boolean} [withNotes] Whether to archive notes of the specified category in the deletion.
     */
    removeCategory(category : string, withNotes : ?boolean) : Promise<*> {
        return new Promise((resolve, reject) => {
            this.hasCategory(category)
                .then(hasCategory => {
                    if (hasCategory) {
                        this.findCategories()
                            .then(categories => {
                                this._settings.set(_KEY_CATEGORIES, pull(categories, category))
                                    .then(() => {
                                        if (withNotes) {
                                            this._db.update({ category : category }, { $set : {
                                                category : null,
                                                archived : true
                                            }}, { multi : true }, error => {
                                                if (error) {
                                                    reject(error);
                                                } else {
                                                    resolve();
                                                }
                                            });
                                        } else {
                                            this._db.update({ category : category }, { $set : { category : null }}, { multi : true }, error => {
                                                if (error) {
                                                    reject(error);
                                                } else {
                                                    resolve();
                                                }
                                            });
                                        }
                                    }).catch(error => reject(error));
                            });
                    } else {
                        reject(new Error('No such category: ' + category));
                    }
                }).catch(error => reject(error));
        });
    }

    /**
     * Updates a record in the database, or add it if it does not exist.
     * @param {object} record The record to add or update.
     * @returns {Promise}
     */
    addOrUpdate(record : any) : Promise<*> {
        return new Promise((resolve, reject) => {
            if (!record._id) {
                this._db.insert(record, (error, doc) => {
                    if (error) {
                        reject(error);
                    } else {
                        record._id = doc._id;

                        resolve(doc);
                    }
                });
            } else {
                this._db.update({ _id : record._id }, record, {}, error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(record);
                    }
                });
            }
        });
    }

    /**
     * Removes all records from the database.
     * @returns {Promise}
     */
    removeAll() : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.remove({}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Removes a record specified by its unique ID from the database.
     * @param {String} id An unique ID of the record to be removed.
     * @returns {Promise}
     */
    removeById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this.findById(id).then(doc => {
                this._db.remove({ _id : id }, {}, error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(doc);
                    }
                });
            }).catch(error => reject(error));
        });
    }

    /**
     * Archives a record specified by its unique ID from the database.
     * @param {String} id An unique ID of the record to be removed.
     * @return {Promise}
     */
    archiveById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({ _id : id }, { $set : { archived : true }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Archives all notes (except those already archived).
     * @returns {Promise}
     */
    archiveByEverything() : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({ archived : false }, { $set : { archived : true }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Archives all starred notes.
     * @returns {Promise}
     */
    archiveByStarred() : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({
                starred  : true,
                archived : false
            }, { $set : { archived : true }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Removes all archived notes.
     * @returns {Promise}
     */
    removeByArchived() : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.remove({ archived : true }, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Archives records of specified category.
     * @param {String} category
     * @returns {Promise}
     */
    archiveByCategory(category : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({
                category : category,
                archived : false
            }, { $set : { archived : true }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Un-archives all archived notes.
     * @return {Promise}
     */
    unarchiveAll() : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({ archived : true }, { $set : { archived : false }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Un-archives the note with the specified ID.
     * @param {String} id The unique ID of the note to un-archive.
     * @return {Promise}
     */
    unarchiveById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            this._db.update({
                _id      : id,
                archived : true
            }, { $set : { archived : false }}, {}, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
