import express from 'express';

import { upload } from '../Utils/FileHandle.js';
import { AtsResponseFromCache, saveAtsResponseToCache } from '../DbConfig/CrudConfig/AtsCache.js';
import { callCohereAi, callCohereChatBot } from '../Apis/Cohere.js';
import hashData from '../Utils/HashData.js';
import { extractTextFromPdf } from '../Utils/ExtractText.js';

const router = express.Router();

router.post('/generateATSScore', upload.single('pdf'), async (req, res) => {
  const pdfFile = req.file;
  const titleText = req.body.titleText;
  const title = req.body.title?.trim() || 'Job Description';
  const prompt = req.body.prompt?.trim() || '';

  if (!pdfFile) {
    return res.status(400).json({ error: 'PDF file is missing' });
  }

  if (!titleText) {
    return res.status(400).json({ error: 'titleText is required' });
  }

  try {
    const extractedPdfText = await extractTextFromPdf(pdfFile);
    if (!extractedPdfText) {
      return res.status(500).json({ error: 'Unable to extract text from PDF' });
    }

    const pdfHash = hashData(extractedPdfText);
    const titleTextHash = hashData(titleText);

    const cacheResponse = await AtsResponseFromCache(pdfHash, titleTextHash);
    if (cacheResponse) {
      return res.status(200).json({ response: cacheResponse.content });
    }

    const requestStr = `My resume - ${extractedPdfText}. ${title} - ${titleText}. ${prompt}`;
    const content = await callCohereAi(requestStr);

    await saveAtsResponseToCache({ pdfHash, titleTextHash, content });
    return res.status(200).json({ response: content });
  } catch (error) {
    console.error('Error generating ATS score:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chatWithAI', async (req, res) => {
  let messages = req.body.messages;
  if (typeof messages === 'string') {
    try {
      messages = JSON.parse(messages);
    } catch (error) {
      return res.status(400).json({ error: 'messages must be valid JSON' });
    }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  try {
    const conversation = messages.reduce((acc, msg) => {
      if (msg.role === 'user') return `${acc}User: ${msg.content}\n`;
      if (msg.role === 'assistant') return `${acc}Assistant: ${msg.content}\n`;
      return acc;
    }, 'The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\n');

    const response = await callCohereChatBot(`${conversation}Assistant: `);
    return res.status(200).json({ reply: response });
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
