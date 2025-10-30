import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('kk');

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("Доступные модели:");
        models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (err) {
        console.error("Ошибка при получении списка моделей:", err);
    }
}

listModels();
