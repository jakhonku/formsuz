import { google } from "googleapis";

export async function getGoogleFormsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.forms({ version: "v1", auth });
}

export async function getGoogleSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth });
}

export async function listUserForms(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth });
  
  // Google Forms can be searched in Drive
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.form'",
    fields: "files(id, name, createdTime)",
  });

  return response.data.files || [];
}

export async function getFormDetails(accessToken: string, formId: string) {
  const forms = await getGoogleFormsClient(accessToken);
  const response = await forms.forms.get({ formId });
  return response.data;
}

export async function appendResponseToSheet(accessToken: string, spreadsheetId: string, values: any[]) {
  const sheets = await getGoogleSheetsClient(accessToken);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}
