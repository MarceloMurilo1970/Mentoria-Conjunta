import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  console.log(`[GoogleSheets] Environment: ${isProduction ? 'production' : 'development'}, hostname: ${hostname}, tokenType: ${xReplitToken ? (xReplitToken.startsWith('repl') ? 'repl' : 'depl') : 'none'}`);

  if (!xReplitToken) {
    console.error('[GoogleSheets] No token available. REPL_IDENTITY:', !!process.env.REPL_IDENTITY, 'WEB_REPL_RENEWAL:', !!process.env.WEB_REPL_RENEWAL);
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  if (!hostname) {
    console.error('[GoogleSheets] REPLIT_CONNECTORS_HOSTNAME not set');
    throw new Error('REPLIT_CONNECTORS_HOSTNAME not configured');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    if (!response.ok) {
      console.error('[GoogleSheets] Connection API error:', response.status, response.statusText);
      throw new Error(`Connection API returned ${response.status}`);
    }
    
    const data = await response.json();
    connectionSettings = data.items?.[0];
    
    if (!connectionSettings) {
      console.error('[GoogleSheets] No connection settings found in response:', JSON.stringify(data).substring(0, 200));
      throw new Error('Google Sheet connection not found');
    }
  } catch (error: any) {
    console.error('[GoogleSheets] Failed to fetch connection:', error.message);
    throw error;
  }

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    console.error('[GoogleSheets] No access token in connection settings');
    throw new Error('Google Sheet not connected - no access token');
  }
  
  console.log('[GoogleSheets] Successfully obtained access token');
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
    
    // Log all headers to debug column detection
    console.log('[GoogleSheets] Total headers:', headers.length);
    console.log('[GoogleSheets] ALL Headers:', headers);
    const phoneHeaders = headers.filter(h => 
      h.toLowerCase().includes('telefone') || 
      h.toLowerCase().includes('whatsapp') || 
      h.toLowerCase().includes('celular') ||
      h.toLowerCase().includes('phone')
    );
    console.log('[GoogleSheets] Phone/WhatsApp columns detected:', phoneHeaders);

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

// Lead scoring algorithm - ONLY analyzes 3 specific questions
export function calculateLeadScore(responses: Record<string, string>): { 
  score: number; 
  temperature: string; 
  reasons: string[]; 
  breakdown: ScoreBreakdownItem[];
} {
  let score = 0;
  const reasons: string[] = [];
  const breakdown: ScoreBreakdownItem[] = [];

  // Find the 3 specific questions we care about
  const foundQuestions: {
    atuacao: { q: string; a: string } | null;
    formacao: { q: string; a: string } | null;
    transicao: { q: string; a: string } | null;
  } = { atuacao: null, formacao: null, transicao: null };

  Object.entries(responses).forEach(([question, answer]) => {
    if (!answer) return;
    const qLower = question.toLowerCase();

    // Question 1: "Hoje, qual das opções melhor descreve sua atuação principal?"
    if (qLower.includes('qual das opções melhor descreve sua atuação principal') || 
        qLower.includes('melhor descreve sua atuação')) {
      foundQuestions.atuacao = { q: question, a: answer };
    }

    // Question 2: "Você já participou de algum dos seguintes programas de formação para conselheiros?"
    if (qLower.includes('participou de algum dos seguintes programas de formação para conselheiros') ||
        (qLower.includes('programas de formação') && qLower.includes('conselheiros'))) {
      foundQuestions.formacao = { q: question, a: answer };
    }

    // Question 3: "O que você acredita que mais precisa neste momento para acelerar sua transição para conselhos?"
    if (qLower.includes('mais precisa neste momento para acelerar sua transição') ||
        qLower.includes('acelerar sua transição para conselhos')) {
      foundQuestions.transicao = { q: question, a: answer };
    }
  });

  const atuacaoQuestion = foundQuestions.atuacao;
  const formacaoQuestion = foundQuestions.formacao;
  const transicaoQuestion = foundQuestions.transicao;

  // Score Question 1: Atuação Principal (max 35 pts)
  if (atuacaoQuestion) {
    const answer = atuacaoQuestion.a.toLowerCase();
    let points = 0;
    let reason = '';

    // Check for option indicators (1, 2, 3 = highest; 4 = lower; 5 = zero)
    // Options typically are: 1-Executivo/Diretor, 2-Empresário, 3-Conselheiro, 4-Em transição, 5-Outro
    if (answer.includes('executivo') || answer.includes('diretor') || answer.includes('c-level') ||
        answer.includes('empresário') || answer.includes('sócio') || answer.includes('dono') ||
        answer.includes('conselheiro') || answer.includes('já atuo em conselho')) {
      points = 35;
      reason = 'Perfil executivo/empresário ou já conselheiro - alto potencial';
    } else if (answer.includes('transição') || answer.includes('saindo') || answer.includes('buscando') ||
               answer.includes('gerente') || answer.includes('gestor')) {
      points = 20;
      reason = 'Em transição de carreira ou gestão - potencial médio';
    } else if (answer.includes('outro') || answer.includes('estudante') || answer.includes('aposentado')) {
      points = 0;
      reason = 'Perfil não prioritário para mentoria de conselhos';
    } else {
      // Default to intermediate if can't determine
      points = 15;
      reason = 'Perfil não identificado claramente';
    }

    if (points > 0) {
      score += points;
      reasons.push(reason);
    }
    breakdown.push({
      category: 'Atuação Profissional',
      points,
      reason,
      question: atuacaoQuestion.q,
      answer: atuacaoQuestion.a
    });
  }

  // Score Question 2: Formação para Conselheiros (max 30 pts)
  if (formacaoQuestion) {
    const answer = formacaoQuestion.a.toLowerCase();
    let points = 0;
    let reason = '';

    if (answer.includes('não participei') || answer.includes('nenhum') || answer === 'não') {
      points = 30; // Needs training = higher interest in mentorship
      reason = 'Não possui formação específica - precisa de mentoria';
    } else if (answer.includes('ibgc') || answer.includes('board academy') || answer.includes('fdc') ||
               answer.includes('insper') || answer.includes('saint paul')) {
      points = 15; // Has formal training, may need less support
      reason = 'Possui formação reconhecida em conselhos';
    } else {
      // Has some training but not major institutions
      points = 20;
      reason = 'Possui alguma formação em conselhos';
    }

    score += points;
    reasons.push(reason);
    breakdown.push({
      category: 'Formação em Conselhos',
      points,
      reason,
      question: formacaoQuestion.q,
      answer: formacaoQuestion.a
    });
  }

  // Score Question 3: Necessidade para Transição (max 35 pts)
  if (transicaoQuestion) {
    const answer = transicaoQuestion.a.toLowerCase();
    let points = 0;
    let reason = '';

    // Options 4, 5 = highest (networking, mentoria/orientação)
    // Option 6 = zero (já está bem posicionado)
    // Others = intermediate
    if (answer.includes('mentoria') || answer.includes('acompanhamento') || answer.includes('orientação') ||
        answer.includes('networking') || answer.includes('conexões') || answer.includes('indicações')) {
      points = 35;
      reason = 'Precisa de mentoria/networking - candidato ideal';
    } else if (answer.includes('já estou bem') || answer.includes('não preciso') || 
               answer.includes('já consegui') || answer.includes('nada')) {
      points = 0;
      reason = 'Não demonstra necessidade de apoio';
    } else if (answer.includes('visibilidade') || answer.includes('autoridade') || 
               answer.includes('linkedin') || answer.includes('marca pessoal')) {
      points = 25;
      reason = 'Precisa desenvolver visibilidade/autoridade';
    } else if (answer.includes('formação') || answer.includes('conhecimento') || 
               answer.includes('certificação') || answer.includes('curso')) {
      points = 20;
      reason = 'Busca formação/conhecimento adicional';
    } else {
      points = 15;
      reason = 'Necessidade não identificada claramente';
    }

    if (points > 0) {
      score += points;
      reasons.push(reason);
    }
    breakdown.push({
      category: 'Necessidade para Transição',
      points,
      reason,
      question: transicaoQuestion.q,
      answer: transicaoQuestion.a
    });
  }

  score = Math.max(0, Math.min(100, score));

  let temperature = 'cold';
  if (score >= 70) {
    temperature = 'hot';
  } else if (score >= 40) {
    temperature = 'warm';
  }

  return { score, temperature, reasons, breakdown };
}
