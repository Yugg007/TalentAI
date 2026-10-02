import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGO_URL;
if (!url) {
  throw new Error('MONGO_URL environment variable is required');
}

const client = new MongoClient(url, {
  serverSelectionTimeoutMS: 5000,
});

let privateMessageCollection;
let groupMessageCollection;
let groupDetailCollection;
let groupJoinRequestCollection;
let atsCachingCollection;

async function ConnectToMongo() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(process.env.MONGO_DB_NAME || 'TalentAI');
    privateMessageCollection = db.collection('Private-Messages');
    groupMessageCollection = db.collection('Group-Messages');
    groupDetailCollection = db.collection('Group-Details');
    groupJoinRequestCollection = db.collection('Group-Join-Requests');
    atsCachingCollection = db.collection('ATS-Caching');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

function ensureCollection(collection, name) {
  if (!collection) {
    throw new Error(`Collection ${name} not initialized. Call ConnectToMongo() first.`);
  }
  return collection;
}

async function GetPrivateMessageCollectionInstance() {
  return ensureCollection(privateMessageCollection, 'Private-Messages');
}

async function GetGroupMessageCollectionInstance() {
  return ensureCollection(groupMessageCollection, 'Group-Messages');
}

async function GetGroupDetailCollectionInstance() {
  return ensureCollection(groupDetailCollection, 'Group-Details');
}

async function GetGroupJoinRequestCollectionInstance() {
  return ensureCollection(groupJoinRequestCollection, 'Group-Join-Requests');
}

async function GetATSCachingCollectionInstance() {
  return ensureCollection(atsCachingCollection, 'ATS-Caching');
}

export {
  ConnectToMongo,
  GetPrivateMessageCollectionInstance,
  GetGroupMessageCollectionInstance,
  GetGroupDetailCollectionInstance,
  GetGroupJoinRequestCollectionInstance,
  GetATSCachingCollectionInstance,
};
