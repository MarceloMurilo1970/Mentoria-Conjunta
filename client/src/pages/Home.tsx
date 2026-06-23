import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, RotateCcw } from "lucide-react";
import Hero from "@/components/Hero";
import ProgramSection from "@/components/ProgramSection";
import RegistrationForm from "@/components/RegistrationForm";
import MentoriaCountdown from "@/components/MentoriaCountdown";
import BatchPricing, { isBatchesOpen, isBatchesComingSoon, useBatchPrices } from "@/components/BatchPricing";
import TestimonialTile from "@/components/TestimonialTile";
import rodrigoPadovezPhoto from "@assets/IMG_7578_1763994202676.jpeg";
import marceloMartinPhoto from "@assets/image_1764036231605.png";
import isabellaSaltonPhoto from "@assets/image_1764036258435.png";
import luizBuenoPhoto from "@assets/image_1764117861153.png";
import elizaCoralPhoto from "@assets/image_1764192966736.png";
import ronaldoCarneiroPhoto from "@assets/image_1764434298472.png";
import marcosArgachoyPhoto from "@assets/marcos_argachoy.jpg";

const testimonials = [
  {
    name: "Eliza Coral",
    role: "Conselheira",
    linkedin: "https://www.linkedin.com/in/elizacoral/",
    photo: elizaCoralPhoto,
    videoThumbnail: elizaCoralPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQBJLpH2UKSkTZlSmulTOJZEASSapXm0obuhEB8eOdsGqOo?e=B0gPA9",
    text: "A Mentoria do Marcelo Murilo e do Hamilton Felix superou as minhas expectativas. Com ferramentas avançadas e relatórios personalizados, em pouco tempo já tenho resultados positivos. A troca de experiências com os outros participantes também é muito rica.\n\nO que mais gostei na Mentoria foi a clareza do caminho que preciso percorrer ainda. Além disso aprendi a usar ferramentas que aceleram os resultados. Hoje sei que quanto mais cedo iniciarmos a preparação para atuação em conselhos maiores são as chances de termos sucesso como conselheiros de alto impacto. Muitas dicas valiosas, muita prática, muita troca. Vale a pena e eu recomendo.",
    highlightPhrase: "A Mentoria do Marcelo Murilo e do Hamilton Felix superou as minhas expectativas. Vale a pena e eu recomendo.",
  },
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
  {
    name: "Ronaldo Carneiro",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/ronaldocarneirobr/",
    photo: ronaldoCarneiroPhoto,
    videoThumbnail: ronaldoCarneiroPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCIaHgiaB8YQ5zEAsGeu8LzAd-qj36gJXa9RYbXzp2hVsI?e=hxUtdy",
    text: "Por atuar em Consultoria com empresas familiares, em 2025 fui estudar governança corporativa.\n\nConheci o Marcelo Murilo, acompanhei seus posts no LinkedIn, gostei da forma que ele ensina.\n\nAlém de empresário, Marcelo atua como Conselheiro em várias empresas. Ele tem autoridade e maestria para orientar a transição para Conselhos.\n\nFiz Mentoria em grupo com MM, aprendi muito, principalmente para identificar meu propósito profissional.\n\nCada encontro, um relatório claro, objetivo e personalizado, direcionando a pessoa a se conhecer, como também compartilhar conhecimentos de forma estruturada para alcançar seu público alvo.\n\nDefinição de propósito, clareza sobre meu posicionamento, além de entender cada passo da transição de forma estruturada e prompts de IA personalizados que me ajudam muito no dia a dia, foram apenas alguns dos ganhos que obtive na Mentoria com MM.\n\nValeu muito o investimento!",
    highlightPhrase: "Valeu muito o investimento!",
  },
  {
    name: "Marcos Argachoy",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/marcosargachoy/",
    photo: marcosArgachoyPhoto,
    text: "Olá Murilo, ontem mesmo estava trocando mensagens com o Marcelo Martin (turma 1) e comentando como foi e tem sido muito proveitosa a mentoria com vocês!\n\nEstou conseguindo excelentes conexões, ainda não tive frutos dessas conexões mas me surpreendi com alguns comentários bem satisfatórios de CEOs e outros conselheiros e em números já adicionados mais de 600 contatos novos e importantes!\n\nSó tenho a agradecer e elogiar a mentoria, vale cada centavo investido!!!! E muito mais! Grande abraço e vamos nos falando!",
    highlightPhrase: "Só tenho a agradecer e elogiar a mentoria, vale cada centavo investido!",
  },
  {
    name: "Denys Nicolosi",
    role: "Engenheiro, Professor e Empresário",
    linkedin: "https://www.linkedin.com/in/denys-nicolosi-366b9a185/",
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQD_X6IbZrsNSITDUrkblu7UAZRgGqqK-DkgyXBz21Daeow?e=0Jshjb",
    text: "Diferente dos outros cursos de conselheiro que focam apenas na governança, essa mentoria foca em algo mais vital hoje, que é a construção de uma figura de autoridade. Ele entrega técnicas avançadas de inteligência artificial que potencializam muito a nossa especialidade, criando esse mecanismo de autoridade, principalmente no LinkedIn, de uma forma que eu nunca tinha visto.\n\nNa segunda parte, o Hamilton traz uma clareza impressionante entre entrega de valor e a precificação estratégica das nossas atividades. O que realmente me marcou muito foi o forte embasamento em conceitos éticos e também conceito missionário dessa nossa atuação.\n\nÉ uma mentoria inovadora e extremamente eficaz pra quem busca resultados práticos, pra você se posicionar com um nível de autoridade reconhecida e com excelência no que você já sabe fazer.",
    highlightPhrase: "Ele entrega técnicas avançadas de inteligência artificial que potencializam muito a nossa especialidade, criando esse mecanismo de autoridade de uma forma que eu nunca tinha visto.",
  },
  {
    name: "Haroldo Lima",
    role: "Conselheiro",
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQDbsUFKjzHZQ5AFGpnmYcvaAUR9u5sHeOdJxLhwVvt0RvU?e=6cC4oi",
    text: "Eu confesso que no começo eu tava bastante reticente com relação a como a mentoria conseguiria me ajudar, até porque eu tava com cinco iniciativas, algumas bastante similares, outras não. E durante todas as sessões, eu vi que independentemente das minhas iniciativas, a mentoria conseguiu me ajudar, conseguiu me colocar num outro patamar.\n\nEu fiquei bastante, bastante mesmo impressionado, não só com a qualidade das discussões que nós tínhamos às segundas-feiras, mas principalmente com os materiais que você desenvolvia antes de cada sessão e principalmente aquele que você disponibilizava pós-sessões.\n\nRealmente era algo bastante tailor made, algo bastante focado em cada um dos mentorados. Isso realmente me ajudou e vem me ajudando bastante.",
    highlightPhrase: "Com relação à mentoria, eu confesso que eu fiquei bastante, bastante mesmo impressionado, não só com a qualidade das discussões... mas principalmente com os materiais...",
  },
];

export default function Home() {
  const registrationRef = useRef<HTMLDivElement>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if countdown already ended (after Dec 4, 2025 20:45 BRT)
    const targetDate = new Date("2025-12-04T20:45:00-03:00");
    if (new Date() >= targetDate) {
      setShowRegistrationForm(true);
    }
  }, []);

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [selectedTurma, setSelectedTurma] = useState<"turma_3" | "turma_4">("turma_3");

  const batchesOpen = isBatchesOpen(new Date());
  const comingSoon = isBatchesComingSoon(new Date());
  const priceInfo = useBatchPrices(selectedTurma);

  return (
    <div className="min-h-screen">

      {/* Back Button */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
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
          <p className="text-muted-foreground text-center mb-8 max-w-3xl mx-auto text-lg">
            10 sessões estruturadas com frameworks comprovados para transformar experiência executiva em autoridade reconhecida no mercado de conselhos
          </p>
          
          {/* Módulo 1 Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-border"></div>
            <h3 className="text-xl font-bold text-primary">Módulo 1 — Marcelo Murilo</h3>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Sessão 1 - Framework PREP */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Framework PREP-MM</h3>
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
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você terá acesso à plataforma da mentoria, onde encontrará sempre todos os seus materiais, gravações e relatórios personalizados:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Análise completa da sua avaliação PREP-MM e do seu LinkedIn atual, com sugestões de tipos de empresas para focar, seu propósito sugerido, personas prioritárias e suas prováveis dores</li>
                </ul>
              </div>
            </div>

            {/* Sessão 2 - LinkedIn Estratégico */}
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
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Insight: 80% das oportunidades de conselho começam digitalmente
              </p>
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Análise profunda do seu perfil do LinkedIn com sugestões personalizadas: sua Headline ideal, seção "Sobre" pronta para copiar e colar, e descrição otimizada de cada experiência, tudo alinhado ao seu propósito definido na sessão anterior</li>
                </ul>
              </div>
            </div>

            {/* Sessão 3 - Autoridade por Conteúdo */}
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
                  <span><strong className="text-foreground">Algoritmo 2025:</strong> Comentários longos e dwell time {'>'} curtidas e volume</span>
                </li>
              </ul>
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Seus prompts personalizados para gerar insights, posts e imagens para publicar, tudo alinhado ao seu propósito, personas e dores. Inclui instruções para criar sua IA personalizada usando os prompts enviados</li>
                </ul>
              </div>
            </div>

            {/* Sessão 4 - Interações Estratégicas */}
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
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                "Comentar gera mais autoridade que postar"
              </p>
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Seus prompts personalizados para gerar comentários em posts de terceiros, respostas aos comentários em seus posts, e insights e artigos para sua newsletter. Inclui instruções para criar sua IA personalizada</li>
                </ul>
              </div>
            </div>

            {/* Sessão 5 - Networking com Propósito */}
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
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Instruções detalhadas de como usar ferramentas para automatizar sua conexão com as personas certas e iniciar conversas estratégicas que geram oportunidades de negócio</li>
                </ul>
              </div>
            </div>

            {/* Sessão 6 - Framework 5C */}
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
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Acesso à sua Avaliação 5C personalizada que mede suas competências atuais e estabelece um plano de trabalho completo para maximizar seus resultados como conselheiro</li>
                </ul>
              </div>
            </div>

            {/* Sessão 7 - Due Diligence e Entrada Estratégica */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">7</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Due Diligence e Entrada Estratégica</h3>
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
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                "Entrar no conselho errado destrói reputação, energia e credibilidade"
              </p>
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Acesso à sua Avaliação de Impacto personalizada que permite medir e demonstrar aos seus contratantes como você gera valor e resultados concretos no conselho</li>
                </ul>
              </div>
            </div>

            {/* Sessão 8 - Revisão Completa */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">8</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Revisão Completa do Módulo 1</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Sessão de consolidação e esclarecimento de todas as dúvidas:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Revisão completa:</strong> Percorremos todo o conteúdo do Módulo 1</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Esclarecimento de dúvidas:</strong> Espaço aberto para sanar todas as questões pendentes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Ajustes finais:</strong> Refinamento do seu posicionamento e materiais</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Preparação para o Módulo 2:</strong> Transição para a fase de conquista de conselhos</span>
                </li>
              </ul>
              
              {/* Entregas da Sessão */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-foreground text-sm">Após esta sessão, você encontrará na plataforma:</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>Resumo completo da sessão, gravação e plano de ação semanal</li>
                  <li className="text-primary font-medium">Consolidação de todos os materiais do Módulo 1 e checklist de preparação para o Módulo 2</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Módulo 2 Header */}
          <div className="flex items-center gap-4 mb-8 mt-16">
            <div className="h-px flex-1 bg-border"></div>
            <h3 className="text-xl font-bold text-primary">Módulo 2 — Hamilton Felix</h3>
            <div className="h-px flex-1 bg-border"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">

            {/* Sessão 1 Módulo 2 - Prospecção de Empresas */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Prospecção de Empresas</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Identificar e abordar empresas com potencial real para sua atuação como conselheiro:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Mapeamento estratégico:</strong> Identificar empresas alinhadas ao seu perfil e expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Sinais de maturidade:</strong> Reconhecer empresas prontas para governança estruturada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Abordagem inicial:</strong> Como estabelecer contato de forma profissional e assertiva</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Construção de pipeline:</strong> Gestão sistemática de oportunidades em potencial</span>
                </li>
              </ul>
            </div>

            {/* Sessão 2 Módulo 2 - Fechamento de Projetos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Fechamento de Projetos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Converter oportunidades em posições concretas de conselho:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Proposta de valor:</strong> Articular claramente o que você entrega como conselheiro</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Negociação de termos:</strong> Remuneração, escopo, dedicação e expectativas mútuas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Formalização:</strong> Contratos, cláusulas de proteção e acordos de confidencialidade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Onboarding estruturado:</strong> Primeiros 90 dias para consolidar sua presença</span>
                </li>
              </ul>
            </div>

            {/* Sessão 3 Módulo 2 - Implementando o Conselho */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Implementando o Conselho</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Estruturar e operacionalizar conselhos que geram valor real:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Estrutura de governança:</strong> Regimento, rituais e documentação essencial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Dinâmica de reuniões:</strong> Pauta, preparação e condução de sessões produtivas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Relacionamento com gestão:</strong> Equilibrar governança e operação sem conflitos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Geração de valor:</strong> Contribuições tangíveis que justificam sua presença</span>
                </li>
              </ul>
            </div>

            {/* Sessão 4 Módulo 2 - Evoluindo o Conselho */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Evoluindo o Conselho</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Elevar a maturidade do conselho e consolidar sua prática como conselheiro:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Avaliação de desempenho:</strong> Métricas e indicadores de efetividade do conselho</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Evolução da governança:</strong> De consultivo para deliberativo, quando e como</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Portfólio de conselhos:</strong> Construir prática diversificada e sustentável</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Legado e sucessão:</strong> Deixar marcas positivas e preparar transições</span>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          {showRegistrationForm ? (
            <div className="space-y-12">
              <BatchPricing currentDate={new Date()} turmaId={selectedTurma} />
              {batchesOpen ? (
                <RegistrationForm
                  priceInfo={priceInfo}
                  defaultTurma={selectedTurma}
                  onTurmaChange={setSelectedTurma}
                />
              ) : (
                <Card className="max-w-2xl mx-auto border-muted">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {comingSoon ? 'Inscrições em breve!' : 'Inscrições Encerradas'}
                    </h3>
                    <p className="text-muted-foreground">
                      {comingSoon ? 'As Turmas 3 e 4 começam em 10 de Agosto de 2026. As inscrições abrem em breve!' : 'O período de inscrições para as Turmas 3 e 4 foi encerrado.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <MentoriaCountdown onCountdownEnd={() => setShowRegistrationForm(true)} />
          )}
        </div>
      </section>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Mentoria Marcelo Murilo & Hamilton Felix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
