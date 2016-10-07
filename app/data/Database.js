'use strict';

import Nedb from 'nedb';
import Path from 'path';

const { app } = require('electron').remote;

const SORTINGS = [
    { title         :  1 },
    { title         : -1 },
    { lastUpdatedAt :  1 },
    { lastUpdatedAt : -1 },
    { createdAt     :  1 },
    { createdAt     : -1 }
];

export default class Database {
    constructor() {
        this._db = undefined;
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
     * @returns {Promise}
     */
    findById(id) {
        return new Promise((resolve, reject) => {
            this._db.findOne({
                _id : id
            }, (error, doc) => {
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
     * @returns {Promise}
     */
    findAll(sorting, keyword) {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                fullText : new RegExp(keyword),
                archived : false
            } : {
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
     * Returns the number of all records excluding archived ones.
     * @returns {Promise}
     */
    countAll() {
        return new Promise((resolve, reject) => {
            this._db.count({
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
     * Returns starred records in the order specified by the given sorting.
     * @param {number} sorting
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findStarred(sorting, keyword) {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                fullText : new RegExp(keyword),
                starred  : true,
                archived : false
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
    countStarred() {
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
    findArchived(sorting, keyword) {
        return new Promise((resolve, reject) => {
            this._db.find(keyword ? {
                fullText : new RegExp(keyword),
                archived : true
            } : {
                archived : true
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
     * Returns the number of records archived.
     * @returns {Promise}
     */
    countArchived() {
        return new Promise((resolve, reject) => {
            this._db.count({
                archived : true
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
            this._db.find({
                archived : false
            }).projection({
                category : 1,
                _id      : 0
            }).sort({
                category : 1
            }).exec((error, docs) => {
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
     * Returns the records of the specified category.
     * @param {String} category The specific category of records to get.
     * @param {number} [sorting]
     * @param {String} [keyword] Filter the results by the matching keyword.
     * @returns {Promise}
     */
    findCategory(category, sorting, keyword) {
        return new Promise((resolve, reject) => {
            this._db.find({
                fullText : new RegExp(keyword),
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
    countCategory(category) {
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
                this._db.update({
                    _id : record._id
                }, record, {}, error => {
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
            this._db.remove({}, {
                multi : true
            }, error => {
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
                this._db.remove({
                    _id : id
                }, {}, error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(doc);
                    }
                });
            }).catch(error => reject(error));
        });
    }
}

module.exports = Database;
