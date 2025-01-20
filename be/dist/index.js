var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
import dotenv from "dotenv";
dotenv.config();
import { Mistral } from '@mistralai/mistralai';
const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });
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
    try {
        for (var _d = true, chatResponse_1 = __asyncValues(chatResponse), chatResponse_1_1; chatResponse_1_1 = await chatResponse_1.next(), _a = chatResponse_1_1.done, !_a; _d = true) {
            _c = chatResponse_1_1.value;
            _d = false;
            const chunk = _c;
            const streamText = chunk.data.choices[0].delta.content;
            process.stdout.write(streamText); // streamText is a string is used to tell the compiler that streamText is a string but it is not a string, it is a object
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = chatResponse_1.return)) await _b.call(chatResponse_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
else {
    console.error('No choices returned in chat response');
}
