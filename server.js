require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация OpenAI
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// Инициализация Gemini
require('dotenv').config();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

        const history = messages
            .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
            .map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));

        if (history.length > 0 && history[0].role !== 'user') {
            history.shift();
        }

        const chat = await model.startChat({ history });
        const lastUserMessage = messages[messages.length - 1].text;
        const result = await chat.sendMessage(lastUserMessage);
        const response = result.response.text();

        res.json({ message: response });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
