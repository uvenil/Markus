// @flow
'use strict';

import NeDB from 'nedb';
import Path from 'path';
import indexOf from 'lodash.indexof';
import merge from 'lodash.merge';
import sortBy from 'lodash.sortby';

const { app } = require('electron').remote;

export default class Database {
    _db: NeDB;

    /**
     * Loads the database into memory.
     * @param {string} name The name of the database to load.
     * @return {Promise}
     */
    load(name : string) : Promise<*> {
        return new Promise((resolve, reject) => {
            if (this._db) {
                resolve();
            } else {
                this._db = new NeDB({
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
     * Gets the record specified by an unique ID in the database.
     * @param {string} id An unique ID associated with the record to find.
     * @return {Promise}
     */
    findById(id : string) : Promise<Object> {
        return new Promise((resolve, reject) => this._db.findOne({
            _id : id
        }, (error, doc) => {
            if (error) {
                reject(error);
            } else {
                resolve(doc);
            }
        }));
    }

    /**
     * Gets all records in the order specified by the give sorting.
     * @param {Object} sorting The sorting order.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    findAll(sorting : Object, keyword : ?string) : Promise<void|Object[]> {
        return new Promise((resolve, reject) => this._db.find(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : false
        } : {
            archived : false
        }).sort(sorting).exec((error, docs) => {
            if (error) {
                reject(error);
            } else if (docs[0] && Object.keys(docs[0]).length === 0) {
                resolve();
            } else {
                resolve(docs);
            }
        }));
    }

    /**
     * Gets the number of records excluding the archived ones.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    countAll(keyword : ?string) : Promise<number> {
        return new Promise((resolve, reject) => this._db.count(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : false
        } : {
            archived : false
        }, (error, count) => {
            if (error) {
                reject(error);
            } else {
                resolve(count);
            }
        }));
    }

    /**
     * Gets all the starred records in the order specified by the given sorting.
     * @param {Object} sorting The sorting order.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    findStarred(sorting : Object, keyword : ?string) : Promise<void|Object[]> {
        return new Promise((resolve, reject) => this._db.find(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            starred        : true,
            archived       : false
        } : {
            starred  : true,
            archived : false
        }).sort(sorting).exec((error, docs) => {
            if (error) {
                reject(error);
            } else if (docs[0] && Object.keys(docs[0]).length === 0) {
                resolve();
            } else {
                resolve(docs);
            }
        }));
    }

    /**
     * Returns the number of starred records.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    countStarred(keyword : ?string) : Promise<number> {
        return new Promise((resolve, reject) => this._db.count(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            starred        : true,
            archived       : false
        } : {
            starred  : true,
            archived : false
        }, (error, count) => {
            if (error) {
                reject(error);
            } else {
                resolve(count);
            }
        }));
    }

    /**
     * Gets all the records tagged by the specified hash-tag.
     * @param {string} hashTag The hash-tag the records is tagged by.
     * @param {Object} sorting The sorting order.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    findByHashTag(hashTag : string, sorting : Object, keyword : ?string) : Promise<void|Object[]> {
        return new Promise((resolve, reject) => this._db.find(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            hashTags       : hashTag,
            archived       : false
        } : {
            hashTags : hashTag,
            archived : false
        }).sort(sorting).exec((error, docs) => {
            if (error) {
                reject(error);
            } else {
                if (docs) {
                    if (docs[0] && Object.keys(docs[0]).length === 0) {
                        resolve();
                    } else {
                        resolve(docs);
                    }
                } else {
                    resolve();
                }
            }
        }));
    }

    /**
     * Gets the number of records tagged by the specified hash-tag.
     * @param {string} hashTag The hash-tag the records are tagged by.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    countHashTagged(hashTag : string, keyword : ?string) : Promise<number> {
        return new Promise((resolve, reject) => this._db.count(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            hashTags       : hashTag,
            archived       : false
        } : {
            hashTags : hashTag,
            archived : false
        }, (error, count) => {
            if (error) {
                reject(error);
            } else {
                resolve(count);
            }
        }));
    }

    /**
     * Gets all the archived records in the order specified by the given sorting.
     * @param {Object} sorting The sorting order.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    findArchived(sorting : Object, keyword : ?string) : Promise<void|Object[]> {
        return new Promise((resolve, reject) => this._db.find(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : true
        } : {
            archived : true
        }).sort(sorting).exec((error, docs) => {
            if (error) {
                reject(error);
            } else if (docs[0] && Object.keys(docs[0]).length === 0) {
                resolve();
            } else {
                resolve(docs);
            }
        }));
    }

    /**
     * Gets the number of archived records.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    countArchived(keyword : ?string) : Promise<number> {
        return new Promise((resolve, reject) => this._db.count(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : true
        } : {
            archived : true
        }, (error, count) => {
            if (error) {
                reject(error);
            } else {
                resolve(count);
            }
        }));
    }

    /**
     * Gets all the existing hash-tags.
     * @return {Promise}
     */
    findHashTags() : Promise<string[]> {
        return new Promise((resolve, reject) => this._db.find({
            archived : false
        }).projection({
            hashTags : 1
        }).exec((error, docs) => {
            if (error) {
                reject(error);
            } else {
                if (docs) {
                    if (docs[0] && Object.keys(docs[0]).length === 0) {
                        resolve([]);
                    } else {
                        const merged = {
                            hashTags : []
                        };

                        docs.forEach(doc => merge(merged, doc));

                        resolve(sortBy(merged.hashTags));
                    }
                } else {
                    resolve([]);
                }
            }
        }));
    }

    /**
     * Returns true if the specified hash-tag exists in the database; otherwise, returns false.
     * @param {string} hashTag The hash-tag to check for existence.
     * @return {Promise}
     */
    hasHashTag(hashTag : string) : Promise<boolean> {
        return new Promise((resolve, reject) => this.findHashTags().then(hashTags => resolve(indexOf(hashTags, hashTag) >= 0)).catch(error => reject(error)));
    }

    /**
     * Updates a record in the database, or add it if it does not exist.
     * @param {Object} doc The record to add or update.
     * @return {Promise}
     */
    addOrUpdate(doc : Object) : Promise<Object> {
        return new Promise((resolve, reject) => {
            if (doc._id) {
                this._db.update({
                    _id : doc._id
                }, doc, {}, error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(doc);
                    }
                });
            } else {
                this._db.insert(doc, (error, d) => {
                    if (error) {
                        reject(error);
                    } else {
                        doc._id = d._id;

                        resolve(d);
                    }
                });
            }
        });
    }

    /**
     * Removes a record specified by its associated unique ID from the database.
     * @param {string} id An unique ID associated with the record to be removed.
     * @return {Promise}
     */
    removeById(id : string) : Promise<Object> {
        return new Promise((resolve, reject) => this.findById(id).then(doc => this._db.remove({
            _id : id
        }, {}, error => {
            if (error) {
                reject(error);
            } else {
                resolve(doc);
            }
        })).catch(error => reject(error)));
    }

    /**
     * Removes all records in the database.
     * @return {Promise}
     */
    removeAll() : Promise<*> {
        return new Promise((resolve, reject) => this._db.remove({}, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Removes all archived records from the database.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    removeArchived(keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.remove(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : true
        } : {
            archived : true
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Archives a record specified by its associated unique ID in the database.
     * @param {string} id An unique ID associated to the record to be removed.
     * @return {Promise}
     */
    archiveById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update({
            _id : id
        }, {
            $set : {
                archived : true
            }
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Archives all records in the database.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    archiveAll(keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : false
        } : {
            archived : false
        }, {
            $set : {
                archived : true
            }
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Archives all records tagged by the specified hash-tag.
     * @param {string} hashTag The hash-tag the records are tagged by.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    archiveByHashTag(hashTag : string, keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            hashTags       : hashTag,
            archived       : false
        } : {
            hashTags : hashTag,
            archived : false
        }, {
            $set : {
                archived : true
            }
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Archives all starred records.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    archiveStarred(keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            starred        : true,
            archived       : false
        } : {
            starred  : true,
            archived : false
        }, {
            $set : {
                archived : true
            }
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Un-archives the record associated with the specified ID.
     * @param {string} id A unique ID associated with the record to un-archive.
     * @return {Promise}
     */
    unarchiveById(id : string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update({
            _id      : id,
            archived : true
        }, {
            $set : {
                archived : false
            }
        }, {}, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }

    /**
     * Un-archive all the archived records.
     * @param {string} [keyword] The keyword to filter the results.
     * @return {Promise}
     */
    unarchiveAll(keyword : ?string) : Promise<*> {
        return new Promise((resolve, reject) => this._db.update(keyword ? {
            searchableText : new RegExp(keyword.toLowerCase()),
            archived       : true
        } : {
            archived : true
        }, {
            $set : {
                archived : false
            }
        }, {
            multi : true
        }, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }));
    }
}
