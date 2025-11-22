require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function listModels() {
    try {
        // Используем fetch API напрямую, так как метод может отсутствовать
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`
        );

        const data = await response.json();

        console.log('🔍 Доступные модели:');
        console.log('='.repeat(60));

        if (data.models) {
            data.models.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                if (supportsGenerate) {
                    console.log(`\n✅ ${model.name}`);
                    console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                    console.log(`   Description: ${model.description || 'N/A'}`);
                }
            });
        } else {
            console.log('Модели не найдены или ошибка API');
            console.log(data);
        }
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

listModels();