import axios from "axios";

const TELEGRAM_API = "https://api.telegram.org/bot";

export async function verifyBotToken(token: string) {
  try {
    const response = await axios.get(`${TELEGRAM_API}${token}/getMe`);
    return response.data.ok ? response.data.result : null;
  } catch {
    return null;
  }
}

export async function setWebhook(token: string, url: string) {
  try {
    const response = await axios.post(`${TELEGRAM_API}${token}/setWebhook`, { url });
    return response.data;
  } catch {
    return null;
  }
}

export async function sendMessage(token: string, chatId: number | string, text: string, options = {}) {
  try {
    const response = await axios.post(`${TELEGRAM_API}${token}/sendMessage`, {
      chat_id: chatId,
      text,
      ...options,
    });
    return response.data;
  } catch (error) {
    console.error("Telegram sendMessage error:", error);
    return null;
  }
}

export async function deleteBotWebhook(token: string) {
  try {
    await axios.post(`${TELEGRAM_API}${token}/deleteWebhook`);
  } catch (error) {
    console.error("Telegram deleteWebhook error:", error);
  }
}
