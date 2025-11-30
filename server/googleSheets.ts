import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export interface EventRegistration {
  timestamp: string;
  name: string;
  phone: string;
  linkedin: string;
  hasCertification: string;
  boardCount: string;
  interests: string;
}

const SPREADSHEET_ID = '1-fCalJZRLnerVeTsPQhetEOiM816FxLWquS6kX47o1k';

export async function addEventRegistration(registration: EventRegistration): Promise<void> {
  const sheets = await getUncachableGoogleSheetClient();
  
  const range = 'A:G';
  
  const values = [[
    registration.timestamp,
    registration.name,
    registration.phone,
    registration.linkedin,
    registration.hasCertification,
    registration.boardCount,
    registration.interests,
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

export async function getAllEventRegistrations(): Promise<EventRegistration[]> {
  const sheets = await getUncachableGoogleSheetClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'A:G',
  });

  const rows = response.data.values || [];
  
  // Skip header row if exists (check if first row looks like headers)
  const dataRows = rows.length > 0 && rows[0][0]?.toLowerCase().includes('data') 
    ? rows.slice(1) 
    : rows;

  return dataRows.map(row => ({
    timestamp: row[0] || '',
    name: row[1] || '',
    phone: row[2] || '',
    linkedin: row[3] || '',
    hasCertification: row[4] || '',
    boardCount: row[5] || '',
    interests: row[6] || '',
  }));
}
