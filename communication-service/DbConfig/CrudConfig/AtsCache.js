// communication-service/DbConfig/CrudConfig/AtsCache.js

import { GetATSCachingCollectionInstance } from "../ConnectionConfig/DbConnection.js";

export const saveAtsResponseToCache = async (data) => {
    try {
        const collection = await GetATSCachingCollectionInstance();
        await collection.insertOne(data);
        console.log("✅ Data saved to cache successfully");
    } catch (error) {
        console.error("❌ Error saving data to cache:", error);
    }
};

export const AtsResponseFromCache = async (pdfHash, jdHash) => {
    try {
        const collection = await GetATSCachingCollectionInstance();
        const result = await collection.findOne({ pdfHash, jdHash });
        return result;
    } catch (error) {
        console.error("❌ Error checking cache:", error);
        return false;
    }
};
