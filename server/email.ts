import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendRegistrationEmail(
  to: string,
  name: string,
  paymentMethod: "pix" | "installments"
) {
  const { client, fromEmail } = await getUncachableSendGridClient();

  const pixInstructions = `
    <h3>Instruções para Pagamento via PIX</h3>
    <p>Para confirmar sua inscrição, realize o pagamento via PIX:</p>
    <ul>
      <li><strong>Chave PIX (CNPJ):</strong> 17.840.516/0001-47</li>
      <li><strong>Beneficiário:</strong> Opes Informática Ltda</li>
      <li><strong>Valor:</strong> R$ 6.975,00</li>
    </ul>
    <p>Após o pagamento, sua inscrição será confirmada e a nota fiscal será enviada em até 5 dias.</p>
  `;

  const installmentsInstructions = `
    <h3>Instruções para Pagamento Parcelado</h3>
    <p>Para confirmar sua inscrição, realize o pagamento em 5x de R$ 1.250,00 (total R$ 6.250,00) através do link abaixo:</p>
    <p><strong>Link de pagamento:</strong> https://mpago.li/2e8FvqE</p>
    <p>Copie e cole o link acima no seu navegador para realizar o pagamento.</p>
    <p>Após a confirmação do pagamento, sua inscrição será confirmada e a nota fiscal será enviada em até 5 dias.</p>
  `;

  const msg = {
    to,
    from: fromEmail,
    subject: 'Confirmação de Inscrição - Mentoria Marcelo Murilo e Hamilton Felix',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0070f3;">Inscrição Recebida com Sucesso!</h2>
        <p>Olá ${name},</p>
        <p>Sua inscrição para a Mentoria Conjunta de <strong>Marcelo Murilo e Hamilton Felix</strong> foi recebida com sucesso!</p>
        
        ${paymentMethod === "pix" ? pixInstructions : installmentsInstructions}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        
        <h3>Programa da Mentoria</h3>
        
        <h4 style="color: #0070f3; margin-top: 20px;">Módulo 1 - Transição para conselhos (Marcelo Murilo - 8H)</h4>
        <ul style="line-height: 1.8;">
          <li><strong>Sessão 1 - 13/out (19:00-20:00):</strong> Definindo seu nicho e propósito</li>
          <li><strong>Sessão 2 - 20/out (19:00-20:00):</strong> Perfil de conselheiro que vende</li>
          <li><strong>Sessão 3 - 27/out (19:00-20:00):</strong> Posts que geram oportunidades</li>
          <li><strong>Sessão 4 - 03/nov (19:00-20:00):</strong> Interações que multiplicam alcance</li>
          <li><strong>Sessão 5 - 10/nov (19:00-20:00):</strong> Conectando com quem importa</li>
          <li><strong>Sessão 6 - 17/nov (19:00-20:00):</strong> Vendas e eventos estratégicos</li>
          <li><strong>Sessão 7 - 24/nov (19:00-20:00):</strong> Aspectos práticos dos conselhos</li>
          <li><strong>Sessão 8 - 01/dez (19:00-20:00):</strong> Integração e planejamento futuros</li>
        </ul>

        <h4 style="color: #0070f3; margin-top: 20px;">Módulo 2 - Criando novos conselhos (Hamilton Felix - 4H)</h4>
        <ul style="line-height: 1.8;">
          <li><strong>Sessão 1 - 24/nov (19:00-20:00):</strong> Prospecção de empresas</li>
          <li><strong>Sessão 2 - 24/nov (20:00-21:00):</strong> Fechamento de Projetos</li>
          <li><strong>Sessão 3 - 01/dez (19:00-20:00):</strong> Implementando o Conselho</li>
          <li><strong>Sessão 4 - 01/dez (20:00-21:00):</strong> Evoluindo o Conselho</li>
        </ul>

        <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin-top: 20px;">
          <h4 style="color: #0070f3; margin-top: 0;">Grupo de WhatsApp</h4>
          <p style="margin: 0;">Um grupo de WhatsApp será criado com todos os participantes. Neste grupo você receberá as instruções para participação das lives e todas as informações importantes sobre a mentoria.</p>
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Em caso de dúvidas, entre em contato conosco.<br/>
          Atenciosamente,<br/>
          Equipe Marcelo Murilo & Hamilton Felix
        </p>
      </div>
    `,
    trackingSettings: {
      clickTracking: {
        enable: false
      }
    }
  };

  await client.send(msg);
}
