import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

interface BatchPriceInfo {
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
  batchName: string;
  paymentLink: string;
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
    paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-6oGnMgu7Ax-8875,00",
  },
  {
    id: 2,
    name: "Lote 2",
    startDate: new Date("2025-12-08T00:00:00-03:00"),
    endDate: new Date("2025-12-31T23:59:59-03:00"),
    pixPrice: 8750,
    installmentPrice: 1930,
    installmentTotal: 9650,
    paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-kuyi8p4sl-9650,00",
  },
  {
    id: 3,
    name: "Lote 3",
    startDate: new Date("2026-01-01T00:00:00-03:00"),
    endDate: new Date("2026-01-19T19:00:00-03:00"),
    pixPrice: 9400,
    installmentPrice: 2085,
    installmentTotal: 10425,
    paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-6oGomxwm8d-10425,00",
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
        batchName: batch.name,
        paymentLink: batch.paymentLink,
      };
    }
  }
  const lastBatch = BATCHES[BATCHES.length - 1];
  return {
    pixPrice: lastBatch.pixPrice,
    installmentPrice: lastBatch.installmentPrice,
    installmentTotal: lastBatch.installmentTotal,
    batchName: lastBatch.name,
    paymentLink: lastBatch.paymentLink,
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

export async function sendRegistrationEmail(
  to: string,
  name: string,
  paymentMethod: "pix" | "installments"
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
      <li><strong>Chave PIX (CNPJ):</strong> 17.840.516/0001-47</li>
      <li><strong>Beneficiário:</strong> Opes Informática Ltda</li>
      <li><strong>Valor:</strong> R$ ${formatPrice(batchInfo.pixPrice)},00</li>
    </ul>
    <p>Após o pagamento, sua inscrição será confirmada e a nota fiscal será enviada em até 5 dias.</p>
  `;

  const installmentsInstructions = `
    <h3>Instruções para Pagamento Parcelado (${batchInfo.batchName})</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 5x de R$ ${formatPrice(batchInfo.installmentPrice)},00 (total R$ ${formatPrice(batchInfo.installmentTotal)},00) através do link abaixo:</p>
    <p style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <strong>Link de pagamento:</strong><br/>
      <a href="${batchInfo.paymentLink}" style="color: #0070f3; word-break: break-all;">${batchInfo.paymentLink}</a>
    </p>
    <p>Clique no link acima ou copie e cole no seu navegador para realizar o pagamento.</p>
    <p>Após a confirmação do pagamento, sua inscrição será confirmada e a nota fiscal será enviada em até 5 dias.</p>
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${heroImageUrl}" alt="Mentoria Marcelo Murilo e Hamilton Felix" style="max-width: 100%; height: auto; border-radius: 8px;" />
      </div>
      <h2 style="color: #0070f3;">Inscrição Recebida com Sucesso!</h2>
      <p>Olá ${name},</p>
      <p>Sua inscrição para a Mentoria Conjunta de <strong>Marcelo Murilo e Hamilton Felix</strong> foi recebida com sucesso!</p>
      
      ${paymentMethod === "pix" ? pixInstructions : installmentsInstructions}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <h3>Programa da Mentoria</h3>
      
      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo - 8H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 1 - 19/jan (19:00-20:00):</strong> Definindo seu nicho e propósito</li>
        <li><strong>Sessão 2 - 26/jan (19:00-20:00):</strong> Perfil de conselheiro que vende</li>
        <li><strong>Sessão 3 - 02/fev (19:00-20:00):</strong> Posts que geram oportunidades</li>
        <li><strong>Sessão 4 - 09/fev (19:00-20:00):</strong> Interações que multiplicam alcance</li>
        <li><strong>Sessão 5 - 23/fev (19:00-20:00):</strong> Conectando com quem importa</li>
        <li><strong>Sessão 6 - 02/mar (19:00-20:00):</strong> Vendas e eventos estratégicos</li>
        <li><strong>Sessão 7 - 09/mar (19:00-20:00):</strong> Aspectos práticos dos conselhos</li>
        <li><strong>Sessão 8 - 16/mar (19:00-20:00):</strong> Integração e planejamento futuros</li>
      </ul>

      <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix - 4H)</h4>
      <ul style="line-height: 1.8;">
        <li><strong>Sessão 1 - 09/mar (19:00-20:00):</strong> Prospecção de empresas</li>
        <li><strong>Sessão 2 - 09/mar (20:00-21:00):</strong> Fechamento de Projetos</li>
        <li><strong>Sessão 3 - 16/mar (19:00-20:00):</strong> Implementando o Conselho</li>
        <li><strong>Sessão 4 - 16/mar (20:00-21:00):</strong> Evoluindo o Conselho</li>
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

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Confirmação de Inscrição - Mentoria Marcelo Murilo e Hamilton Felix")
    .setHtml(htmlContent)
    .setText(`Olá ${name}, sua inscrição para a Mentoria foi recebida com sucesso!`);

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
    : `Cartão 5x R$ ${formatPrice(batchInfo.installmentPrice)},00 (Total: R$ ${formatPrice(batchInfo.installmentTotal)},00)`;

  const paymentLinkInfo = registration.paymentMethod === 'installments'
    ? `<p><strong>Link de Pagamento:</strong> <a href="${batchInfo.paymentLink}">${batchInfo.paymentLink}</a></p>`
    : `<p><strong>PIX (CNPJ):</strong> 17.840.516/0001-47 - Opes Informática Ltda</p>`;

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
  registrations: Array<{
    name: string;
    email: string;
    paymentMethod: string;
    createdAt: Date;
  }>
) {
  const mailerSend = getMailerSendClient();
  const batchInfo = getCurrentBatchInfo();

  const registrationRows = registrations.map((reg, index) => {
    const paymentDisplay = reg.paymentMethod === 'pix' 
      ? `PIX (R$ ${formatPrice(batchInfo.pixPrice)})` 
      : `5x R$ ${formatPrice(batchInfo.installmentPrice)}`;
    
    return `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: center;">${index + 1}</td>
      <td style="padding: 12px;">${reg.name}</td>
      <td style="padding: 12px;">${reg.email}</td>
      <td style="padding: 12px; text-align: center;">${paymentDisplay}</td>
      <td style="padding: 12px; text-align: center;">
        ${reg.createdAt.toLocaleString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
    </tr>
  `;
  }).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #0070f3;">Lista Completa de Inscritos</h2>
      <p>Segue a lista atualizada de todos os inscritos na Mentoria:</p>
      
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #0070f3; margin-top: 0;">Total de Inscritos: ${registrations.length}</h3>
        <p style="margin: 0;">Lote Atual: ${batchInfo.batchName}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; border: 1px solid #eee;">
        <thead>
          <tr style="background-color: #0070f3; color: white;">
            <th style="padding: 12px; text-align: center;">#</th>
            <th style="padding: 12px; text-align: left;">Nome</th>
            <th style="padding: 12px; text-align: left;">Email</th>
            <th style="padding: 12px; text-align: center;">Forma de Pagamento</th>
            <th style="padding: 12px; text-align: center;">Data de Inscrição</th>
          </tr>
        </thead>
        <tbody>
          ${registrationRows}
        </tbody>
      </table>

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
    .setSubject(`Inscrições Mentoria - Total: ${registrations.length} inscritos`)
    .setHtml(htmlContent)
    .setText(`Total de inscritos: ${registrations.length}`);

  await mailerSend.email.send(emailParams);
}
