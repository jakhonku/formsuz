"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ResponseDownloadButtonProps {
  botName: string;
  responseData: string;
  date: string;
}

export function ResponseDownloadButton({
  botName,
  responseData,
  date,
}: ResponseDownloadButtonProps) {
  const handleDownload = () => {
    const data = JSON.parse(responseData);
    const headers = ["#", "Savol", "Javob"];
    const rows = data.map((d: any) => [
      d.index,
      `"${d.question.replace(/"/g, '""')}"`,
      `"${d.answer.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFFsep=,\n" +
      [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${botName}_javob_${new Date(date).toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      className="gap-2 shrink-0 rounded-xl border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
    >
      <Download size={16} />
      Yuklab olish
    </Button>
  );
}
