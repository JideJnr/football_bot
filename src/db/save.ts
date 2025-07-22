import { MongoClient, InsertOneResult, InsertManyResult } from 'mongodb';

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

/**
 * Saves data to MongoDB. Supports single object or array of objects.
 * @param data Object or array of objects to save.
 * @returns Inserted IDs.
 */
export async function saveToDB(data: any | any[]): Promise<string[] | string> {
  try {
    const client = await getClient();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    if (Array.isArray(data)) {
      if (data.length === 0) return [];
      const result: InsertManyResult = await collection.insertMany(data);
      console.log('Saved to MongoDB:', result.insertedIds);
      return Object.values(result.insertedIds).map(id => id.toString());
    } else {
      const result: InsertOneResult = await collection.insertOne(data);
      console.log('Saved to MongoDB:', result.insertedId);
      return result.insertedId.toString();
    }
  } catch (error) {
    console.error('MongoDB save error:', error);
    if (client) await client.close();
    throw error;
  }
}