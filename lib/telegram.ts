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
    const response = await axios.post(`${TELEGRAM_API}${token}/setWebhook`, {
      url,
      allowed_updates: ["message", "callback_query"],
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function sendMessage(
  token: string,
  chatId: number | string,
  text: string,
  options: Record<string, unknown> = {}
) {
  try {
    const response = await axios.post(`${TELEGRAM_API}${token}/sendMessage`, {
      chat_id: chatId,
      text,
      ...options,
    });
    return response.data;
  } catch (error: any) {
    console.error("Telegram sendMessage error:", error?.response?.data || error?.message);
    return null;
  }
}

export async function answerCallbackQuery(
  token: string,
  callbackQueryId: string,
  text?: string
) {
  try {
    await axios.post(`${TELEGRAM_API}${token}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text,
    });
  } catch (error: any) {
    console.error("Telegram answerCallbackQuery error:", error?.response?.data || error?.message);
  }
}

export async function editMessageReplyMarkup(
  token: string,
  chatId: number | string,
  messageId: number,
  replyMarkup: any
) {
  try {
    await axios.post(`${TELEGRAM_API}${token}/editMessageReplyMarkup`, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup,
    });
  } catch {
    // Edit failures are non-fatal
  }
}

export async function deleteBotWebhook(token: string) {
  try {
    await axios.post(`${TELEGRAM_API}${token}/deleteWebhook`);
  } catch (error) {
    console.error("Telegram deleteWebhook error:", error);
  }
}
