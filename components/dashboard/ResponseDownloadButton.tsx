"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

interface ResponseDownloadButtonProps {
  botName: string;
  responseData: string;
  date: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ResponseDownloadButton({
  botName,
  responseData,
  date,
}: ResponseDownloadButtonProps) {
  const handleDownload = () => {
    const data = JSON.parse(responseData);

    // Build HTML table for Excel — handles Unicode correctly
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>td,th{border:1px solid #ccc;padding:6px 10px;font-family:Arial;font-size:12px}th{background:#f0f0f0;font-weight:bold}</style></head>
<body><table>`;

    // Header row — question titles
    html += "<tr>";
    for (const d of data) {
      html += `<th>${escapeHtml(d.question)}</th>`;
    }
    html += "</tr>";

    // Data row — answers
    html += "<tr>";
    for (const d of data) {
      html += `<td>${escapeHtml(d.answer)}</td>`;
    }
    html += "</tr>";

    html += "</table></body></html>";

    const blob = new Blob(["\uFEFF" + html], {
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
