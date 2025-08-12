import { MongoClient } from 'mongodb';
import { addLog } from '../util/logger';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'bot_football';
const collectionName = process.env.MONGODB_COLLECTION || 'bot_data';

let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function saveToDB(data: any) {
  try {
    const client = await getClient();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(data);
    addLog(`Saved to MongoDB: ${ result.insertedId} `);
    return result.insertedId;
  } catch (error) {
    console.error('MongoDB save error:', error);
    throw error;
  }
}