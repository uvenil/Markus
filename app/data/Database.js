'use strict';

import Nedb from 'nedb';
import Path from 'path';
import Settings from '../utils/Settings';
import _ from 'lodash';

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
    constructor() {
        this._db       = undefined;
        this._settings = new Settings();
    }

    /**
     * Loads the database into memory.
     * @param {String} name The name of the database.
     * @return {Promise}
     */
    load(name) {
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
    findById(id) {
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
    findAll(sorting, keyword) {
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
    countAll() {
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
     * @param {number} sorting
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByStarred(sorting, keyword) {
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
    countByStarred() {
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
     * @param {number} sorting
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByArchived(sorting, keyword) {
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
    countByArchived() {
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
     * @param {number} sorting
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findByCategory(category, sorting, keyword) {
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
    countByCategory(category) {
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
    findCategories() {
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
    hasCategory(category) {
        return new Promise((resolve, reject) => {
            this.findCategories()
                .then(categories => {
                    resolve(_.indexOf(categories, category) >= 0);
                }).catch(error => reject(error));
        });
    }

    /**
     * Adds a new category
     * @param {String} category The category to add.
     */
    addCategory(category) {
        return new Promise((resolve, reject) => {
            this.hasCategory(category)
                .then(hasCategory => {
                    if (hasCategory) {
                        reject(new Error('Duplicate category: ' + category));
                    } else {
                        this.findCategories()
                            .then(categories => {
                                categories.push(category);

                                categories = _.sortBy(categories);

                                this._settings.set(_KEY_CATEGORIES, categories)
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
    updateCategory(oldCategory, newCategory) {
        return new Promise((resolve, reject) => {
            this.hasCategory(oldCategory)
                .then(hasCategory => {
                    if (hasCategory) {
                        this.findCategories()
                            .then(categories => {
                                categories = _.pull(categories, oldCategory);
                                categories.push(newCategory);
                                categories = _.sortBy(categories);

                                this._settings.set(_KEY_CATEGORIES, categories)
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
                        reject(new Error('No such category: ' + category));
                    }
                }).catch(error => reject(error));
        });
    }

    /**
     * Removes a category.
     * @param {String} category The category to remove.
     * @param {boolean} [withNotes] Whether to archive notes of the specified category in the deletion.
     */
    removeCategory(category, withNotes) {
        return new Promise((resolve, reject) => {
            this.hasCategory(category)
                .then(hasCategory => {
                    if (hasCategory) {
                        this.findCategories()
                            .then(categories => {
                                categories = _.pull(categories, category);

                                this._settings.set(_KEY_CATEGORIES, categories)
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
    addOrUpdate(record) {
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
    removeAll() {
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
    removeById(id) {
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
    archiveById(id) {
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
     * Archives all notes (except those starred and archived).
     * @returns {Promise}
     */
    archiveByEverything() {
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
    archiveByStarred() {
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
    removeByArchived() {
        return new Promise((resolve, reject) => {
            this._db.remove({ archived : true }, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(doc);
                }
            });
        });
    }

    /**
     * Archives records of specified category.
     * @param {String} category
     * @returns {Promise}
     */
    archiveByCategory(category) {
        return new Promise((resolve, reject) => {
            this._db.update({
                category : category,
                archived : false
            }, { $set : { archived : true }}, { multi : true }, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(doc);
                }
            });
        });
    }

    /**
     * Un-archives all archived notes.
     * @return {Promise}
     */
    unarchiveAll() {
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
    unarchiveById(id) {
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

module.exports = Database;
