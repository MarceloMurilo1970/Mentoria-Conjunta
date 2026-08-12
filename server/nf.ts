const FATURADOR_API_URL = "https://faturador.marcelomurilo.com.br/api/external";
const COMPANY_ID = 4;

export interface NfResult {
  id: number;
  status: string;
  focusNfeNumero?: string;
  pdfUrl?: string;
  issuedAt?: string;
}

function getApiKey(): string {
  const key = process.env.FATURADOR_API_KEY;
  if (!key) throw new Error("FATURADOR_API_KEY não configurada");
  return key;
}

function turmaLabel(turma: string | null): string {
  if (turma === "turma_4") return "Turma 4";
  if (turma === "turma_3") return "Turma 3";
  return "Turma 3";
}

export async function emitNFPartial(registration: {
  name: string;
  cpfCnpj: string;
  email: string;
  valueReais: number;
  turma: string | null;
}): Promise<NfResult> {
  const apiKey = getApiKey();
  const now = new Date();

  const body = {
    companyId: COMPANY_ID,
    clientName: registration.name,
    clientCnpjCpf: registration.cpfCnpj.replace(/\D/g, ""),
    clientEmail: registration.email,
    description: `Mentoria Conjunta — ${turmaLabel(registration.turma)} — ${registration.name}`,
    value: registration.valueReais,
    referenceMonth: now.getMonth() + 1,
    referenceYear: now.getFullYear(),
    autoEmit: true,
  };

  const response = await fetch(`${FATURADOR_API_URL}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Faturador API ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const inv = data.invoice;
  return {
    id: inv.id,
    status: inv.status,
    focusNfeNumero: inv.focusNfeNumero ?? undefined,
    pdfUrl: inv.pdfUrl ?? undefined,
    issuedAt: inv.issuedAt ?? undefined,
  };
}

export async function emitNF(registration: {
  name: string;
  cpfCnpj: string;
  email: string;
  paidAmount: number;
  turma: string | null;
}): Promise<NfResult> {
  const apiKey = getApiKey();
  const now = new Date();

  const body = {
    companyId: COMPANY_ID,
    clientName: registration.name,
    clientCnpjCpf: registration.cpfCnpj.replace(/\D/g, ""),
    clientEmail: registration.email,
    description: `Mentoria Conjunta — ${turmaLabel(registration.turma)} — ${registration.name}`,
    value: registration.paidAmount / 100,
    referenceMonth: now.getMonth() + 1,
    referenceYear: now.getFullYear(),
    autoEmit: true,
  };

  const response = await fetch(`${FATURADOR_API_URL}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Faturador API ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const inv = data.invoice;
  return {
    id: inv.id,
    status: inv.status,
    focusNfeNumero: inv.focusNfeNumero ?? undefined,
    pdfUrl: inv.pdfUrl ?? undefined,
    issuedAt: inv.issuedAt ?? undefined,
  };
}

export async function reemitNF(nfId: number): Promise<NfResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${FATURADOR_API_URL}/invoices/${nfId}/emit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Faturador API ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const inv = data.invoice;
  return {
    id: inv.id,
    status: inv.status,
    focusNfeNumero: inv.focusNfeNumero ?? undefined,
    pdfUrl: inv.pdfUrl ?? undefined,
    issuedAt: inv.issuedAt ?? undefined,
  };
}

export async function cancelNF(
  nfId: number,
  justificativa = "Cancelamento solicitado pelo emissor"
): Promise<{ success: boolean; status: string; canceladaEm?: string }> {
  const apiKey = getApiKey();

  const response = await fetch(`${FATURADOR_API_URL}/invoices/${nfId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ justificativa }),
  });

  const data = await response.json().catch(() => ({}));
  console.log(`[NF] Cancel response for nfId=${nfId}: HTTP ${response.status}`, JSON.stringify(data));

  if (!response.ok) {
    throw new Error(`Faturador API ${response.status}: ${JSON.stringify(data)}`);
  }

  const resolvedStatus: string = data.invoice?.status ?? data.status ?? data.nfse?.status ?? null;
  if (!resolvedStatus) {
    console.warn(`[NF] Cancel for nfId=${nfId} returned OK but no status field. Full body: ${JSON.stringify(data)}`);
    throw new Error(`Cancelamento não confirmado pelo Faturador — resposta sem status. Verifique o sistema de faturamento manualmente.`);
  }

  return {
    success: true,
    status: resolvedStatus,
    canceladaEm: data.invoice?.canceladaEm ?? undefined,
  };
}

export async function getNFStatus(nfId: number): Promise<NfResult> {
  const apiKey = getApiKey();

  const response = await fetch(`${FATURADOR_API_URL}/invoices/${nfId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Faturador API ${response.status}: ${JSON.stringify(err)}`);
  }

  const inv = await response.json();
  return {
    id: inv.id,
    status: inv.status,
    focusNfeNumero: inv.focusNfeNumero ?? undefined,
    pdfUrl: inv.pdfUrl ?? undefined,
    issuedAt: inv.issuedAt ?? undefined,
  };
}
