import dotenv from "dotenv";
import express from 'express';
import { getSystemPrompt } from '../core/prompts'
import { BASE_PROMPT } from '../config/basePrompt';
import {basePrompt as nodeBasePrompt} from "../support/node";
import {basePrompt as reactBasePrompt} from "../support/react";
import {basePrompt as nextBasePrompt} from "../support/next";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
const router = express.Router();
const apiKey = process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({ apiKey: apiKey});


router.post('/template', async (req, res) => {
    try {
        const {prompt} = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: 'user',
                    parts: [{text: prompt}]
                },
                {
                    role: 'model',
                    parts: [{text: "Return either 'node', 'react', or 'next' based on what you think this project should be. Only return a single word."}]
                }
            ]
        });
        if(response?.candidates?.length && response.candidates.length > 0){
            const streamText = response.candidates[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
            console.log("Model Response:", streamText);
            if (streamText === "react") {
                console.log(streamText);
                res.json({
                    prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                    ],
                    uiPrompts: [reactBasePrompt],
                });
                return;
            }

            if (streamText === "node") {
                console.log(streamText);
                res.json({
                    prompts: [
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                    ],
                    uiPrompts: [nodeBasePrompt],
                });
                return;
            }

            if (streamText === "next") {
                console.log(streamText);
                res.json({
                    prompts: [
                    BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                    ],
                    uiPrompts: [nextBasePrompt],
                });
                return;
            } 
            res.status(403).json({message: "You cant access this"})
            return;
        }
        res.status(500).json({ error: "No valid response from Gemini" });
    }catch(e){
        console.error("Error processing /template:", e);
        res.status(500).json({ error: "Error processing your request" });  
    }
})

router.post('/chat', async (req, res) => {
  try {
    const { contents } = req.body; 
    const formattedMessages = [
      {
        role: 'model',
        parts: [{text: getSystemPrompt()}]
      },
      ...contents,
    ];

    const chatResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: formattedMessages
    });

    if (chatResponse?.candidates?.length && chatResponse.candidates.length > 0) {
      const streamText = chatResponse.candidates[0]?.content?.parts?.[0]?.text?.trim();
      console.log('Chat:', streamText);
      res.json({ response: streamText });
    } else {
      res.status(500).json({ error: 'No response from AI service' });
    }
  } catch (error) {
    console.error('Error processing /chat:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
})

export default router;