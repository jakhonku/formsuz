"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileSpreadsheet, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ParsedQuestion,
  formatAnswerForDisplay,
  isAnswerCorrect,
} from "@/lib/formQuestions";

interface ResponsesTableProps {
  responses: any[];
  questions: ParsedQuestion[];
  botName: string;
  isQuiz?: boolean;
}

function getAnswer(data: any, q: ParsedQuestion): unknown {
  if (!data) return undefined;
  return data[q.questionId] ?? data[q.title];
}

function computeQuizScore(data: any, questions: ParsedQuestion[]) {
  let total = 0;
  let gained = 0;
  for (const q of questions) {
    if (!q.correctAnswers || q.correctAnswers.length === 0) continue;
    const pts = q.points ?? 1;
    total += pts;
    if (isAnswerCorrect(q, getAnswer(data, q))) gained += pts;
  }
  return { gained, total };
}

export function ResponsesTable({
  responses,
  questions,
  botName,
  isQuiz = false,
}: ResponsesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResponses = responses.filter((resp) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    const dataString = JSON.stringify(resp.data || {}).toLowerCase();
    const chatIdMatch = resp.chatId?.toLowerCase().includes(q);
    return dataString.includes(q) || chatIdMatch;
  });

  const exportToExcel = () => {
    if (filteredResponses.length === 0) return;

    const escapeCell = (val: string) => {
      const str = String(val);
      if (str.includes("\t") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Sana",
      "User ID",
      ...questions.map((q) => q.title),
      ...(isQuiz ? ["Ball"] : []),
    ];

    const rows = filteredResponses.map((resp) => {
      const cells: string[] = [
        new Date(resp.createdAt).toLocaleString("uz-UZ"),
        resp.chatId || "Noma'lum",
        ...questions.map((q) => formatAnswerForDisplay(getAnswer(resp.data, q))),
      ];
      if (isQuiz) {
        const { gained, total } = computeQuizScore(resp.data, questions);
        cells.push(`${gained} / ${total}`);
      }
      return cells.map(escapeCell).join("\t");
    });

    const content = "\uFEFF" + [headers.map(escapeCell).join("\t"), ...rows].join("\n");
    const blob = new Blob([content], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `FormBot_${botName}_${new Date().toISOString().split("T")[0]}.xls`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Javoblar yoki foydalanuvchi bo'yicha qidirish..."
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          onClick={exportToExcel}
          disabled={filteredResponses.length === 0}
          className="shrink-0 h-11 bg-white gap-2 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all font-semibold rounded-xl shadow-sm"
        >
          <FileSpreadsheet size={18} />
          Excel yuklash
        </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-slate-900 border-b whitespace-nowrap">
                  Sana
                </TableHead>
                <TableHead className="font-bold text-slate-900 border-b whitespace-nowrap">
                  User ID
                </TableHead>
                {questions.map((q) => (
                  <TableHead
                    key={q.questionId}
                    className="font-bold text-slate-900 border-b whitespace-nowrap"
                  >
                    {q.title}
                  </TableHead>
                ))}
                {isQuiz && (
                  <TableHead className="font-bold text-slate-900 border-b whitespace-nowrap">
                    Ball
                  </TableHead>
                )}

              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={questions.length + (isQuiz ? 3 : 2)}
                    className="text-center py-20 text-slate-400"
                  >
                    Hozircha javoblar mavjud emas yoki topilmadi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((resp) => {
                  const quiz = isQuiz ? computeQuizScore(resp.data, questions) : null;
                  return (
                    <TableRow
                      key={resp.id}
                      className="hover:bg-slate-50/50 transition-colors border-b last:border-0 border-slate-50"
                    >
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(resp.createdAt).toLocaleString("uz-UZ")}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {resp.chatId}
                        </code>
                      </TableCell>
                      {questions.map((q) => {
                        const raw = getAnswer(resp.data, q);
                        const shown = formatAnswerForDisplay(raw);
                        const correct =
                          isQuiz && q.correctAnswers && q.correctAnswers.length > 0
                            ? isAnswerCorrect(q, raw)
                            : null;
                        return (
                          <TableCell key={q.questionId} className="text-slate-600 text-sm">
                            {shown ? (
                              <div className="flex items-center gap-2">
                                <span className="break-words">{shown}</span>
                                {correct === true && (
                                  <span className="text-green-600 text-xs">✓</span>
                                )}
                                {correct === false && (
                                  <span className="text-red-600 text-xs">✗</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </TableCell>
                        );
                      })}
                      {quiz && (
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 gap-1"
                          >
                            <Award size={12} />
                            {quiz.gained} / {quiz.total}
                          </Badge>
                        </TableCell>
                      )}

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
