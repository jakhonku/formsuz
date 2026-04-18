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
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet,
  Calendar,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResponsesTableProps {
  responses: any[];
  questions: any[];
  botName: string;
}

export function ResponsesTable({ responses, questions, botName }: ResponsesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredResponses = responses.filter(resp => {
    const dataString = JSON.stringify(resp.data).toLowerCase();
    const chatIdMatch = resp.chatId?.toLowerCase().includes(searchTerm.toLowerCase());
    return dataString.includes(searchTerm.toLowerCase()) || chatIdMatch;
  });

  // Export to CSV function
  const exportToExcel = () => {
    if (filteredResponses.length === 0) return;

    // Headings: Date, Chat ID, and then all question titles
    const headers = ["Sana", "User ID", ...questions.map(q => q.title)];
    
    const rows = filteredResponses.map(resp => {
      const rowData = [
        new Date(resp.createdAt).toLocaleString("uz-UZ"),
        resp.chatId || "Noma'lum",
        ...questions.map(q => resp.data[q.title] || "")
      ];
      // Escape commas and double quotes for CSV
      return rowData.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
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
    <div className="space-y-4">
      {/* Table Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Javoblar yoki foydalanuvchi bo'yicha qidirish..." 
            className="pl-10 h-11 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={exportToExcel}
            className="flex-1 md:flex-none h-11 bg-white gap-2 border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all font-semibold"
          >
            <FileSpreadsheet size={18} />
            Excel yuklash
          </Button>
        </div>
      </div>

      {/* Grid view for mobile / Table for desktop */}
      <div className="hidden md:block border rounded-2xl bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-900 w-[180px]">Sana</TableHead>
              <TableHead className="font-bold text-slate-900">User ID</TableHead>
              {questions.map((q, i) => (
                <TableHead key={i} className="font-bold text-slate-900 min-w-[150px]">
                  {q.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={questions.length + 2} className="text-center py-20 text-slate-400">
                  Hech qanday ma'lumot topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((resp) => (
                <TableRow key={resp.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {new Date(resp.createdAt).toLocaleString("uz-UZ", {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {resp.chatId}
                  </TableCell>
                  {questions.map((q, i) => (
                    <TableCell key={i} className="text-slate-600">
                      {resp.data[q.title] || "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view cards */}
      <div className="md:hidden space-y-4">
        {filteredResponses.map((resp) => (
          <Card key={resp.id} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400">
                  {new Date(resp.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>
              <Badge variant="outline" className="text-[10px]">{resp.chatId}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase">{q.title}</p>
                  <p className="text-sm text-slate-700">{resp.data[q.title] || "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {filteredResponses.length === 0 && (
          <p className="text-center py-10 text-slate-400">Hech narsa topilmadi.</p>
        )}
      </div>
    </div>
  );
}
