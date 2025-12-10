import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri: string = process.env.MONGODB_URI as string;
const client: MongoClient = new MongoClient(uri);

let db: Db | undefined;

export async function connectDB(): Promise<void> {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DBNAME as string);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}