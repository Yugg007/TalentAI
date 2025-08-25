// routes/messages.js
import express from "express";
const router = express.Router();

import { PrivateMessageModel, GroupMessageModel } from "../DbConfig/ConnectionConfig/Schema.js";
import { GetPrivateMessageCollectionInstance, GetGroupMessageCollectionInstance } from "../DbConfig/ConnectionConfig/DbConnection.js";

// GET all messages between two users
router.post("/fetchPrivateMessage", async (req, res) => {
    console.log("Fetching private messages between two users");
    console.log(req.body);
    
    const username1 = req.body.username1;
    const username2 = req.body.username2;
    console.log(`Fetching messages between ${username1} and ${username2}`);
    const Instance = await GetPrivateMessageCollectionInstance()
    const response = await Instance.find({
        $or: [
            { sender: username1, receiver: username2 },
            { sender: username2, receiver: username1 }
        ]
    }).toArray();
    console.log("Fetched messages:", response);
    res.status(200).json(response);
});

router.post("/sendPrivateMessage", async (req, res) => {
    console.log("Sending private message");
    const { message, sender, receiver, type } = req.body;

    if (!message || !sender || !receiver) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const collection = await GetPrivateMessageCollectionInstance();
        const newMessage = new PrivateMessageModel({ message, sender, receiver, type, timestamp: new Date() });
        await collection.insertOne(newMessage);
        res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Error sending private message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/fetchGroupMessages", async (req, res) => {
    console.log("Fetching group messages");
    const { groupName } = req.body;

    if (!groupName) {
        return res.status(400).json({ error: "Group name is required" });
    }

    try {
        const collection = await GetGroupMessageCollectionInstance();
        const messages = await collection.find({ groupName }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/sendGroupMessage", async (req, res) => {
    console.log("Sending group message");
    const { message, sender, groupName, type } = req.body;
    if (!message || !sender || !groupName) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const collection = await GetGroupMessageCollectionInstance();
        const newMessage = new GroupMessageModel({ message, sender, groupName, type, timestamp: new Date() });
        await collection.insertOne(newMessage);
        res.status(201).json({ success: true, message: "Group message sent successfully" });
    } catch (error) {
        console.error("Error sending group message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
