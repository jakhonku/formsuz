"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponsesTableProps {
  responses: any[];
  questions: any[];
  botName: string;
}

export function ResponsesTable({ responses, questions, botName }: ResponsesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResponses = responses.filter(resp => {
    const dataString = JSON.stringify(resp.data).toLowerCase();
    const chatIdMatch = resp.chatId?.toLowerCase().includes(searchTerm.toLowerCase());
    return dataString.includes(searchTerm.toLowerCase()) || chatIdMatch;
  });

  const exportToExcel = () => {
    if (filteredResponses.length === 0) return;

    const headers = ["Sana", "User ID", ...questions.map(q => q.title)];
    const rows = filteredResponses.map(resp => {
      const rowData = [
        new Date(resp.createdAt).toLocaleString("uz-UZ"),
        resp.chatId || "Noma'lum",
        ...questions.map(q => resp.data[q.title] || "")
      ];
      return rowData.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    // 'sep=,' tells Excel to use comma as the delimiter
    const csvContent = "\uFEFFsep=,\n" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FormBot_${botName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
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
          className="w-full md:w-auto h-11 bg-white gap-2 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all font-semibold rounded-xl shadow-sm"
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
                <TableHead className="font-bold text-slate-900 border-b min-w-[180px]">Sana</TableHead>
                <TableHead className="font-bold text-slate-900 border-b min-w-[140px]">User ID</TableHead>
                {questions.map((q, i) => (
                  <TableHead key={i} className="font-bold text-slate-900 border-b min-w-[200px]">
                    {q.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={questions.length + 2} className="text-center py-20 text-slate-400">
                    Hozircha javoblar mavjud emas yoki topilmadi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((resp) => (
                  <TableRow key={resp.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 border-slate-50">
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(resp.createdAt).toLocaleString("uz-UZ")}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{resp.chatId}</code>
                    </TableCell>
                    {questions.map((q, i) => (
                      <TableCell key={i} className="text-slate-600 text-sm">
                        {resp.data[q.title] || <span className="text-slate-300">—</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
