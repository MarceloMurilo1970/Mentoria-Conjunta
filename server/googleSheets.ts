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

// CRM Survey Responses Spreadsheet
const SURVEY_SPREADSHEET_ID = '1iOSApmifjm54hpGx5vPYWkfBwGNMM5PO57PrD70DgHI';

export interface SurveyResponse {
  rowIndex: string;
  timestamp: string;
  email: string;
  name: string;
  phone?: string;
  linkedin?: string;
  responses: Record<string, string>;
}

export async function fetchSurveyResponses(): Promise<SurveyResponse[]> {
  try {
    const sheets = await getUncachableGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SURVEY_SPREADSHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    return dataRows.map((row, index) => {
      const result: SurveyResponse = {
        rowIndex: String(index + 2),
        timestamp: '',
        email: '',
        name: '',
        responses: {},
      };

      headers.forEach((header, colIndex) => {
        const value = row[colIndex] || '';
        const headerLower = header.toLowerCase();
        
        if (headerLower.includes('carimbo') || headerLower.includes('timestamp')) {
          result.timestamp = value;
        } else if (headerLower.includes('e-mail') || headerLower === 'email') {
          result.email = value;
        } else if (headerLower.includes('nome completo') || (headerLower.includes('nome') && !headerLower.includes('sobrenome'))) {
          result.name = value;
        } else if (headerLower.includes('telefone') || headerLower.includes('whatsapp') || headerLower.includes('celular')) {
          result.phone = value;
        } else if (headerLower.includes('linkedin')) {
          result.linkedin = value;
        }
        
        // Store all responses for scoring
        if (value) {
          result.responses[header] = value;
        }
      });

      return result;
    }).filter(r => r.email || r.name);
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    throw error;
  }
}

// Score breakdown item
export interface ScoreBreakdownItem {
  category: string;
  points: number;
  reason: string;
  question: string;
  answer: string;
}

// Lead scoring algorithm with detailed breakdown
export function calculateLeadScore(responses: Record<string, string>): { 
  score: number; 
  temperature: string; 
  reasons: string[]; 
  breakdown: ScoreBreakdownItem[];
} {
  let score = 0;
  const reasons: string[] = [];
  const breakdown: ScoreBreakdownItem[] = [];
  const addedCategories = new Set<string>();

  Object.entries(responses).forEach(([question, answer]) => {
    if (!answer) return;
    
    const q = question.toLowerCase();
    const a = answer.toLowerCase();

    // Education/Formation signals
    if (q.includes('formação') || q.includes('educação') || q.includes('curso') || q.includes('certificação')) {
      if (a.includes('mba') || a.includes('mestrado') || a.includes('doutorado') || a.includes('pós') || a.includes('ibgc')) {
        if (!addedCategories.has('education_advanced')) {
          score += 15;
          reasons.push('Formação avançada');
          breakdown.push({
            category: 'Formação',
            points: 15,
            reason: 'Possui MBA, Mestrado, Doutorado ou certificação IBGC',
            question,
            answer
          });
          addedCategories.add('education_advanced');
        }
      } else if (a.includes('graduação') || a.includes('faculdade') || a.includes('superior')) {
        if (!addedCategories.has('education_basic')) {
          score += 10;
          reasons.push('Formação superior');
          breakdown.push({
            category: 'Formação',
            points: 10,
            reason: 'Possui formação superior completa',
            question,
            answer
          });
          addedCategories.add('education_basic');
        }
      }
    }

    // Mentorship interest
    if (q.includes('mentoria') || q.includes('acompanhamento') || q.includes('ajuda') || q.includes('apoio')) {
      if (a.includes('sim') || a.includes('muito') || a.includes('interesse') || a.includes('preciso') || a.includes('gostaria')) {
        if (!addedCategories.has('mentorship')) {
          score += 20;
          reasons.push('Interesse em mentoria');
          breakdown.push({
            category: 'Interesse em Mentoria',
            points: 20,
            reason: 'Demonstra interesse direto em acompanhamento/mentoria',
            question,
            answer
          });
          addedCategories.add('mentorship');
        }
      }
    }

    // LinkedIn/Authority interest
    if (q.includes('linkedin') || q.includes('autoridade') || q.includes('visibilidade') || q.includes('marca pessoal')) {
      if (a.includes('sim') || a.includes('muito') || a.includes('quero') || a.includes('preciso') || a.includes('desenvolver') || a.includes('melhorar')) {
        if (!addedCategories.has('authority')) {
          score += 15;
          reasons.push('Quer desenvolver autoridade');
          breakdown.push({
            category: 'Autoridade/LinkedIn',
            points: 15,
            reason: 'Quer desenvolver visibilidade e autoridade',
            question,
            answer
          });
          addedCategories.add('authority');
        }
      }
    }

    // Board transition interest
    if (q.includes('conselho') || q.includes('conselheiro') || q.includes('transição')) {
      if (a.includes('sim') || a.includes('muito') || a.includes('objetivo') || a.includes('desejo') || a.includes('busco') || a.includes('quero')) {
        if (!addedCategories.has('board_interest')) {
          score += 20;
          reasons.push('Busca transição para conselho');
          breakdown.push({
            category: 'Transição para Conselho',
            points: 20,
            reason: 'Tem como objetivo atuar em conselhos',
            question,
            answer
          });
          addedCategories.add('board_interest');
        }
      }
      if (a.includes('não sei') || a.includes('dificuldade') || a.includes('não sabe') || a.includes('como começar') || a.includes('dúvida')) {
        if (!addedCategories.has('board_help')) {
          score += 20;
          reasons.push('Precisa de orientação para conselhos');
          breakdown.push({
            category: 'Necessita Orientação',
            points: 20,
            reason: 'Não sabe como iniciar jornada em conselhos',
            question,
            answer
          });
          addedCategories.add('board_help');
        }
      }
    }

    // Current position
    if (q.includes('cargo') || q.includes('posição') || q.includes('atuação') || q.includes('ocupação')) {
      if (a.includes('diretor') || a.includes('c-level') || a.includes('ceo') || a.includes('cfo') || a.includes('cto') || a.includes('presidente')) {
        if (!addedCategories.has('position_exec')) {
          score += 15;
          reasons.push('Cargo C-Level/Diretor');
          breakdown.push({
            category: 'Cargo Atual',
            points: 15,
            reason: 'Ocupa cargo de alta liderança (C-Level/Diretor)',
            question,
            answer
          });
          addedCategories.add('position_exec');
        }
      } else if (a.includes('gerente') || a.includes('coordenador') || a.includes('head') || a.includes('superintendente')) {
        if (!addedCategories.has('position_manager')) {
          score += 10;
          reasons.push('Cargo de gestão');
          breakdown.push({
            category: 'Cargo Atual',
            points: 10,
            reason: 'Ocupa cargo de gestão (Gerente/Coordenador)',
            question,
            answer
          });
          addedCategories.add('position_manager');
        }
      }
    }

    // Board experience (might be less urgent)
    if (q.includes('quantos conselhos') || q.includes('atua em conselho')) {
      if (a === '0' || a.includes('nenhum') || a.includes('zero')) {
        if (!addedCategories.has('no_board')) {
          score += 10;
          reasons.push('Ainda não atua em conselhos');
          breakdown.push({
            category: 'Experiência em Conselhos',
            points: 10,
            reason: 'Ainda não atua em conselhos - precisa de apoio',
            question,
            answer
          });
          addedCategories.add('no_board');
        }
      }
    }

    // Urgency
    if (q.includes('urgência') || q.includes('prazo') || q.includes('quando') || q.includes('timing')) {
      if (a.includes('agora') || a.includes('imediato') || a.includes('urgente') || a.includes('próximo') || a.includes('esse ano')) {
        if (!addedCategories.has('urgency')) {
          score += 10;
          reasons.push('Urgência no objetivo');
          breakdown.push({
            category: 'Urgência',
            points: 10,
            reason: 'Tem urgência em iniciar a transição',
            question,
            answer
          });
          addedCategories.add('urgency');
        }
      }
    }
  });

  score = Math.max(0, Math.min(100, score));

  let temperature = 'cold';
  if (score >= 70) {
    temperature = 'hot';
  } else if (score >= 40) {
    temperature = 'warm';
  }

  return { score, temperature, reasons, breakdown };
}
