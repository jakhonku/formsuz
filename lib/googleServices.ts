import { google } from "googleapis";
import { Readable } from "stream";

function authClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

// ---------- Calendar ----------
export async function createCalendarEvent(
  accessToken: string,
  args: {
    summary: string;
    description?: string;
    startISO: string;
    endISO: string;
    timeZone?: string;
    attendees?: { email: string }[];
    addMeetLink?: boolean;
  }
) {
  const calendar = google.calendar({ version: "v3", auth: authClient(accessToken) });
  const requestId = `gway-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: args.addMeetLink ? 1 : 0,
    requestBody: {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.startISO, timeZone: args.timeZone || "Asia/Tashkent" },
      end: { dateTime: args.endISO, timeZone: args.timeZone || "Asia/Tashkent" },
      attendees: args.attendees,
      conferenceData: args.addMeetLink
        ? {
            createRequest: {
              requestId,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          }
        : undefined,
    },
  });
  return {
    id: res.data.id,
    htmlLink: res.data.htmlLink,
    meetLink: res.data.hangoutLink || null,
  };
}

export async function listUpcomingEvents(accessToken: string, max = 5) {
  const calendar = google.calendar({ version: "v3", auth: authClient(accessToken) });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: max,
    singleEvents: true,
    orderBy: "startTime",
  });
  return (res.data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    htmlLink: e.htmlLink,
    meetLink: e.hangoutLink || null,
  }));
}

// ---------- Docs ----------
export async function createDocFromText(
  accessToken: string,
  title: string,
  body: string
) {
  const docs = google.docs({ version: "v1", auth: authClient(accessToken) });
  const created = await docs.documents.create({ requestBody: { title } });
  const documentId = created.data.documentId!;
  if (body) {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: body,
            },
          },
        ],
      },
    });
  }
  return {
    id: documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// ---------- Slides ----------
export async function createSlidesPresentation(
  accessToken: string,
  title: string,
  slides: { title: string; body?: string }[]
) {
  const slidesApi = google.slides({ version: "v1", auth: authClient(accessToken) });
  const created = await slidesApi.presentations.create({ requestBody: { title } });
  const presentationId = created.data.presentationId!;

  if (slides.length > 0) {
    const requests: any[] = [];
    slides.forEach((s, idx) => {
      const slideId = `slide_${idx}_${Date.now()}`;
      requests.push({
        createSlide: {
          objectId: slideId,
          insertionIndex: idx + 1,
          slideLayoutReference: { predefinedLayout: "TITLE_AND_BODY" },
        },
      });
    });
    if (requests.length) {
      await slidesApi.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      });
    }
  }

  return {
    id: presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

// ---------- Drive (full) ----------
export async function uploadFileToDrive(
  accessToken: string,
  args: { name: string; mimeType: string; data: Buffer | string; folderId?: string }
) {
  const drive = google.drive({ version: "v3", auth: authClient(accessToken) });
  const buf = typeof args.data === "string" ? Buffer.from(args.data) : args.data;
  const stream = Readable.from(buf);

  const res = await drive.files.create({
    requestBody: {
      name: args.name,
      mimeType: args.mimeType,
      parents: args.folderId ? [args.folderId] : undefined,
    },
    media: {
      mimeType: args.mimeType,
      body: stream,
    },
    fields: "id, name, webViewLink, webContentLink",
  });
  return {
    id: res.data.id,
    name: res.data.name,
    webViewLink: res.data.webViewLink,
  };
}

export async function listDriveFiles(accessToken: string, max = 10) {
  const drive = google.drive({ version: "v3", auth: authClient(accessToken) });
  const res = await drive.files.list({
    pageSize: max,
    fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
    orderBy: "modifiedTime desc",
    q: "trashed=false",
  });
  return res.data.files || [];
}

// ---------- Gmail ----------
export async function sendGmail(
  accessToken: string,
  args: { to: string; subject: string; html?: string; text?: string }
) {
  const gmail = google.gmail({ version: "v1", auth: authClient(accessToken) });
  const boundary = `bnd_${Date.now()}`;
  const subject = `=?UTF-8?B?${Buffer.from(args.subject).toString("base64")}?=`;
  const lines = [
    `To: ${args.to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    args.text || (args.html ? args.html.replace(/<[^>]+>/g, "") : ""),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    args.html || `<p>${args.text || ""}</p>`,
    "",
    `--${boundary}--`,
  ];
  const raw = Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
  return { id: res.data.id, threadId: res.data.threadId };
}

// ---------- Meet ----------
// Meet links are created via Calendar with conferenceData. Convenience wrapper:
export async function createMeetLink(
  accessToken: string,
  args: { title: string; startISO: string; endISO: string; attendees?: { email: string }[] }
) {
  const ev = await createCalendarEvent(accessToken, {
    summary: args.title,
    startISO: args.startISO,
    endISO: args.endISO,
    attendees: args.attendees,
    addMeetLink: true,
  });
  return {
    eventId: ev.id,
    meetLink: ev.meetLink,
    htmlLink: ev.htmlLink,
  };
}

// ---------- Tasks ----------
export async function createGoogleTask(
  accessToken: string,
  args: { title: string; notes?: string; dueISO?: string; tasklistId?: string }
) {
  const tasks = google.tasks({ version: "v1", auth: authClient(accessToken) });
  const tasklistId = args.tasklistId || "@default";
  const res = await tasks.tasks.insert({
    tasklist: tasklistId,
    requestBody: {
      title: args.title,
      notes: args.notes,
      due: args.dueISO,
    },
  });
  return {
    id: res.data.id,
    title: res.data.title,
    selfLink: res.data.selfLink,
  };
}

export async function listGoogleTasks(accessToken: string, max = 10) {
  const tasks = google.tasks({ version: "v1", auth: authClient(accessToken) });
  const res = await tasks.tasks.list({ tasklist: "@default", maxResults: max });
  return res.data.items || [];
}
