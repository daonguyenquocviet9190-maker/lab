import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment.");
  }

  const dbName = process.env.MONGODB_DB || "kyo-shop";

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  if (!clientPromise) {
    clientPromise = global._mongoClientPromise;
  }

  const client = await clientPromise;
  return client.db(dbName);
}
