import dotenv from "dotenv";
dotenv.config();
import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});
const chatResponse = await client.chat.stream({
  model: 'mistral-large-latest',
  messages: [
    {
      role: 'system',
      content: 'You are a developer that writes clean, modular code with a well-organized file structure. Your task is to generate a Vite + React app with the following file structure:'
    },
    {
      role: 'system',
      content: 'File structure:'
    },
    {
      role: 'system',
      content: `
        index.html
        /src
          /components
            - AppList.jsx
            - AppItem.jsx
          App.css
          App.jsx
          index.jsx
        `
    },
    {
      role: 'user',
      content: 'Generate the code for a React todo app following the file structure above.'
    }
  ],
  temperature: 0.1
});

if (chatResponse) {
  for await (const chunk of chatResponse) {
    const streamText = chunk.data.choices[0].delta.content;
    process.stdout.write(streamText as string); // streamText is a string is used to tell the compiler that streamText is a string but it is not a string, it is a object
  }
} else {
  console.error('No choices returned in chat response');
}