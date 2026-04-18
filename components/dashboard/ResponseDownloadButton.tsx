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
    const xmlEscape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Javob"><Table>`;

    // Header row — question titles
    xml += "<Row>";
    for (const d of data) {
      xml += `<Cell><Data ss:Type="String">${xmlEscape(d.question)}</Data></Cell>`;
    }
    xml += "</Row>";

    // Data row — answers
    xml += "<Row>";
    for (const d of data) {
      xml += `<Cell><Data ss:Type="String">${xmlEscape(d.answer)}</Data></Cell>`;
    }
    xml += "</Row>";

    xml += "</Table></Worksheet></Workbook>";

    const blob = new Blob([xml], {
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
