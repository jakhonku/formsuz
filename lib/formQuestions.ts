export type QuestionType =
  | "short"
  | "paragraph"
  | "radio"
  | "checkbox"
  | "dropdown"
  | "scale"
  | "date"
  | "time"
  | "fileUpload"
  | "unknown";

export type ParsedOption = {
  value: string;
  isOther?: boolean;
  isCorrect?: boolean;
};

export type ParsedQuestion = {
  questionId: string;
  itemId: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: ParsedOption[];
  scale?: { low: number; high: number; lowLabel?: string; highLabel?: string };
  date?: { includeTime: boolean; includeYear: boolean };
  time?: { duration: boolean };
  points?: number;
  correctAnswers?: string[];
  whenRight?: string;
  whenWrong?: string;
  generalFeedback?: string;
  gridContext?: { parentTitle: string; rowLabel: string };
};

export type ParsedForm = {
  formId: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  questions: ParsedQuestion[];
};

export function parseForm(form: any): ParsedForm {
  const items = Array.isArray(form?.items) ? form.items : [];
  const isQuiz = !!form?.settings?.quizSettings?.isQuiz;
  const questions: ParsedQuestion[] = [];

  for (const item of items) {
    if (item?.questionItem?.question) {
      questions.push(parseQuestion(item, item.questionItem.question));
      continue;
    }

    if (item?.questionGroupItem) {
      const group = item.questionGroupItem;
      const grid = group.grid;
      const columnOptions: ParsedOption[] = (grid?.columns?.options || []).map(
        (o: any) => ({ value: o?.value ?? "" })
      );
      const gridType: QuestionType =
        grid?.columns?.type === "CHECKBOX" ? "checkbox" : "radio";

      for (const subQ of group.questions || []) {
        const rowLabel = subQ?.rowQuestion?.title || "";
        const qId: string = subQ?.questionId || "";
        questions.push({
          questionId: qId,
          itemId: item.itemId || qId,
          title: item.title ? `${item.title} — ${rowLabel}` : rowLabel || "Savol",
          description: item.description,
          type: gridType,
          required: !!subQ?.required,
          options: columnOptions,
          gridContext: { parentTitle: item.title || "", rowLabel },
        });
      }
      continue;
    }
    // pageBreakItem / textItem / imageItem / videoItem — e'tiborga olinmaydi
  }

  return {
    formId: form?.formId || "",
    title: form?.info?.title || "Nomsiz forma",
    description: form?.info?.description,
    isQuiz,
    questions,
  };
}

function parseQuestion(item: any, q: any): ParsedQuestion {
  const base = {
    questionId: q.questionId || item.itemId || "",
    itemId: item.itemId || q.questionId || "",
    title: item.title || "Savol",
    description: item.description,
    required: !!q.required,
  };

  const grading = q.grading;
  const points = typeof grading?.pointValue === "number" ? grading.pointValue : undefined;
  const correctAnswers: string[] | undefined = grading?.correctAnswers?.answers
    ? grading.correctAnswers.answers
        .map((a: any) => (a?.value !== undefined ? String(a.value) : null))
        .filter((v: string | null): v is string => v !== null)
    : undefined;
  const whenRight = grading?.whenRight?.text;
  const whenWrong = grading?.whenWrong?.text;
  const generalFeedback = grading?.generalFeedback?.text;

  let result: ParsedQuestion;

  if (q.choiceQuestion) {
    const type: QuestionType =
      q.choiceQuestion.type === "CHECKBOX"
        ? "checkbox"
        : q.choiceQuestion.type === "DROP_DOWN"
        ? "dropdown"
        : "radio";
    result = {
      ...base,
      type,
      options: (q.choiceQuestion.options || []).map((o: any) => ({
        value: o.isOther ? "Boshqa" : o.value || "",
        isOther: !!o.isOther,
        isCorrect: correctAnswers ? correctAnswers.includes(o.value) : false,
      })),
    };
  } else if (q.textQuestion) {
    result = {
      ...base,
      type: q.textQuestion.paragraph ? "paragraph" : "short",
    };
  } else if (q.scaleQuestion) {
    result = {
      ...base,
      type: "scale",
      scale: {
        low: q.scaleQuestion.low ?? 1,
        high: q.scaleQuestion.high ?? 5,
        lowLabel: q.scaleQuestion.lowLabel,
        highLabel: q.scaleQuestion.highLabel,
      },
    };
  } else if (q.dateQuestion) {
    result = {
      ...base,
      type: "date",
      date: {
        includeTime: !!q.dateQuestion.includeTime,
        includeYear: !!q.dateQuestion.includeYear,
      },
    };
  } else if (q.timeQuestion) {
    result = {
      ...base,
      type: "time",
      time: { duration: !!q.timeQuestion.duration },
    };
  } else if (q.fileUploadQuestion) {
    result = { ...base, type: "fileUpload" };
  } else {
    result = { ...base, type: "unknown" };
  }

  if (points !== undefined) result.points = points;
  if (correctAnswers && correctAnswers.length > 0) result.correctAnswers = correctAnswers;
  if (whenRight) result.whenRight = whenRight;
  if (whenWrong) result.whenWrong = whenWrong;
  if (generalFeedback) result.generalFeedback = generalFeedback;

  return result;
}

export function formatAnswerForDisplay(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map((v) => String(v)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function isAnswerCorrect(question: ParsedQuestion, answer: unknown): boolean {
  if (!question.correctAnswers || question.correctAnswers.length === 0) return false;
  const correct = question.correctAnswers.map((x) => x.trim().toLowerCase());

  if (Array.isArray(answer)) {
    const given = answer.map((x) => String(x).trim().toLowerCase()).sort();
    const expected = [...correct].sort();
    if (given.length !== expected.length) return false;
    return given.every((v, i) => v === expected[i]);
  }

  const v = String(answer ?? "").trim().toLowerCase();
  return correct.includes(v);
}
