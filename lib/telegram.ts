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

export async function sendPhoto(token: string, chatId: string, photo: any, caption?: string, filename?: string) {
  const isBuffer = photo instanceof Buffer || photo instanceof Blob || photo instanceof Uint8Array || (typeof photo === 'object' && photo !== null && 'arrayBuffer' in photo);
  
  if (isBuffer) {
    const data = new FormData();
    data.append('chat_id', chatId);
    data.append('photo', photo, filename || 'photo.jpg');
    if (caption) data.append('caption', caption);
    
    return axios.post(`${TELEGRAM_API}${token}/sendPhoto`, data);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendPhoto`, {
    chat_id: chatId,
    photo,
    caption,
  });
}

export async function sendDocument(token: string, chatId: string, document: any, caption?: string, filename?: string) {
  const isBuffer = document instanceof Buffer || document instanceof Blob || document instanceof Uint8Array || (typeof document === 'object' && document !== null && 'arrayBuffer' in document);

  if (isBuffer) {
    const data = new FormData();
    data.append('chat_id', chatId);
    data.append('document', document, filename || 'file');
    if (caption) data.append('caption', caption);
    
    return axios.post(`${TELEGRAM_API}${token}/sendDocument`, data);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendDocument`, {
    chat_id: chatId,
    document,
    caption,
  });
}

export async function sendVoice(token: string, chatId: string, voice: any, filename?: string) {
  const isBuffer = voice instanceof Buffer || voice instanceof Blob || voice instanceof Uint8Array;

  if (isBuffer) {
    const data = new FormData();
    data.append('chat_id', chatId);
    data.append('voice', voice, filename || 'voice.ogg');
    
    return axios.post(`${TELEGRAM_API}${token}/sendVoice`, data);
  }

  return axios.post(`${TELEGRAM_API}${token}/sendVoice`, {
    chat_id: chatId,
    voice,
  });
}
