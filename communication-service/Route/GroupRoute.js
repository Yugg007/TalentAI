import express from "express";
const router = express.Router();

import { GetGroupDetailCollectionInstance } from "../DbConfig/ConnectionConfig/DbConnection.js";


router.post("/createGroup", async (req, res) => {
    console.log("Creating group");
    const { groupName, members, admin } = req.body;

    if (!groupName || !members || !admin) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const collection = await GetGroupDetailCollectionInstance();
        const existingGroup = await collection.findOne({
            groupName: groupName
        });
        console.log("Existing group:", existingGroup);
        if (existingGroup) {
            return res.status(400).json({ error: "Group already exists" });
        }
        const newGroup = { groupName, members, admin, type: "group", timestamp: new Date() };
        await collection.insertOne(newGroup);
        res.status(201).json({ success: true, message: "Group created successfully" });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/fetchGroupDetails", async (req, res) => {
    console.log("Fetching group details");
    const username = req.body;
    try {
        const collection = await GetGroupDetailCollectionInstance();
        const groups = await collection.find().toArray();
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching group details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/checkMembership", async (req, res) => {
    console.log("Checking group membership");
    const { groupName, username } = req.body;

    if (!groupName || !username) {
        return res.status(400).json({ error: "Group name and username are required" });
    }

    try {
        const collection = await GetGroupDetailCollectionInstance();
        console.log("Checking membership for group:", groupName, "and user:", username);
        const group = await collection.findOne({ groupName: groupName });

        const member = group?.askToJoin?.includes(username);
        if(member){
            return res.status(200).json({ AskToJoin : true });
        }
        else{
            return res.status(200).json({ AskToJoin : false });
        }

    } catch (error) {
        console.error("Error checking membership:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/askToJoin", async (req, res) => {
    const { groupName, username } = req.body;
    console.log("Asking to join group :", groupName, "by user:", username);

    if (!groupName || !username) {
        return res.status(400).json({ error: "Group name and username are required" });
    }

    try {
        const collection = await GetGroupDetailCollectionInstance();
        const existingRequest = await collection.findOne({ groupName: groupName });

        if (existingRequest) {
            if (existingRequest.askToJoin?.includes(username)) {
                return res.status(400).json({ error: "User already asked to join the group" });
            }
            await collection.updateOne(
                { groupName: groupName },
                { $push: { askToJoin: username } }
            );
        }

        res.status(201).json({ success: true, message: "Request sent successfully" });
    } catch (error) {
        console.error("Error asking to join group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/updateAskToJoinStatus", async (req, res) => {
    const { groupName, user, action } = req.body;
    console.log("Updating ask to join status for user:", user, "in group:", groupName, "with action:", action);

    if (!groupName || !user || !action) {
        return res.status(400).json({ error: "Group name, user and action are required" });
    }

    try {
        const collection = await GetGroupDetailCollectionInstance();
        const group = await collection.findOne({ groupName: groupName });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        if (action === "approve") {
            await collection.updateOne(
                { groupName: groupName },
                { $pull: { askToJoin: user }, $push: { members: user } }
            );
        } else if (action === "reject") {
            await collection.updateOne(
                { groupName: groupName },
                { $pull: { askToJoin: user } }
            );
        } else {
            return res.status(400).json({ error: "Invalid action" });
        }

        res.status(200).json({ success: true, message: `User ${user} has been ${action === "approve" ? "approved" : "rejected"} successfully.` });
    } catch (error) {
        console.error("Error updating ask to join status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;