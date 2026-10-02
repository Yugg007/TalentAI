import { GetPrivateMessageCollectionInstance, GetGroupMessageCollectionInstance } from '../ConnectionConfig/DbConnection.js';
import { PrivateMessageModel, GroupMessageModel } from '../ConnectionConfig/Schema.js';

const savePrivateMessage = async (message) => {
  const collection = await GetPrivateMessageCollectionInstance();
  const newMessage = new PrivateMessageModel({
    sender: message.sender,
    receiver: message.receiver,
    message: message.message,
    type: message.type || 'text',
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  });
  const result = await collection.insertOne(newMessage);
  return result;
};

const saveGroupMessage = async (message) => {
  const collection = await GetGroupMessageCollectionInstance();
  const newMessage = new GroupMessageModel({
    sender: message.sender,
    groupName: message.groupName,
    message: message.message,
    members: message.members,
    type: message.type || 'text',
    timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
  });
  const result = await collection.insertOne(newMessage);
  return result;
};

export { savePrivateMessage, saveGroupMessage };
