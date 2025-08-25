// dbConnect.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

let privateMessageCollection; 
let groupMessageCollection;
let groupDetailCollection;
let groupJoinRequestCollection;
let atsCachingCollection
  
async function ConnectToMongo() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db("TalentAI");
        privateMessageCollection = db.collection("Private-Messages");
        groupMessageCollection = db.collection("Group-Messages");
        groupDetailCollection = db.collection("Group-Details");
        groupJoinRequestCollection = db.collection("Group-Join-Requests");
        atsCachingCollection = db.collection("ATS-Caching");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

// Function to get the collection
async function GetPrivateMessageCollectionInstance() {
    if (!privateMessageCollection) {
        throw new Error("Collection not initialized. Call ConnectToMongo() first.");
    }
    return privateMessageCollection;
}
async function GetGroupMessageCollectionInstance() {
    if (!groupMessageCollection) {
        throw new Error("Collection not initialized. Call ConnectToMongo() first.");
    }
    return groupMessageCollection;
}

async function GetGroupDetailCollectionInstance() {
    if (!groupDetailCollection) {
        throw new Error("Collection not initialized. Call ConnectToMongo() first.");
    }
    return groupDetailCollection;
}

async function GetGroupJoinRequestCollectionInstance() {
    if (!groupJoinRequestCollection) {
        throw new Error("Collection not initialized. Call ConnectToMongo() first.");
    }
    return groupJoinRequestCollection;
}

async function GetATSCachingCollectionInstance() {
    if (!atsCachingCollection) {
        throw new Error("Collection not initialized. Call ConnectToMongo() first.");
    }
    return atsCachingCollection;
}


export {
    ConnectToMongo,
    GetPrivateMessageCollectionInstance,
    GetGroupMessageCollectionInstance,
    GetGroupDetailCollectionInstance,
    GetGroupJoinRequestCollectionInstance,
    GetATSCachingCollectionInstance
};
