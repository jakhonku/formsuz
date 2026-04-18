import { ParsedQuestion } from "./formQuestions";
import { sendMessage } from "./telegram";

export const CB_PICK = "p:"; // p:<index>  or p:skip  — single-select pick
export const CB_CHK_TOGGLE = "c:"; // c:<index> — checkbox toggle
export const CB_CHK_DONE = "cd"; // checkbox done
export const CB_SKIP = "sk"; // skip optional question

export function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function questionHintText(q: ParsedQuestion): string {
  switch (q.type) {
    case "short":
      return "✍️ Matn bilan javob yozing.";
    case "paragraph":
      return "✍️ Batafsil matn yozing.";
    case "radio":
      return "🔘 Quyidagilardan birini tanlang:";
    case "dropdown":
      return "📋 Ro'yxatdan birini tanlang:";
    case "checkbox":
      return "☑️ Mos keladiganlarini belgilang, tayyor bo‘lsa “Tayyor” tugmasini bosing.";
    case "scale": {
      const s = q.scale!;
      const lo = s.lowLabel ? `${s.low} (${s.lowLabel})` : s.low;
      const hi = s.highLabel ? `${s.high} (${s.highLabel})` : s.high;
      return `📊 ${lo} dan ${hi} gacha baholang:`;
    }
    case "date": {
      const y = q.date!.includeYear;
      const t = q.date!.includeTime;
      const format = y ? (t ? "KK.OO.YYYY SS:DD" : "KK.OO.YYYY") : t ? "KK.OO SS:DD" : "KK.OO";
      return `📅 Sanani shu formatda yuboring: ${format}`;
    }
    case "time":
      return q.time!.duration
        ? "⏱ Davomiylikni SS:DD formatda yozing. Misol: 01:30"
        : "🕒 Vaqtni SS:DD formatda yozing. Misol: 14:30";
    case "fileUpload":
      return "📎 Hujjat yoki rasm fayl sifatida yuboring.";
    default:
      return "Javob yozing.";
  }
}

export function buildQuestionText(q: ParsedQuestion, index: number, total: number): string {
  const number = `<b>${index + 1}/${total}</b>`;
  const title = `<b>${escapeHtml(q.title)}</b>`;
  const req = q.required ? ' <span class="tg-spoiler">*</span>' : "";
  const desc = q.description ? `\n<i>${escapeHtml(q.description)}</i>` : "";
  const hint = `\n\n${escapeHtml(questionHintText(q))}`;
  const pts = q.points ? `\n<b>(${q.points} ball)</b>` : "";
  return `${number} — ${title}${req}${desc}${pts}${hint}`;
}

export function buildReplyMarkup(q: ParsedQuestion, checkboxState: string[] = []): any | null {
  switch (q.type) {
    case "radio":
    case "dropdown": {
      const keyboard = (q.options || []).map((o, idx) => [
        { text: o.value || `Variant ${idx + 1}`, callback_data: `${CB_PICK}${idx}` },
      ]);
      if (!q.required) {
        keyboard.push([{ text: "⏭ O‘tkazib yuborish", callback_data: CB_SKIP }]);
      }
      return { inline_keyboard: keyboard };
    }
    case "checkbox": {
      const picked = new Set(checkboxState);
      const keyboard = (q.options || []).map((o, idx) => [
        {
          text: `${picked.has(o.value) ? "☑️" : "▫️"} ${o.value || `Variant ${idx + 1}`}`,
          callback_data: `${CB_CHK_TOGGLE}${idx}`,
        },
      ]);
      keyboard.push([{ text: "✅ Tayyor", callback_data: CB_CHK_DONE }]);
      if (!q.required) {
        keyboard.push([{ text: "⏭ O‘tkazib yuborish", callback_data: CB_SKIP }]);
      }
      return { inline_keyboard: keyboard };
    }
    case "scale": {
      const nums: number[] = [];
      for (let i = q.scale!.low; i <= q.scale!.high; i++) nums.push(i);
      const rows: any[][] = [];
      const perRow = nums.length > 6 ? Math.ceil(nums.length / 2) : nums.length;
      for (let i = 0; i < nums.length; i += perRow) {
        const slice = nums.slice(i, i + perRow);
        rows.push(slice.map((n) => ({ text: String(n), callback_data: `${CB_PICK}${n}` })));
      }
      if (!q.required) {
        rows.push([{ text: "⏭ O‘tkazib yuborish", callback_data: CB_SKIP }]);
      }
      return { inline_keyboard: rows };
    }
    default:
      if (!q.required) {
        return {
          inline_keyboard: [[{ text: "⏭ O‘tkazib yuborish", callback_data: CB_SKIP }]],
        };
      }
      return null;
  }
}

export async function sendQuestion(
  token: string,
  chatId: string | number,
  question: ParsedQuestion,
  index: number,
  total: number,
  checkboxState: string[] = []
) {
  const text = buildQuestionText(question, index, total);
  const reply_markup = buildReplyMarkup(question, checkboxState);
  const options: Record<string, unknown> = { parse_mode: "HTML" };
  if (reply_markup) {
    options.reply_markup = reply_markup;
  } else {
    options.reply_markup = { remove_keyboard: true };
  }
  return await sendMessage(token, chatId, text, options);
}

type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function validateDate(q: ParsedQuestion, text: string): ValidationResult {
  const cfg = q.date!;
  const t = text.trim();
  // Accept separators: . - /
  const sep = /[.\-/]/;
  const parts = t.split(/\s+/);
  const datePart = parts[0];
  const timePart = parts[1];

  const dParts = datePart.split(sep).map((x) => parseInt(x, 10));
  if (dParts.some((x) => isNaN(x))) return { ok: false, error: "Sanani noto'g'ri formatda yubordingiz." };

  let day: number, month: number, year: number | null = null;
  if (cfg.includeYear) {
    if (dParts.length < 3) return { ok: false, error: "Yil ham kerak. Misol: 15.04.2026" };
    [day, month, year] = dParts;
  } else {
    if (dParts.length < 2) return { ok: false, error: "Sana noto'g'ri. Misol: 15.04" };
    [day, month] = dParts;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { ok: false, error: "Kun yoki oy noto'g'ri." };
  }

  let out = cfg.includeYear ? `${pad2(day)}.${pad2(month)}.${year}` : `${pad2(day)}.${pad2(month)}`;

  if (cfg.includeTime) {
    if (!timePart) return { ok: false, error: "Vaqtni ham yuboring. Misol: 15.04.2026 14:30" };
    const tParts = timePart.split(":").map((x) => parseInt(x, 10));
    if (tParts.length < 2 || tParts.some((x) => isNaN(x))) {
      return { ok: false, error: "Vaqt noto'g'ri. Misol: 14:30" };
    }
    const [hh, mm] = tParts;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
      return { ok: false, error: "Soat yoki daqiqa noto'g'ri." };
    }
    out += ` ${pad2(hh)}:${pad2(mm)}`;
  }

  return { ok: true, value: out };
}

export function validateTime(q: ParsedQuestion, text: string): ValidationResult {
  const t = text.trim();
  const parts = t.split(":").map((x) => parseInt(x, 10));
  if (parts.length < 2 || parts.some((x) => isNaN(x))) {
    return { ok: false, error: "Vaqt noto'g'ri formatda. Misol: 14:30" };
  }
  const [hh, mm] = parts;
  if (q.time?.duration) {
    if (hh < 0 || mm < 0 || mm > 59) return { ok: false, error: "Daqiqa 0-59 oralig'ida bo'lishi kerak." };
    return { ok: true, value: `${pad2(hh)}:${pad2(mm)}` };
  }
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return { ok: false, error: "Soat 0-23, daqiqa 0-59 bo'lishi kerak." };
  }
  return { ok: true, value: `${pad2(hh)}:${pad2(mm)}` };
}
