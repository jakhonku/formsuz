"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

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

    // Google Sheets format: questions as column headers, answers as row values
    const headers = data.map((d: any) => d.question);
    const values = data.map((d: any) => d.answer);

    const escapeCell = (val: string) => {
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Tab-separated values format (.xls) — opens directly in Excel without encoding issues
    const headerRow = headers.map(escapeCell).join("\t");
    const valueRow = values.map(escapeCell).join("\t");

    const content = "\uFEFF" + headerRow + "\n" + valueRow;

    const blob = new Blob([content], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${botName}_javob_${new Date(date).toISOString().split("T")[0]}.xls`
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
      <FileSpreadsheet size={16} />
      Excel yuklash
    </Button>
  );
}
