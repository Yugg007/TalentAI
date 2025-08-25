import express from "express";

import { upload } from "../Utils/FileHandle.js";
import { AtsResponseFromCache, saveAtsResponseToCache } from "../DbConfig/CrudConfig/AtsCache.js";
import { callCohereAi, callCohereChatBot } from "../Apis/Cohere.js";
import hashData from "../Utils/HashData.js";
import { extractTextFromPdf } from "../Utils/ExtractText.js";

const router = express.Router();

router.post("/generateATSScore", upload.single('pdf'), async (req, res) => {
    const pdfFile = req.file;
    const titleText = req.body.titleText;
    const title = req.body.title || "Job Description";
    const prompt = req.body.prompt;



    console.log("Received titleText:", titleText);
    console.log("Received title:", title);
    console.log("Received prompt:", prompt);


    if (!pdfFile) {
        return res.status(400).json({ error: 'PDF file is missing' });
    }

    if (!titleText) {
        return res.status(400).json({ error: 'Text is missing' });
    }

    const extractedPdfText = await extractTextFromPdf(pdfFile);

    const pdfHash = hashData(extractedPdfText);
    const titleTextHash = hashData(titleText);
    console.log(pdfHash);
    console.log(titleTextHash);

    const cacheResponse = await AtsResponseFromCache(pdfHash, titleTextHash);
    if (cacheResponse) {
        console.log("Cache hit");
        return res.status(200).json({ response: cacheResponse?.content });
    }

    const requestStr = "My resume - " + extractedPdfText + ". " + title + " - " + titleText + ". " + prompt + ". ";
    console.log("Request string to Cohere AI:", requestStr);
    const content = await callCohereAi(requestStr);
    console.log("Cohere AI response:", content?.toString());


    saveAtsResponseToCache({ pdfHash, titleTextHash, content });
    res.status(200).json({ response: content });
});


router.post("/chatWithAI", async (req, res) => {
    const messages = JSON.parse(req.body.messages);

    if (!messages) {
        return res.status(400).json({ error: 'Messages is missing' });
    }


    let conversation = "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n";

    messages?.forEach((msg) => {
        if (msg.role === "user") {
            conversation += `User: ${msg.content}\n`;
        } else if (msg.role === "assistant") {
            conversation += `Assistant: ${msg.content}\n`;
        }
    });

    console.log("Full conversation:", conversation);

    const response = await callCohereChatBot(conversation + "Assistant: ");
    console.log("Cohere AI chat response:", response);

    res.status(200).send({ reply: response});
});

export default router;
