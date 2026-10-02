import express from 'express';
const router = express.Router();

import { PrivateMessageModel, GroupMessageModel } from '../DbConfig/ConnectionConfig/Schema.js';
import { GetPrivateMessageCollectionInstance, GetGroupMessageCollectionInstance } from '../DbConfig/ConnectionConfig/DbConnection.js';

router.post('/fetchPrivateMessage', async (req, res) => {
  const { username1, username2 } = req.body;
  if (!username1 || !username2) {
    return res.status(400).json({ error: 'username1 and username2 are required' });
  }

  try {
    const collection = await GetPrivateMessageCollectionInstance();
    const messages = await collection
      .find({
        $or: [
          { sender: username1, receiver: username2 },
          { sender: username2, receiver: username1 },
        ],
      })
      .sort({ timestamp: 1 })
      .toArray();

    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching private messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sendPrivateMessage', async (req, res) => {
  const { message, sender, receiver, type } = req.body;
  if (!message || !sender || !receiver) {
    return res.status(400).json({ error: 'message, sender, and receiver are required' });
  }

  try {
    const collection = await GetPrivateMessageCollectionInstance();
    const newMessage = new PrivateMessageModel({
      sender,
      receiver,
      message,
      type: type || 'text',
      timestamp: new Date(),
    });

    await collection.insertOne(newMessage);
    return res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending private message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/fetchGroupMessages', async (req, res) => {
  const { groupName } = req.body;
  if (!groupName) {
    return res.status(400).json({ error: 'groupName is required' });
  }

  try {
    const collection = await GetGroupMessageCollectionInstance();
    const messages = await collection.find({ groupName }).sort({ timestamp: 1 }).toArray();
    return res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/sendGroupMessage', async (req, res) => {
  const { message, sender, groupName, type } = req.body;
  if (!message || !sender || !groupName) {
    return res.status(400).json({ error: 'message, sender, and groupName are required' });
  }

  try {
    const collection = await GetGroupMessageCollectionInstance();
    const newMessage = new GroupMessageModel({
      sender,
      groupName,
      message,
      type: type || 'text',
      timestamp: new Date(),
    });

    await collection.insertOne(newMessage);
    return res.status(201).json({ success: true, message: 'Group message sent successfully' });
  } catch (error) {
    console.error('Error sending group message:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
