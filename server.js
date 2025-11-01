require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // 🔍 Логирование для отладки
        console.log('📩 Received messages:', messages.length);
        const systemMsg = messages.find(msg => msg.sender === 'system');
        console.log('🔧 System message found:', !!systemMsg);
        if (systemMsg) {
            console.log('📝 System instruction length:', systemMsg.text.length);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Извлекаем системный промпт (если есть)
        const systemMessage = messages.find(msg => msg.sender === 'system');

        // Формируем историю БЕЗ системного сообщения
        const regularMessages = messages.filter((msg) => msg.sender !== 'system');

        const history = regularMessages
            .filter((msg) => msg.sender === 'user' || msg.sender === 'bot')
            .map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));

        // Убираем последнее сообщение пользователя из истории (оно будет отправлено отдельно)
        const lastUserMessage = messages[messages.length - 1].text;
        if (history.length > 0 && history[history.length - 1].role === 'user') {
            history.pop();
        }

        // 🔥 НОВЫЙ ПОДХОД: Если есть системный промпт, добавляем его как первое взаимодействие
        if (systemMessage && history.length === 0) {
            // Добавляем системный контекст как первое сообщение пользователя
            history.push({
                role: 'user',
                parts: [{ text: systemMessage.text }]
            });
            // Добавляем подтверждение от модели
            history.push({
                role: 'model',
                parts: [{ text: 'Understood. I will assist you based on your professional background and experience.' }]
            });
        }

        // Проверяем, что история не начинается с ответа модели
        if (history.length > 0 && history[0].role !== 'user') {
            history.shift();
        }

        console.log('📊 Final history length:', history.length);

        const chat = await model.startChat({ history });
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