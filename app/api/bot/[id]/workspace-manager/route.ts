import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { getAccessTokenByUserId } from "@/lib/auth-utils";

function authClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return auth;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = await getAccessTokenByUserId(session.user.id);
    if (!accessToken) return NextResponse.json({ error: "Google ulanmagan" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const service = searchParams.get("service");

    const auth = authClient(accessToken);

    if (service === "drive") {
      const drive = google.drive({ version: "v3", auth });
      const folderId = searchParams.get("folderId") || "root";
      
      const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, webViewLink, iconLink)",
        orderBy: "folder, name",
      });

      return NextResponse.json({ files: res.data.files });
    }

    if (service === "calendar") {
      const calendar = google.calendar({ version: "v3", auth });
      const res = await calendar.calendarList.list();
      return NextResponse.json({ calendars: res.data.items });
    }

    return NextResponse.json({ error: "Service not supported" }, { status: 400 });
  } catch (error: any) {
    console.error("Workspace Manager API error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const accessToken = await getAccessTokenByUserId(session.user.id);
    const auth = authClient(accessToken!);

    const { service, action, data } = await req.json();

    if (service === "drive" && action === "createFolder") {
      const drive = google.drive({ version: "v3", auth });
      const res = await drive.files.create({
        requestBody: {
          name: data.name,
          mimeType: "application/vnd.google-apps.folder",
          parents: data.parentId ? [data.parentId] : undefined,
        },
        fields: "id, name",
      });
      return NextResponse.json(res.data);
    }

    return NextResponse.json({ error: "Action not supported" }, { status: 400 });
  } catch (error: any) {
    console.error("Workspace Manager POST error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
