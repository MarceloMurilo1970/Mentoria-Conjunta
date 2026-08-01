// MailerSend integration
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { db } from "./db";
import { turmaConfigs, registrations, type TurmaConfig, type BatchPricingItem } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

interface BatchPriceInfo {
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
  installment10Price: number;
  installment10Total: number;
  batchName: string;
  paymentLink: string;
  paymentLink10: string;
}

const BATCHES = [
  {
    id: 1,
    name: "Lote 1",
    startDate: new Date("2025-12-04T20:45:00-03:00"),
    endDate: new Date("2025-12-07T23:59:59-03:00"),
    pixPrice: 8000,
    installmentPrice: 1775,
    installmentTotal: 8875,
    installment10Price: 1775,
    installment10Total: 8875,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
    paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
  },
  {
    id: 2,
    name: "Lote 2",
    startDate: new Date("2025-12-08T00:00:00-03:00"),
    endDate: new Date("2025-12-31T23:59:59-03:00"),
    pixPrice: 8750,
    installmentPrice: 1930,
    installmentTotal: 9650,
    installment10Price: 1930,
    installment10Total: 9650,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
    paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
  },
  {
    id: 3,
    name: "Lote 3",
    startDate: new Date("2026-01-01T00:00:00-03:00"),
    endDate: new Date("2026-01-19T19:00:00-03:00"),
    pixPrice: 9400,
    installmentPrice: 2085,
    installmentTotal: 10425,
    installment10Price: 1100,
    installment10Total: 11000,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
    paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
  },
];

function getCurrentBatchInfo(): BatchPriceInfo {
  const now = new Date();
  for (const batch of BATCHES) {
    if (now >= batch.startDate && now <= batch.endDate) {
      return {
        pixPrice: batch.pixPrice,
        installmentPrice: batch.installmentPrice,
        installmentTotal: batch.installmentTotal,
        installment10Price: batch.installment10Price,
        installment10Total: batch.installment10Total,
        batchName: batch.name,
        paymentLink: batch.paymentLink,
        paymentLink10: batch.paymentLink10,
      };
    }
  }
  const lastBatch = BATCHES[BATCHES.length - 1];
  return {
    pixPrice: lastBatch.pixPrice,
    installmentPrice: lastBatch.installmentPrice,
    installmentTotal: lastBatch.installmentTotal,
    installment10Price: lastBatch.installment10Price,
    installment10Total: lastBatch.installment10Total,
    batchName: lastBatch.name,
    paymentLink: lastBatch.paymentLink,
    paymentLink10: lastBatch.paymentLink10,
  };
}

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

function getMailerSendClient() {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    throw new Error("MAILERSEND_API_KEY not configured");
  }
  return new MailerSend({ apiKey });
}

const FROM_EMAIL = "contato@marcelomurilo.com.br";
const FROM_NAME = "Mentoria Marcelo Murilo & Hamilton Felix";

export async function sendTestEmail(toEmail: string) {
  const mailerSend = getMailerSendClient();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Teste de Email - Mentoria</h2>
      <p>Este é um email de teste para verificar se o sistema de envio está funcionando corretamente.</p>
      <p>Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p>Atenciosamente,<br/>Sistema de Inscrições</p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient(toEmail, "Teste")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Teste de Email - Mentoria Marcelo Murilo & Hamilton Felix")
    .setHtml(htmlContent)
    .setText("Este é um email de teste para verificar se o sistema de envio está funcionando.");

  await mailerSend.email.send(emailParams);
  console.log(`Test email sent to ${toEmail}`);
}

function getTurmaScheduleHtml(turma?: string): string {
  if (turma === "turma_3") {
    return `
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo)</h4>
      <p style="font-size: 13px; color: #666;">Segundas-feiras, 19:00 às 20:00</p>
      <ul style="line-height: 1.8; font-size: 14px;">
        <li><strong>Sessão 1 - 11/ago:</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 18/ago:</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 25/ago:</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 01/set:</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 08/set:</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 15/set:</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 22/set:</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 29/set:</strong> Integração e planejamento futuros</li>
      </ul>
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix)</h4>
      <ul style="line-height: 1.8; font-size: 14px;">
        <li><strong>Sessão 9 - 06/out (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 10 - 06/out (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 11 - 13/out (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 12 - 13/out (20:00-21:00):</strong> Evoluindo o Conselho</li>
      </ul>
    `;
  }
  if (turma === "turma_4") {
    return `
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo)</h4>
      <p style="font-size: 13px; color: #666;">Quartas-feiras, 19:00 às 20:00</p>
      <ul style="line-height: 1.8; font-size: 14px;">
        <li><strong>Sessão 1 - 13/ago:</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 20/ago:</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 27/ago:</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 03/set:</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 10/set:</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 17/set:</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 24/set:</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 01/out:</strong> Integração e planejamento futuros</li>
      </ul>
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix)</h4>
      <ul style="line-height: 1.8; font-size: 14px;">
        <li><strong>Sessão 9 - 08/out (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 10 - 08/out (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 11 - 15/out (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 12 - 15/out (20:00-21:00):</strong> Evoluindo o Conselho</li>
      </ul>
    `;
  }
  // Fallback genérico
  return `
    <p style="font-size: 14px; color: #666;">12 sessões ao vivo — datas e horários serão comunicados via grupo de WhatsApp.</p>
  `;
}

export async function sendRegistrationEmail(
  to: string,
  name: string,
  paymentMethod: "pix" | "installments" | "installments10",
  turma?: string,
  observations?: string | null
) {
  const mailerSend = getMailerSendClient();
  
  // Fetch turma config from database for correct prices
  let turmaConfig: TurmaConfig | undefined;
  if (turma) {
    const configs = await db.select().from(turmaConfigs).where(eq(turmaConfigs.turmaId, turma));
    turmaConfig = configs[0];
  }
  
  // Get price info from turma config (batches) or fallback to hardcoded
  let pixPrice = 9400;
  let installmentPrice = 2085;
  let installmentTotal = 10425;
  let installment10Price = 1100;
  let installment10Total = 11000;
  let paymentLink = "";
  let paymentLink10 = "";
  let turmaName = turma === "turma_4" ? "Turma 4 — Quartas-feiras" : "Turma 3 — Segundas-feiras";
  let batchName = "Lote 3";
  
  if (turmaConfig && turmaConfig.batches && Array.isArray(turmaConfig.batches)) {
    const batches = turmaConfig.batches as BatchPricingItem[];
    // Use the last/current batch
    const currentBatch = batches[batches.length - 1];
    if (currentBatch) {
      batchName = currentBatch.label;
      const pixPlan = currentBatch.plans.find(p => p.id === "pix");
      const card5Plan = currentBatch.plans.find(p => p.id === "installments");
      const card10Plan = currentBatch.plans.find(p => p.id === "installments10");
      if (pixPlan) pixPrice = pixPlan.totalAmount;
      if (card5Plan) { installmentTotal = card5Plan.totalAmount; installmentPrice = Math.round(card5Plan.totalAmount / card5Plan.installments); paymentLink = card5Plan.paymentLink; }
      if (card10Plan) { installment10Total = card10Plan.totalAmount; installment10Price = Math.round(card10Plan.totalAmount / card10Plan.installments); paymentLink10 = card10Plan.paymentLink; }
    }
    turmaName = turmaConfig.name;
  }

  const formatBRL = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pixInstructions = `
    <h3>Instruções para Pagamento via PIX (${batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento via PIX:</p>
    <ul>
      <li><strong>Chave PIX (CNPJ):</strong> 66.142.918/0001-83</li>
      <li><strong>Beneficiário:</strong> Mentoria MM Treinamentos Ltda</li>
      <li><strong>Valor:</strong> R$ ${formatBRL(pixPrice)}</li>
    </ul>
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const installmentsInstructions = `
    <h3>Instruções para Pagamento Parcelado em 5x (${batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 5x de R$ ${formatBRL(installmentPrice)} (total R$ ${formatBRL(installmentTotal)}) através do link abaixo:</p>
    ${paymentLink ? `<p style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong>Link de pagamento:</strong><br/>
      <a href="${paymentLink}" style="color: #0070f3; word-break: break-all;">${paymentLink}</a>
    </p>` : ''}
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const installments10Instructions = `
    <h3>Instruções para Pagamento Parcelado em 10x (${batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 10x de R$ ${formatBRL(installment10Price)} (total R$ ${formatBRL(installment10Total)}) através do link abaixo:</p>
    ${paymentLink10 ? `<p style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong>Link de pagamento:</strong><br/>
      <a href="${paymentLink10}" style="color: #0070f3; word-break: break-all;">${paymentLink10}</a>
    </p>` : ''}
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const getPaymentInstructions = () => {
    if (paymentMethod === "pix") return pixInstructions;
    if (paymentMethod === "installments10") return installments10Instructions;
    return installmentsInstructions;
  };

  const observationsSection = observations ? `
    <div style="background-color: #fff3cd; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h4 style="margin-top: 0; color: #856404;">Observações sobre seu pagamento:</h4>
      <p style="margin: 0; color: #856404;">${observations}</p>
    </div>
  ` : '';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Inscrição Recebida com Sucesso!</h2>
      <p>Olá ${name},</p>
      <p>Sua inscrição para a <strong>${turmaName}</strong> da Mentoria Conjunta de <strong>Marcelo Murilo e Hamilton Felix</strong> foi recebida com sucesso!</p>
      <p><strong>Período:</strong> Agosto a Outubro de 2026 — 12 sessões ao vivo</p>
      
      ${getPaymentInstructions()}
      ${observationsSection}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <h3>Programa da Mentoria</h3>
      ${getTurmaScheduleHtml(turma)}

      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h4 style="color: #0070f3; margin-top: 0;">Grupo de WhatsApp</h4>
        <p style="margin: 0;">Um grupo de WhatsApp será criado com todos os participantes. Neste grupo você receberá as instruções para participação das lives e todas as informações importantes sobre a mentoria.</p>
      </div>
      
      <p style="margin-top: 30px;">
        Em caso de dúvidas, entre em contato conosco.<br/>
        Atenciosamente,<br/>
        Equipe Marcelo Murilo & Hamilton Felix
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient(to, name)];
  const ccRecipients = [
    new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo"),
    new Recipient("hamiltonfelix@gmail.com", "Hamilton Felix"),
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setCc(ccRecipients)
    .setSubject(`Confirmação de Inscrição - ${turmaName} - Mentoria Marcelo Murilo e Hamilton Felix`)
    .setHtml(htmlContent)
    .setText(`Olá ${name}, sua inscrição para a ${turmaName} da Mentoria foi recebida com sucesso!`);

  await mailerSend.email.send(emailParams);
}

export async function sendRegistrationNotificationEmail(
  registration: {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
  }
) {
  const mailerSend = getMailerSendClient();
  const batchInfo = getCurrentBatchInfo();

  const paymentInfo = registration.paymentMethod === 'pix' 
    ? `PIX à vista - R$ ${formatPrice(batchInfo.pixPrice)},00`
    : registration.paymentMethod === 'installments10'
    ? `Cartão 10x R$ ${formatPrice(batchInfo.installment10Price)},00 (Total: R$ ${formatPrice(batchInfo.installment10Total)},00)`
    : `Cartão 5x R$ ${formatPrice(batchInfo.installmentPrice)},00 (Total: R$ ${formatPrice(batchInfo.installmentTotal)},00)`;

  const paymentLinkInfo = registration.paymentMethod === 'installments'
    ? `<p><strong>Link de Pagamento:</strong> <a href="${batchInfo.paymentLink}">${batchInfo.paymentLink}</a></p>`
    : registration.paymentMethod === 'installments10'
    ? `<p><strong>Link de Pagamento:</strong> <a href="${batchInfo.paymentLink10}">${batchInfo.paymentLink10}</a></p>`
    : `<p><strong>PIX (CNPJ):</strong> 66.142.918/0001-83 - Mentoria MM Treinamentos Ltda</p>`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Nova Inscrição Recebida!</h2>
      
      <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0070f3;">${batchInfo.batchName}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nome:</td>
            <td style="padding: 8px 0;">${registration.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${registration.email}">${registration.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Telefone:</td>
            <td style="padding: 8px 0;"><a href="tel:${registration.phone}">${registration.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Pagamento:</td>
            <td style="padding: 8px 0;">${paymentInfo}</td>
          </tr>
        </table>
        ${paymentLinkInfo}
      </div>

      <p style="color: #666; font-size: 14px;">
        Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Nova Inscrição: ${registration.name} - ${batchInfo.batchName}`)
    .setHtml(htmlContent)
    .setText(`Nova inscrição: ${registration.name} - ${registration.email} - ${paymentInfo}`);

  await mailerSend.email.send(emailParams);
}

export async function sendRegistrationListEmail(
  allRegistrations: Array<{
    name: string;
    email: string;
    paymentMethod: string;
    turma: string;
    createdAt: Date;
    observations?: string | null;
  }>
) {
  const mailerSend = getMailerSendClient();

  // Group by turma
  const grouped: Record<string, typeof allRegistrations> = {};
  for (const reg of allRegistrations) {
    const key = reg.turma || 'turma_2';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(reg);
  }

  // Turma labels
  const turmaLabels: Record<string, string> = {
    'turma_2': 'Turma 2 (Legado)',
    'turma_3': 'Turma 3 — Segundas-feiras',
    'turma_4': 'Turma 4 — Quartas-feiras',
  };

  // Build table per turma
  let tablesHtml = '';
  const turmaOrder = ['turma_3', 'turma_4', 'turma_2'];
  
  for (const turmaId of turmaOrder) {
    const regs = grouped[turmaId];
    if (!regs || regs.length === 0) continue;

    const rows = regs.map((reg, index) => {
      const paymentDisplay = reg.paymentMethod === 'pix' 
        ? 'PIX' 
        : reg.paymentMethod === 'installments10'
        ? '10x Cartão'
        : '5x Cartão';
      
      return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px; text-align: center;">${index + 1}</td>
        <td style="padding: 8px;">${reg.name}</td>
        <td style="padding: 8px;">${reg.email}</td>
        <td style="padding: 8px; text-align: center;">${paymentDisplay}</td>
        <td style="padding: 8px; text-align: center;">
          ${reg.createdAt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </td>
      </tr>`;
    }).join('');

    tablesHtml += `
      <h3 style="color: #0070f3; margin-top: 30px;">${turmaLabels[turmaId] || turmaId} — ${regs.length} inscrito(s)</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; background-color: white; border: 1px solid #eee; font-size: 13px;">
        <thead>
          <tr style="background-color: #0070f3; color: white;">
            <th style="padding: 8px; text-align: center;">#</th>
            <th style="padding: 8px; text-align: left;">Nome</th>
            <th style="padding: 8px; text-align: left;">Email</th>
            <th style="padding: 8px; text-align: center;">Pagamento</th>
            <th style="padding: 8px; text-align: center;">Data</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  const totalNew = (grouped['turma_3']?.length || 0) + (grouped['turma_4']?.length || 0);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Lista de Inscritos por Turma</h2>
      
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Total geral:</strong> ${allRegistrations.length} inscritos</p>
        <p style="margin: 4px 0 0 0;"><strong>Turmas novas (3+4):</strong> ${totalNew} inscritos</p>
      </div>

      ${tablesHtml}

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Este email foi enviado automaticamente pelo sistema de inscrições.
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [
    new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo"),
    new Recipient("hamiltonfelix@gmail.com", "Hamilton Felix"),
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(`Inscrições Mentoria - Total: ${allRegistrations.length} inscritos (${totalNew} turmas novas)`)
    .setHtml(htmlContent)
    .setText(`Total de inscritos: ${allRegistrations.length}`);

  await mailerSend.email.send(emailParams);
}

// Email para inscritos com pagamento PAGO (confirmação)
export async function sendPaidConfirmationEmail(
  to: string,
  name: string
) {
  const mailerSend = getMailerSendClient();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Pagamento Confirmado!</h2>
      <p>Olá ${name},</p>
      <p>Confirmamos o recebimento do seu pagamento para a <strong>Mentoria Conjunta de Marcelo Murilo e Hamilton Felix</strong>.</p>
      <p>Sua inscrição está <strong style="color: #22c55e;">100% confirmada</strong>!</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <h3>Programa da Mentoria</h3>
      
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo - 8H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 1 - 23/fev (19:00-20:00):</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 02/mar (19:00-20:00):</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 09/mar (19:00-20:00):</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 16/mar (19:00-20:00):</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 23/mar (19:00-20:00):</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 30/mar (19:00-20:00):</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 06/abr (19:00-20:00):</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 13/abr (19:00-20:00):</strong> Integração e planejamento futuros</li>
      </ul>

      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix - 4H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 9 - 20/abr (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 10 - 20/abr (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 11 - 27/abr (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 12 - 27/abr (20:00-21:00):</strong> Evoluindo o Conselho</li>
      </ul>

      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h4 style="color: #0070f3; margin-top: 0;">Grupo de WhatsApp</h4>
        <p style="margin: 0;">Um grupo de WhatsApp será criado com todos os participantes. Neste grupo você receberá as instruções para participação das lives e todas as informações importantes sobre a mentoria.</p>
      </div>
      
      <p style="margin-top: 30px;">
        Nos vemos em breve!<br/>
        Atenciosamente,<br/>
        Equipe Marcelo Murilo & Hamilton Felix
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient(to, name)];
  const ccRecipients = [new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setCc(ccRecipients)
    .setSubject("Pagamento Confirmado - Mentoria Marcelo Murilo e Hamilton Felix")
    .setHtml(htmlContent)
    .setText(`Olá ${name}, seu pagamento foi confirmado! Sua inscrição está 100% confirmada.`);

  await mailerSend.email.send(emailParams);
}

// Email para inscritos com pagamento PARCIAL (lembrete do próximo pagamento)
export async function sendPartialPaymentEmail(
  to: string,
  name: string,
  paymentMethod: "pix" | "installments"
) {
  const mailerSend = getMailerSendClient();
  const batchInfo = getCurrentBatchInfo();
  
  const paymentReminder = paymentMethod === "pix" 
    ? `
      <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h4 style="color: #b45309; margin-top: 0;">Lembrete de Pagamento</h4>
        <p style="margin: 0;">Identificamos que seu pagamento está parcial. Para completar sua inscrição, realize o pagamento restante via PIX:</p>
        <ul style="margin-top: 10px;">
          <li><strong>Chave PIX (CNPJ):</strong> 66.142.918/0001-83</li>
          <li><strong>Beneficiário:</strong> Mentoria MM Treinamentos Ltda</li>
        </ul>
        <p style="margin-top: 10px;"><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante.</p>
      </div>
    `
    : `
      <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <h4 style="color: #b45309; margin-top: 0;">Lembrete de Pagamento</h4>
        <p style="margin: 0;">Identificamos que seu pagamento está parcial. Para completar sua inscrição, realize o pagamento das parcelas restantes através do link:</p>
        <p style="margin-top: 10px;"><a href="${batchInfo.paymentLink}" style="color: #0070f3;">${batchInfo.paymentLink}</a></p>
        <p style="margin-top: 10px;"><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante.</p>
      </div>
    `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Confirmação de Inscrição</h2>
      <p>Olá ${name},</p>
      <p>Sua inscrição para a <strong>Mentoria Conjunta de Marcelo Murilo e Hamilton Felix</strong> foi recebida!</p>
      
      ${paymentReminder}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <h3>Programa da Mentoria</h3>
      
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo - 8H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 1 - 23/fev (19:00-20:00):</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 02/mar (19:00-20:00):</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 09/mar (19:00-20:00):</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 16/mar (19:00-20:00):</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 23/mar (19:00-20:00):</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 30/mar (19:00-20:00):</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 06/abr (19:00-20:00):</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 13/abr (19:00-20:00):</strong> Integração e planejamento futuros</li>
      </ul>

      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix - 4H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 9 - 20/abr (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 10 - 20/abr (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 11 - 27/abr (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 12 - 27/abr (20:00-21:00):</strong> Evoluindo o Conselho</li>
      </ul>

      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h4 style="color: #0070f3; margin-top: 0;">Grupo de WhatsApp</h4>
        <p style="margin: 0;">Um grupo de WhatsApp será criado com todos os participantes. Neste grupo você receberá as instruções para participação das lives e todas as informações importantes sobre a mentoria.</p>
      </div>
      
      <p style="margin-top: 30px;">
        Em caso de dúvidas, entre em contato conosco.<br/>
        Atenciosamente,<br/>
        Equipe Marcelo Murilo & Hamilton Felix
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient(to, name)];
  const ccRecipients = [new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setCc(ccRecipients)
    .setSubject("Confirmação de Inscrição - Lembrete de Pagamento Pendente")
    .setHtml(htmlContent)
    .setText(`Olá ${name}, sua inscrição foi recebida! Lembre-se de completar o pagamento.`);

  await mailerSend.email.send(emailParams);
}

// Email para inscritos com pagamento PENDENTE (instruções completas)
export async function sendPendingPaymentEmail(
  to: string,
  name: string,
  paymentMethod: "pix" | "installments" | "installments10"
) {
  const mailerSend = getMailerSendClient();
  const batchInfo = getCurrentBatchInfo();
  
  const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPL_SLUG;
  const baseUrl = replitDomain 
    ? `https://${replitDomain.split(',')[0]}` 
    : 'http://localhost:5000';
  const heroImageUrl = `${baseUrl}/email-assets/hero-image.png`;

  const pixInstructions = `
    <h3>Instruções para Pagamento via PIX (${batchInfo.batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento via PIX:</p>
    <ul>
      <li><strong>Chave PIX (CNPJ):</strong> 66.142.918/0001-83</li>
      <li><strong>Beneficiário:</strong> Mentoria MM Treinamentos Ltda</li>
      <li><strong>Valor:</strong> R$ ${formatPrice(batchInfo.pixPrice)},00</li>
    </ul>
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const installmentsInstructions = `
    <h3>Instruções para Pagamento Parcelado (${batchInfo.batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 5x de R$ ${formatPrice(batchInfo.installmentPrice)},00 (total R$ ${formatPrice(batchInfo.installmentTotal)},00) através do link abaixo:</p>
    <p style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong>Link de pagamento:</strong><br/>
      <a href="${batchInfo.paymentLink}" style="color: #0070f3; word-break: break-all;">${batchInfo.paymentLink}</a>
    </p>
    <p>Clique no link acima ou copie e cole no seu navegador para realizar o pagamento.</p>
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const installments10Instructions = `
    <h3>Instruções para Pagamento Parcelado em 10x (${batchInfo.batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 10x de R$ ${formatPrice(batchInfo.installment10Price)},00 (total R$ ${formatPrice(batchInfo.installment10Total)},00) através do link abaixo:</p>
    <p style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong>Link de pagamento:</strong><br/>
      <a href="${batchInfo.paymentLink10}" style="color: #0070f3; word-break: break-all;">${batchInfo.paymentLink10}</a>
    </p>
    <p>Clique no link acima ou copie e cole no seu navegador para realizar o pagamento.</p>
    <p><strong>Importante:</strong> Após realizar o pagamento, responda este email anexando o comprovante para confirmarmos sua inscrição.</p>
  `;

  const getPaymentInstructions = () => {
    if (paymentMethod === "pix") return pixInstructions;
    if (paymentMethod === "installments10") return installments10Instructions;
    return installmentsInstructions;
  };

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${heroImageUrl}" alt="Mentoria Marcelo Murilo e Hamilton Felix" style="max-width: 100%; height: auto; border-radius: 8px;" />
      </div>
      <h2 style="color: #0070f3;">Inscrição Recebida - Aguardando Pagamento</h2>
      <p>Olá ${name},</p>
      <p>Sua inscrição para a Mentoria Conjunta de <strong>Marcelo Murilo e Hamilton Felix</strong> foi recebida!</p>
      
      ${getPaymentInstructions()}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <h3>Programa da Mentoria</h3>
      
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo - 8H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 1 - 23/fev (19:00-20:00):</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 02/mar (19:00-20:00):</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 09/mar (19:00-20:00):</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 16/mar (19:00-20:00):</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 23/mar (19:00-20:00):</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 30/mar (19:00-20:00):</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 06/abr (19:00-20:00):</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 13/abr (19:00-20:00):</strong> Integração e planejamento futuros</li>
      </ul>

      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix - 4H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 9 - 20/abr (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 10 - 20/abr (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 11 - 27/abr (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 12 - 27/abr (20:00-21:00):</strong> Evoluindo o Conselho</li>
      </ul>

      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
        <h4 style="color: #0070f3; margin-top: 0;">Grupo de WhatsApp</h4>
        <p style="margin: 0;">Um grupo de WhatsApp será criado com todos os participantes. Neste grupo você receberá as instruções para participação das lives e todas as informações importantes sobre a mentoria.</p>
      </div>
      
      <p style="margin-top: 30px;">
        Em caso de dúvidas, entre em contato conosco.<br/>
        Atenciosamente,<br/>
        Equipe Marcelo Murilo & Hamilton Felix
      </p>
    </div>
  `;

  const sentFrom = new Sender(FROM_EMAIL, FROM_NAME);
  const recipients = [new Recipient(to, name)];
  const ccRecipients = [new Recipient("contato@marcelomurilo.com.br", "Marcelo Murilo")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setCc(ccRecipients)
    .setSubject("Confirmação de Inscrição - Mentoria Marcelo Murilo e Hamilton Felix")
    .setHtml(htmlContent)
    .setText(`Olá ${name}, sua inscrição para a Mentoria foi recebida! Aguardamos seu pagamento.`);

  await mailerSend.email.send(emailParams);
}
