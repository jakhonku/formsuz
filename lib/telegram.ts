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

export async function sendPhoto(token: string, chatId: string, photo: any, caption?: string) {
  const isBuffer = photo instanceof Buffer || photo instanceof Blob;
  const data = isBuffer ? new FormData() : { chat_id: chatId, photo, caption };
  
  if (isBuffer) {
    (data as any).append('chat_id', chatId);
    (data as any).append('photo', photo);
    if (caption) (data as any).append('caption', caption);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendPhoto`, data, {
    headers: isBuffer ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
}

export async function sendDocument(token: string, chatId: string, document: any, caption?: string) {
  const isBuffer = document instanceof Buffer || document instanceof Blob;
  const data = isBuffer ? new FormData() : { chat_id: chatId, document, caption };

  if (isBuffer) {
    (data as any).append('chat_id', chatId);
    (data as any).append('document', document);
    if (caption) (data as any).append('caption', caption);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendDocument`, data, {
    headers: isBuffer ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
}

export async function sendVoice(token: string, chatId: string, voice: any) {
  const isBuffer = voice instanceof Buffer || voice instanceof Blob;
  const data = isBuffer ? new FormData() : { chat_id: chatId, voice };

  if (isBuffer) {
    (data as any).append('chat_id', chatId);
    (data as any).append('voice', voice);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendVoice`, data, {
    headers: isBuffer ? { 'Content-Type': 'multipart/form-data' } : undefined
  });
}
