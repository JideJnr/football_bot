"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToDB = saveToDB;
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'bot_football';
const collectionName = process.env.MONGODB_COLLECTION || 'bot_data';
let client = null;
function getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!client) {
            client = new mongodb_1.MongoClient(uri);
            yield client.connect();
        }
        return client;
    });
}
/**
 * Saves data to MongoDB. Supports single object or array of objects.
 * @param data Object or array of objects to save.
 * @returns Inserted IDs.
 */
function saveToDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = yield getClient();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            if (Array.isArray(data)) {
                if (data.length === 0)
                    return [];
                const result = yield collection.insertMany(data);
                console.log('Saved to MongoDB:', result.insertedIds);
                return Object.values(result.insertedIds).map(id => id.toString());
            }
            else {
                const result = yield collection.insertOne(data);
                console.log('Saved to MongoDB:', result.insertedId);
                return result.insertedId.toString();
            }
        }
        catch (error) {
            console.error('MongoDB save error:', error);
            if (client)
                yield client.close();
            throw error;
        }
    });
}
