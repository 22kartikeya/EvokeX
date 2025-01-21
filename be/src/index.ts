import dotenv from "dotenv";
dotenv.config();
import { Mistral } from '@mistralai/mistralai';
import { getSystemPrompt } from './prompts';
import { BASE_PROMPT } from './basePrompt';
import {basePrompt as nodeBasePrompt} from "./support/node";
import {basePrompt as reactBasePrompt} from "./support/react";
import express from 'express';
const app = express();
const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({apiKey: apiKey});
const PORT = 3000;
app.use(express.json());

app.post('/template', async (req, res) => {
  const prompt = req.body.prompt;
  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'user',
        content: prompt
      },
      {
        role: 'system',
        content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
      },
    ],
  });

  if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
    const streamText = chatResponse.choices[0].message.content;
     if (streamText == "react") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if (streamText === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }
    res.status(403).json({message: "You cant access this"})
    return;
  } else {
    console.error('No choices returned in chat response');
  }
})

app.post('/chat', async (req, res) => {
  const message = req.body.message;
  const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'user',
        content: message
      },
      {
        role: 'system',
        content: getSystemPrompt()
      },
    ],
    temperature: 0.1,
  });
  if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0){
    const streamText = chatResponse.choices[0].message.content;
    console.log('Chat:', streamText);
  }else{
    res.status(500).json({ error: 'No response from AI service' });
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})

// for await (const chunk of chatResponse) {
    //   const streamText = chunk.data.choices[0].delta.content;
    //   process.stdout.write(streamText as string);
    // }