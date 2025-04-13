// import dotenv from "dotenv";
// import express from 'express';
// import Bottleneck from "bottleneck";
// import { Mistral } from '@mistralai/mistralai';
// import { getSystemPrompt } from '../core/prompts'
// import { BASE_PROMPT } from '../config/basePrompt';
// import {basePrompt as nodeBasePrompt} from "../support/node";
// import {basePrompt as reactBasePrompt} from "../support/react";
// import {basePrompt as nextBasePrompt} from "../support/next";
// dotenv.config();

// const router = express.Router();
// const apiKey = process.env.MISTRAL_API_KEY;
// const client = new Mistral({apiKey: apiKey});

// const limiter = new Bottleneck({
//   maxConcurrent: 1,
//   minTime: 1000,
// });

// const limitedChatComplete = limiter.wrap((options: any) => client.chat.complete(options));

// router.post('/template', async (req, res) => {
//   try{
//     const { prompt } = req.body;
//     const chatResponse = await limitedChatComplete({
//     model: 'mistral-large-latest',
//     messages: [
//       {
//         role: 'user',
//         content: prompt
//       },
//       {
//         role: 'system',
//         content: "Return either 'node', 'react', or 'next' based on what you think this project should be. Only return a single word."
//       },
//       ],
//     });

//     if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
//       const streamText = chatResponse.choices[0].message.content;
//       if (streamText == "react") {
//         console.log(streamText);
//           res.json({
//               prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//               uiPrompts: [reactBasePrompt]
//           })
//           return;
//       }

//       if (streamText === "node") {
//         console.log(streamText);
//           res.json({
//               prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//               uiPrompts: [nodeBasePrompt]
//           })
//           return;
//       }

//       if (streamText == "next") {
//         console.log(streamText);
//           res.json({
//               prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//               uiPrompts: [nextBasePrompt]
//           })
//           return;
//       }
//       res.status(403).json({message: "You cant access this"})
//       return;
//     } else {
//       console.error('No choices returned in chat response');
//     }
//   } catch (error) {
//     console.error('Error processing /template:', error);
//     res.status(500).json({ error: 'Error processing your request' });
//   }
// })

// router.post('/chat', async (req, res) => {
//   try {
//     const messages = req.body.messages;
//     const formattedMessages = [
//       {
//         role: 'system',
//         content: getSystemPrompt(),
//       },
//       ...messages,
//     ];

//     const chatResponse = await limitedChatComplete({
//       model: 'mistral-large-latest',
//       messages: formattedMessages,
//       temperature: 0.1,
//       tokenLimit: 10000
//     });

//     if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
//       const streamText = chatResponse.choices[0].message.content;
//       console.log('Chat:', streamText);
//       res.json({ response: streamText });
//     } else {
//       res.status(500).json({ error: 'No response from AI service' });
//     }
//   } catch (error) {
//     console.error('Error processing /chat:', error);
//     res.status(500).json({ error: 'Error processing your request' });
//   }
// })

// export default router;

import dotenv from "dotenv";
import express from 'express';
import Bottleneck from "bottleneck";
import { Mistral } from '@mistralai/mistralai';
import { getSystemPrompt } from '../core/prompts';
import { BASE_PROMPT } from '../config/basePrompt';
import { basePrompt as nodeBasePrompt } from "../support/node";
import { basePrompt as reactBasePrompt } from "../support/react";
import { basePrompt as nextBasePrompt } from "../support/next";

dotenv.config();

const router = express.Router();
const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
});

const limitedChatComplete = limiter.wrap((options: any) => client.chat.complete(options));

// Retry wrapper with exponential backoff
async function safeChatComplete(options: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await limitedChatComplete(options);
    } catch (err: any) {
      if (err.statusCode === 429 && i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
        console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(res => setTimeout(res, waitTime));
      } else {
        throw err;
      }
    }
  }
}

router.post('/template', async (req, res) => {
  try {
    const { prompt } = req.body;

    const chatResponse = await safeChatComplete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'system',
          content: "Return either 'node', 'react', or 'next' based on what you think this project should be. Only return a single word."
        },
      ],
    });

    if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
      const streamText = chatResponse.choices[0].message.content.trim().toLowerCase();

      if (streamText === "react") {
        console.log(streamText);
        res.json({
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [reactBasePrompt]
        });
        return;
      }

      if (streamText === "node") {
        console.log(streamText);
        res.json({
          prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [nodeBasePrompt]
        });
        return;
      }

      if (streamText === "next") {
        console.log(streamText);
        res.json({
          prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nextBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
          uiPrompts: [nextBasePrompt]
        });
        return;
      }

      res.status(403).json({ message: "You can't access this" });
      return;
    } else {
      console.error('No choices returned in chat response');
      res.status(500).json({ error: 'Invalid response from AI service' });
    }
  } catch (error) {
    console.error('Error processing /template:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const messages = req.body.messages;
    const formattedMessages = [
      {
        role: 'system',
        content: getSystemPrompt(),
      },
      ...messages,
    ];

    const chatResponse = await safeChatComplete({
      model: 'mistral-large-latest',
      messages: formattedMessages,
      temperature: 0.1,
      tokenLimit: 10000,
    });

    if (chatResponse && chatResponse.choices && chatResponse.choices.length > 0) {
      const streamText = chatResponse.choices[0].message.content;
      console.log('Chat:', streamText);
      res.json({ response: streamText });
    } else {
      res.status(500).json({ error: 'No response from AI service' });
    }
  } catch (error) {
    console.error('Error processing /chat:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

export default router;