import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/telegram";
import { getAccessTokenByUserId } from "@/lib/auth-utils";
import { appendResponseToSheet } from "@/lib/google";
import { decrypt } from "@/lib/crypto";

export async function POST(req: Request, { params }: { params: { botId: string } }) {
  try {
    const { botId } = params;
    const body = await req.json();

    if (!body.message) return NextResponse.json({ ok: true });

    const chatId = body.message.chat.id.toString();
    const text = body.message.text;

    // 1. Find Bot and Form
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { form: true },
    });

    if (!bot || bot.status !== "active") return NextResponse.json({ ok: true });
    
    const botToken = decrypt(bot.telegramToken);

    const formMetadata = bot.form.metadata as any;
    const questions = formMetadata?.items || [];

    // 2. Find or create in_progress response
    let response = await prisma.response.findFirst({
      where: { 
        botId, 
        chatId, 
        status: "in_progress" 
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Handle /start command
    if (text === "/start") {
      if (response) {
        await prisma.response.delete({ where: { id: response.id } });
      }
      
      response = await prisma.response.create({
        data: {
          botId,
          chatId,
          status: "in_progress",
          lastQuestionIndex: 0,
          data: {},
        },
      });

      await sendMessage(botToken, chatId, `Xush kelibsiz! "${bot.form.title}" so'rovnomasini boshlaymiz.`);
      await sendQuestion(botToken, chatId, questions[0]);
      return NextResponse.json({ ok: true });
    }

    if (!response) {
      await sendMessage(botToken, chatId, "Iltimos, so'rovnomani boshlash uchun /start buyrug'ini bering.");
      return NextResponse.json({ ok: true });
    }

    // 4. Handle answer
    const currentIndex = response.lastQuestionIndex;
    const currentQuestion = questions[currentIndex];
    
    // Save answer
    const updatedData = { 
      ...(response.data as object), 
      [currentQuestion.title]: text 
    };

    const nextIndex = currentIndex + 1;

    if (nextIndex >= questions.length) {
      // Finished
      await prisma.response.update({
        where: { id: response.id },
        data: {
          data: updatedData,
          status: "completed",
        },
      });

      await sendMessage(botToken, chatId, "Rahmat! Javoblaringiz qabul qilindi. ✅");
      
      // Write to Google Sheets
      try {
        const accessToken = await getAccessTokenByUserId(bot.userId);
        if (accessToken) {
          let spreadsheetId = bot.form.linkedSheetId;
          
          // If no sheet is linked yet, create one now
          if (!spreadsheetId) {
            console.log("No linkedSheetId found, creating a new one...");
            const newSheetId = await createSpreadsheet(accessToken, bot.form.title);
            if (newSheetId) {
              spreadsheetId = newSheetId;
              // Save it for future use
              await prisma.form.update({
                where: { id: bot.form.id },
                data: { linkedSheetId: newSheetId }
              });
              console.log("New sheet created and linked:", newSheetId);
            }
          }

          if (spreadsheetId) {
            const values = Object.values(updatedData);
            // Add date as first column
            await appendResponseToSheet(accessToken, spreadsheetId, [new Date().toLocaleString(), ...values]);
            console.log("Data successfully written to sheet:", spreadsheetId);
          }
        }
      } catch (sheetError: any) {
        console.error("Google Sheets writing error:", sheetError?.message || sheetError);
      }
    } else {
      // Next question
      await prisma.response.update({
        where: { id: response.id },
        data: {
          data: updatedData,
          lastQuestionIndex: nextIndex,
        },
      });

      await sendQuestion(botToken, chatId, questions[nextIndex]);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

async function sendQuestion(token: string, chatId: string, question: any) {
  if (!question) return;
  
  let questionText = `*${question.title}*`;
  if (question.description) {
    questionText += `\n\n${question.description}`;
  }

  // Basic implementation. In production, handle different question types (choice, etc.)
  await sendMessage(token, chatId, questionText, { parse_mode: "Markdown" });
}
