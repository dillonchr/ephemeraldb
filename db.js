const { connect } = require('mongodb').MongoClient;

const DISCONNECT_TIMEOUT = process.env.DB_DISCONNECT_TIMEOUT || 5000;

const DEFAULT_BOOLEAN_RES_CALLBACK = (err, didSucceed) => {};

module.exports = {
    client: null,
    autoCloseDbTimer: null,
    getDb(onResponse) {
        clearTimeout(this.autoCloseDbTimer);

        this.autoCloseDbTimer = setTimeout(() => this.closeDb(), DISCONNECT_TIMEOUT);

        if (this.client) {
            onResponse(null, this.client.db(process.env.DB_NAME));
        } else {
            connect(decodeURI(process.env.DB_URI), (err, client) => {
                if (err) {
                    onResponse(err);
                } else {
                    this.client = client;
                    onResponse(null, client.db(process.env.DB_NAME));
                }
            });
        }
    },
    closeDb(onResponse = DEFAULT_BOOLEAN_RES_CALLBACK) {
        if (this.client) {
            this.client.close(false, err => {
                if (err) {
                    onResponse(err);
                } else {
                    this.client = null;
                }
                onResponse(err);
            });
        }
    },
    getCollection(name, onResponse) {
        this.getDb((err, db) => {
            if (err) {
                onResponse(err);
            } else {
                db.collection(name, onResponse);
            }
        })
    },
    findDocumentsInCollection(collection, search = {}, options = {}, onResponse) {
        this.getCollection(collection, (err, coll) => {
            if (err) {
                onResponse(err);
            } else {
                coll.find(search, options).toArray(onResponse);
            }
        });
    },
    getAllDocumentsInCollection(name, onResponse) {
        this.findDocumentsInCollection(name, {}, {}, onResponse);
    },
    insertMany(collection, documents, onResponse = DEFAULT_BOOLEAN_RES_CALLBACK) {
        this.getCollection(collection, (err, coll) => {
            if (err) {
                onResponse(err);
            } else {
                coll.insertMany(documents, onResponse);
            }
        });
    },
    updateMany(collection, filter, update, onResponse = DEFAULT_BOOLEAN_RES_CALLBACK) {
        this.getCollection(collection, (err, coll) => {
            if (err) {
                onResponse(err);
            } else {
                coll.updateMany(filter, update, onResponse);
            }
        });
    },
    replaceDocument(collection, search, document, onResponse) {
        this.getCollection(collection, (err, coll) => {
            if (err) {
                onResponse(err);
            } else {
                coll.update(search, document, onResponse);
            }
        });
    },
    findItemInCollection(collection, searchOptions, onResponse) {
        this.getCollection(collection, (err, coll) => {
            if (err) {
                onResponse(err);
            } else {
                coll.findOne(searchOptions, onResponse);
            }
        });
    },
    hasItemInCollection(collection, searchOptions, onResponse) {
        this.findItemInCollection(collection, searchOptions, (err, item) => {
            onResponse(err, !!item);
        });
    }
};
