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
    <p>Para confirmar sua inscrição, realize o pagamento em 5x de R$ 1.250,00 (total R$ 6.250,00) através do link:</p>
    <p><a href="https://mpago.li/2e8FvqE" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pagar com Cartão de Crédito</a></p>
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
        
        <h3>Sobre a Mentoria</h3>
        <p><strong>Tema:</strong> Como criar autoridade, construir oportunidades e conquistar conselhos</p>
        <p><strong>Data de Início:</strong> 09/10/2025 às 20h</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Em caso de dúvidas, entre em contato conosco.<br/>
          Atenciosamente,<br/>
          Equipe Marcelo Murilo & Hamilton Felix
        </p>
      </div>
    `,
  };

  await client.send(msg);
}
