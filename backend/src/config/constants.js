import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
export const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
export const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urjicafe';