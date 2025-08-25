import  { GetPrivateMessageCollectionInstance, GetGroupMessageCollectionInstance } from '../ConnectionConfig/DbConnection.js';
import { PrivateMessageModel, GroupMessageModel } from '../ConnectionConfig/Schema.js';

const Message = {

};


const savePrivateMessage = async (message) => {
    try {
        const collection = await GetPrivateMessageCollectionInstance();
        const newMessage = new PrivateMessageModel(message);
        await collection.insertOne(newMessage);
        console.log("✅ Private message saved successfully");
    } catch (error) {
        console.error("❌ Error saving private message:", error);
    }
}

const saveGroupMessage = async (message) => {
    console.log("Saving group message:", message);
    try {
        const collection = await GetGroupMessageCollectionInstance();
        const newMessage = new GroupMessageModel(message);
        await collection.insertOne(newMessage);
        console.log("✅ Group message saved successfully");
    } catch (error) {
        console.error("❌ Error saving group message:", error);
    }
};

export { Message, savePrivateMessage, saveGroupMessage };