import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Hero from "@/components/Hero";
import ProgramSection from "@/components/ProgramSection";
import RegistrationForm from "@/components/RegistrationForm";
import TestimonialTile from "@/components/TestimonialTile";
import rodrigoPadovezPhoto from "@assets/IMG_7578_1763994202676.jpeg";
import marceloMartinPhoto from "@assets/image_1764036231605.png";
import isabellaSaltonPhoto from "@assets/image_1764036258435.png";
import luizBuenoPhoto from "@assets/image_1764117861153.png";

const testimonials = [
  {
    name: "Isabella Salton",
    role: "Conselheira",
    linkedin: "https://www.linkedin.com/in/isabellasalton/",
    photo: isabellaSaltonPhoto,
    videoThumbnail: isabellaSaltonPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCojSNYaH_PQbbjXCLB5Fl5AQHpESo2vdDzg7IYo4s5xCE?e=fNFfzh",
    text: "Sou Isabella Salton, conselheira e mentora especializada em apoiar empresas familiares e de médio porte a profissionalizarem sua governança e integrarem ESG como estratégia real de crescimento — sem perder a essência que as trouxe até aqui.\n\nParticipar da primeira turma de Mentoria Coletiva do Marcelo Murilo tem sido uma experiência extremamente rica.\n\nAlém de ter um formato muito dinâmico, algo que realmente me motiva — encontrei aqui um espaço seguro para aprofundar meu propósito, testar novas abordagens, aprender sobre novas ferramentas e usar tudo na prática!\n\nO trabalho é muito personalizado e com entregas de alto valor. A metodologia tem muita clareza, precisão dos conteúdos e com uma condução impecável por parte do Marcelo Murilo.\n\nIsso torna o processo leve, consistente e transformador.\n\nEsse programa me ajudou a estruturar ainda mais meu posicionamento e minha atuação como conselheira.\n\nRecomendo com entusiasmo para quem deseja evoluir de verdade, com profundidade, propósito e método.",
    highlightPhrase: "O trabalho é muito personalizado e com entregas de alto valor.",
  },
  {
    name: "Luiz Fernando Bueno",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/luiz-fernando-araújo-bueno-7300439/",
    photo: luizBuenoPhoto,
    videoThumbnail: luizBuenoPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCLXRKz11CXT4GMkGo4HcdvAXEmPYcFAuHFPGLym-rVNNU?e=GfK2JW",
    text: "Gostaria de deixar aqui o meu depoimento sobre a mentoria que estou fazendo com Hamilton Félix e Marcelo Murilo.\n\nSe você quer um caminho para vencer como conselheiro e um jeito de falar com mais gente sobre a sua trajetória, não perca a oportunidade de estar com essa dupla.\n\nSerão 10 encontros com muita teoria, mas muita prática também.\n\nMentoria coletiva, mas com foco individual através de relatórios encaminhados.\n\nHamilton e Marcelo além de muito conhecimento tem uma network invejável.\n\nLuiz Fernando de Araújo Bueno",
    highlightPhrase: "Se você quer um caminho para vencer como conselheiro e um jeito de falar com mais gente sobre a sua trajetória, não perca a oportunidade de estar com essa dupla.",
  },
  {
    name: "Marcelo Martin",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/marcelomartin-advisor/",
    photo: marceloMartinPhoto,
    videoThumbnail: marceloMartinPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQBwRkpxyyLVTb1b94nLjC-FAeraco6gQb08BILxxHxTfVw?e=amCZ7Z",
    text: "A mentoria do Marcelo Murilo traz toda sua experiência e conhecimento na trilha para orientar futuros membros de conselho a desempenhar a função de forma profissional e assertiva, com técnica e domínio dos fatores de sucesso, em complemento às suas expertises. Realmente uma oportunidade fantástica!",
    highlightPhrase: "Realmente uma oportunidade fantástica!",
  },
  {
    name: "Rodrigo Padovez",
    role: "Especialista em Healthtech",
    linkedin: "https://www.linkedin.com/in/rodrigopadovez/",
    photo: rodrigoPadovezPhoto,
    videoThumbnail: rodrigoPadovezPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQAVO4vgVbeiQqpL9H1hg2UXATnb2c7NmjoRWL6f9f3dWrQ?e=hh8RlZ",
    text: "Quando comecei a mentoria com o Marcelo, eu já tinha 25 anos de experiência em healthtech. Mas faltava transformar tudo isso em posicionamento claro.\n\nO que mais me surpreendeu foi a precisão. Nada genérico, nada teórico. Em poucas sessões ele me ajudou a enxergar onde eu realmente gero valor e como comunicar isso sem ruído.\n\nEu cheguei achando que precisava apenas organizar meu LinkedIn. Saí com algo muito maior: clareza de nicho, propósito lapidado, narrativa estruturada e um método para gerar conteúdo que conversa exatamente com fundadores e CEOs de healthtech.\n\nFoi um processo direto, prático e orientado à execução. Implementação imediata. E isso fez toda diferença.\n\nHoje meu posicionamento está muito mais estratégico. Meu conteúdo gera conexão real com quem eu quero apoiar. E o melhor: com autenticidade.\n\nSe você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
    highlightPhrase: "Se você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
  },
];

export default function Home() {
  const registrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Live
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Hero onRegisterClick={scrollToRegistration} />

      {/* About Section - A QUEM SE DESTINA */}
      <section className="py-20 md:py-24 bg-background" id="sobre">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-6">
            Para Quem é Esta Mentoria
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Esta mentoria é exclusiva para <strong className="text-foreground">Conselheiros certificados ou profissionais em transição</strong> que desejam construir autoridade genuína no mercado de governança corporativa.
            </p>
            <p>
              Se você já possui experiência executiva sólida, mas sente que falta transformar esse conhecimento em <strong className="text-foreground">posicionamento claro</strong>, <strong className="text-foreground">visibilidade estratégica</strong> e <strong className="text-foreground">oportunidades concretas</strong> em conselhos, esta mentoria foi desenhada para você.
            </p>
            
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">O que você vai conquistar:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Clareza de nicho</strong> – Identificar onde você realmente gera valor e como comunicar isso sem ruído</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Posicionamento estratégico</strong> – Construir uma narrativa autêntica que conversa com quem você quer apoiar</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Método de geração de conteúdo</strong> – Sistema prático para criar autoridade consistente no LinkedIn</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Conexões reais</strong> – Atrair oportunidades qualificadas em conselhos de forma orgânica</span>
                </li>
              </ul>
            </div>

            <p className="pt-6">
              A metodologia é <strong className="text-foreground">100% orientada à execução</strong>. Nada de teoria genérica ou fórmulas vazias. Cada sessão entrega clareza imediata e ações práticas que você implementa durante o programa.
            </p>
            
            <div className="bg-card border border-border p-6 rounded-lg mt-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">Mentoria coletiva com acompanhamento personalizado</h4>
              <p className="text-muted-foreground">
                Embora seja uma mentoria em grupo, <strong className="text-foreground">você receberá relatórios e prompts completamente personalizados</strong> para usar no seu processo individual. Cada participante tem sua própria jornada mapeada e acompanhada de forma única.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section - O QUE VOCÊ VAI APRENDER */}
      <section className="py-20 md:py-24 bg-card" id="metodologia">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            A Jornada Completa da Mentoria
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-3xl mx-auto text-lg">
            Sete sessões estruturadas com frameworks comprovados para transformar experiência executiva em autoridade reconhecida no mercado de conselhos
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Framework PREP - Módulo 1 */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Framework PREP</h3>
                  <p className="text-sm text-muted-foreground font-mono">Módulo 1 - Marcelo Murilo</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                O primeiro passo: definir seu nicho, propósito, personas e dores. Estruturação do posicionamento estratégico através de quatro pilares fundamentais:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Definição estratégica:</strong> Nicho, propósito, personas e suas dores específicas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Propósito:</strong> Clareza individual, valor diferenciado e comunicação impactante</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Reputação:</strong> As 4 dimensões que constroem sua moeda no mercado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Experiência:</strong> Transformar trajetória executiva em sabedoria aplicável a conselhos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Presença:</strong> Influenciar sem autoridade formal</span>
                </li>
              </ul>
            </div>

            {/* LinkedIn Estratégico */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">LinkedIn Estratégico</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Transformar seu perfil em plataforma de autoridade reconhecida:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Headline que vende:</strong> Sua frase de posicionamento em 220 caracteres</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Sobre estratégico:</strong> Estrutura Problema → Solução → Prova → Convite</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Experiências em CAI:</strong> Contexto → Ação → Impacto (não tarefas)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Curadoria de competências:</strong> Skills que comunicam especialização, não generalismo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Prompts personalizados:</strong> Receba prompts prontos para gerar insights e posts para o LinkedIn</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Insight: 80% das oportunidades de conselho começam digitalmente
              </p>
            </div>

            {/* Autoridade por Conteúdo */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Autoridade por Conteúdo</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Sistema de geração de conteúdo que constrói reputação consistente:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Arquitetura do post:</strong> Hook → Contexto → Desenvolvimento → CTA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Brevidade inteligente:</strong> Densidade útil sem floreios</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Golden Hour:</strong> Maximizar engajamento nos primeiros 90 minutos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Algoritmo 2025:</strong> Comentários longos e dwell time {'>'}  curtidas e volume</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Prompts personalizados:</strong> Gere comentários estratégicos, respostas profissionais e Newsletters com prompts prontos</span>
                </li>
              </ul>
            </div>

            {/* Comentários Estratégicos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Interações que Constroem Autoridade</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                O poder invisível dos comentários estratégicos:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">4 camadas de profundidade:</strong> Do elogio vazio à provocação elegante</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Visibilidade orgânica:</strong> Aparecer onde o público certo já está</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Reconhecimento indireto:</strong> Líderes notam quem contribui, não quem se autopromove</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Newsletters do LinkedIn:</strong> Canal direto com 100% de entrega</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Ferramentas de automação:</strong> Aprenda a usar ferramentas de automação de conexões de forma estratégica e ética</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                "Comentar gera mais autoridade que postar"
              </p>
            </div>

            {/* Networking com Propósito */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">5</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Networking com Propósito</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Construir rede de influência real, não lista de contatos:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Critérios de curadoria:</strong> Alinhamento de valores e proximidade temática</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Automação ética:</strong> Consistência sem perder humanidade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Interações intencionais:</strong> Cada conexão fortalece sua narrativa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Follow-up inteligente:</strong> Transformar interações em relacionamentos</span>
                </li>
              </ul>
            </div>

            {/* Framework 5C */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">6</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Framework 5C</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                As cinco competências que definem seu valor para CEOs e fundadores:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Competência:</strong> Densidade técnica como base da autoridade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Caráter:</strong> Confiança que antecede a técnica</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Contexto:</strong> Interpretar antes de decidir</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Contribuição:</strong> O que te torna indispensável na mesa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Credibilidade:</strong> Sua moeda definitiva no mercado</span>
                </li>
              </ul>
            </div>

            {/* Due Diligence e Entrada Estratégica em Conselhos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">7</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Due Diligence e Entrada Estratégica em Conselhos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                A etapa crítica antes de aceitar qualquer posição em conselho:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Perguntas reveladoras:</strong> As 5 perguntas para sócios e CEO que expõem maturidade real</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Documentação obrigatória:</strong> Demonstrações financeiras, atas, mapa de riscos e plano estratégico</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Red flags decisivos:</strong> Sinais de alerta que inviabilizam seu impacto e protegem sua reputação</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Blindagem contratual:</strong> Cláusulas de proteção, limitação de responsabilidade e indenização</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Calendário estratégico:</strong> Sazonalidade dos conselhos e anatomia mensal da governança</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                "Entrar no conselho errado destrói reputação, energia e credibilidade"
              </p>
            </div>

            {/* Módulo 2 - Hamilton Felix - Construindo Conselhos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">8</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">A Experiência de Construir Conselhos</h3>
                  <p className="text-sm text-muted-foreground font-mono">Módulo 2 - Hamilton Felix</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Como transformar sua trajetória executiva em posições de conselho estratégico:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Jornada do conselheiro:</strong> Da primeira oportunidade à consolidação da prática</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Tipos de conselho:</strong> Consultivo, deliberativo, fiscal - quando cada um faz sentido</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Preparação estruturada:</strong> O que estudar antes da primeira reunião</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Dinâmica de reuniões:</strong> Como contribuir de forma assertiva sem sobrepor a gestão</span>
                </li>
              </ul>
            </div>

            {/* Fomentar Implementação de Conselhos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">9</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Fomentar a Implementação de Conselhos</h3>
                  <p className="text-sm text-muted-foreground font-mono">Módulo 2 - Hamilton Felix</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Como empresas estruturam e implementam conselhos que realmente funcionam:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Estágios de maturidade:</strong> De startups a empresas estabelecidas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Composição ideal:</strong> Diversidade de experiências e complementaridade de competências</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Governança efetiva:</strong> Cadência, rituais e documentação que geram valor</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Métricas de impacto:</strong> Como medir a contribuição do conselho</span>
                </li>
              </ul>
            </div>

            {/* Implementar Conselhos e Criar Espaço */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">10</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Implementar Conselhos e Criar Seu Espaço</h3>
                  <p className="text-sm text-muted-foreground font-mono">Módulo 2 - Hamilton Felix</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Estratégias práticas para criar e ocupar posições em conselhos de empresas:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Mapeamento de oportunidades:</strong> Onde estão as empresas que precisam do seu perfil</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Abordagem estratégica:</strong> Como posicionar sua candidatura e demonstrar valor</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Negociação de mandato:</strong> Escopo, remuneração, tempo e expectativas claras</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Construção de portfólio:</strong> Da primeira cadeira à prática consolidada de conselheiro</span>
                </li>
              </ul>
            </div>
          </div>

          {/* O que CEOs compram */}
          <div className="bg-primary/5 border-l-4 border-primary p-8 rounded-r-lg">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              O Que CEOs e Fundadores Realmente Compram
            </h3>
            <p className="text-muted-foreground mb-6">
              Decisores não contratam conselheiros por currículo. Eles compram <strong className="text-foreground">efeitos</strong>:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Redução de Risco</h4>
                <p className="text-sm text-muted-foreground">
                  Evitar prejuízos futuros vale mais que qualquer promessa
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Clareza Mental</h4>
                <p className="text-sm text-muted-foreground">
                  Organizar pensamentos e cenários complexos
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Velocidade Estratégica</h4>
                <p className="text-sm text-muted-foreground">
                  A presença certa acelera execução
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Visão Externa Qualificada</h4>
                <p className="text-sm text-muted-foreground">
                  Enxergar o que a operação não consegue ver
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Confiança Operacional</h4>
                <p className="text-sm text-muted-foreground">
                  Alguém com quem dividir conversas sensíveis
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Elevator Pitch Afiado</h4>
                <p className="text-sm text-muted-foreground">
                  30 segundos que abrem portas e 2 minutos que criam desejo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 md:py-24 bg-card" id="depoimentos">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Depoimentos de Mentorados
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Veja o que nossos mentorados têm a dizer sobre a experiência
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialTile
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                text={testimonial.text}
                photo={testimonial.photo}
                linkedin={testimonial.linkedin}
                highlightPhrase={testimonial.highlightPhrase}
                videoUrl={testimonial.videoUrl}
                videoThumbnail={testimonial.videoThumbnail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Program Section */}
      <ProgramSection />
      
      {/* Registration Section */}
      <section className="py-20 md:py-24 bg-card" id="inscricao" ref={registrationRef}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <RegistrationForm />
        </div>
      </section>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Mentoria Marcelo Murilo & Hamilton Felix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
