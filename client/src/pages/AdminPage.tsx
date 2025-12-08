import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Check, X, Users, Calendar, Award, MessageSquare, ExternalLink, Lightbulb, TrendingUp, MessageCircleReply, Clock, RotateCcw, DollarSign, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";
import BatchPricing from "@/components/BatchPricing";

interface EventRegistration {
  timestamp: string;
  name: string;
  phone: string;
  linkedin: string;
  hasCertification: string;
  boardCount: string;
  interests: string;
}

interface TopicSuggestion {
  topic: string;
  keywords: string[];
  count: number;
  relevantComments: string[];
}

// Respostas personalizadas baseadas no conteúdo da mentoria
const topicResponses: Record<string, string> = {
  "Como conseguir a primeira posição em conselho": `Excelente pergunta que está no coração da nossa mentoria! Vamos abordar isso de forma completa:

📌 **Sessão 1 - Construção de Propósito (PREP)**: Começamos definindo seu posicionamento estratégico. Você vai construir sua frase de propósito clara: "Eu ajudo empresas do setor X a resolver o problema Y através da minha experiência em Z." Sem clareza de propósito, você será "mais um" no mercado.

📌 **Sessão 6 - Framework 5C-MM**: Apresento as 5 competências que CEOs realmente compram: Competência técnica, Caráter, Contexto, Contribuição e Credibilidade. Você vai aprender a demonstrar valor antes de pedir a cadeira.

📌 **Sessão 7 - Due Diligence e Entrada Estratégica**: Ensino o processo completo de entrada em conselhos - desde as perguntas certas para sócios e CEOs, até o checklist de documentos obrigatórios e cláusulas contratuais de proteção.

📌 **Módulo 2 (Hamilton Felix)**: Prospecção de Empresas e Fechamento de Projetos - a metodologia prática para identificar empresas-alvo e converter conversas em convites reais.

A conquista do primeiro conselho é consequência de autoridade construída com consistência, não de pedidos ou indicações aleatórias.`,

  "Construção de autoridade e posicionamento no LinkedIn": `Este é um dos pilares centrais da mentoria! Dedicamos três sessões completas a isso:

📌 **Sessão 2 - LinkedIn Estratégico**: Reformulamos completamente seu perfil. Você vai receber análise personalizada da sua headline, seção "Sobre" e experiências, com sugestões prontas para copiar e colar. Seu perfil vai comunicar exatamente quem você ajuda e como.

📌 **Sessão 3 - Geração de Posts de Autoridade**: Ensino a arquitetura completa do post que engaja: Hook (2 primeiras linhas), Contexto, Desenvolvimento e CTA. Você vai aprender sobre a "Golden Hour" (primeiros 90 minutos após postar), o que o algoritmo de 2025 valoriza, e a metodologia "Brevidade Inteligente" para dizer mais com menos.

📌 **Sessão 4 - Comentários e Interações**: "Postar te apresenta, comentar te posiciona!" Você vai dominar as 4 camadas de comentários (do elogio vazio à provocação elegante), aprender onde comentar para gerar conexões reais, e como transformar comentários em relacionamentos através de mensagens diretas inteligentes.

Você vai receber prompts personalizados de IA para gerar posts, imagens e comentários alinhados ao seu propósito.`,

  "Networking estratégico para conselhos": `Networking é um dos grandes diferenciais da nossa metodologia! Abordamos isso principalmente na:

📌 **Sessão 5 - Networking e Automação**: Ensino que "ter contatos" é diferente de "construir uma rede". Você vai aprender critérios para escolher quem merece sua energia (CEOs, conselheiros, influenciadores de pensamento), técnicas práticas de busca avançada no LinkedIn, e como usar ferramentas de automação de forma ética.

📌 **Sessão 4 - Transformando Interações em Relacionamentos**: O ciclo completo: Comente → Conecte → Converse. Estratégias de follow-up inteligente sem parecer interesseiro.

📌 **Sessão 6 - Credibilidade como Moeda**: Sua rede qualificada define o peso da sua palavra. Quem te recomenda determina as portas que se abrem.

O propósito que você define na Sessão 1 se torna o critério de seleção das conexões - cada relacionamento deve reforçar sua mensagem central.`,

  "Transição de carreira executiva para conselheiro": `Esta é uma das transições mais desafiadoras e abordamos ela com profundidade:

📌 **Sessão 1 - PREP (Propósito, Reputação, Experiência, Presença)**: O framework completo para reposicionar sua carreira. Experiência executiva ≠ experiência para conselhos. Você vai aprender as 5 dimensões que importam: lidar com incerteza, influenciar stakeholders sem cargo, conduzir transformações, vivência com governança e resultados mensuráveis.

📌 **Sessão 1 - Foco e Legado**: Escolha 2 setores, não 20. Defina critérios de rejeição (saber o que NÃO aceitar). Construa sua narrativa de forma que faça sentido para quem contrata conselheiros.

📌 **Sessão 6 - O que CEOs Compram**: Decisores não compram serviços, compram efeitos: redução de risco, clareza mental, velocidade estratégica, visão externa qualificada. Você vai aprender a traduzir sua experiência executiva em valor de conselheiro.

📌 **Sessão 7 - Posicionamento na Mesa**: Como se posicionar com autoridade usando as técnicas de Aporia e Maiêutica de Sócrates - provocar desconforto estratégico e ajudar a "parir" ideias melhores.`,

  "Certificações e qualificações para conselhos": `Ótima pergunta! Abordamos isso de forma realista:

📌 **Sessão 1 - Reputação vs Credenciais**: Certificação é importante, mas não é suficiente. Reputação não é ser conhecido, é ser RECONHECIDO. As 4 dimensões: Técnica (o que você domina), Ética (como se comporta), Entrega (o que você entrega) e Relacionamento (como você influencia).

📌 **Sessão 6 - Framework 5C-MM**: Competência vai além de certificação - inclui expertise setorial aplicada, visão estratégica clara, fluência financeira e gestão de riscos. Você vai receber o Assessment 5C para medir suas competências e criar um plano de desenvolvimento.

📌 **Sessão 7 - O que Realmente Importa na Entrada**: A pergunta que expõe governança real: "Quando foi a última vez que este conselho disse não para a gestão?" CEOs valorizam julgamento e capacidade de leitura contextual, não apenas diplomas.

A mentoria complementa sua formação técnica com o que falta: posicionamento, autoridade percebida e metodologia comercial.`,

  "Remuneração e precificação de conselheiros": `Tema fundamental que abordamos de forma prática:

📌 **Sessão 6 - Demonstração de Valor Aplicada**: Antes de falar de preço, você precisa demonstrar valor. O elevator pitch do conselheiro (30 segundos) e o pitch expandido (2 minutos) que cria desejo de conversar mais.

📌 **Sessão 6 - O que CEOs Compram**: Eles não compram horas, compram: redução de risco, clareza mental, velocidade estratégica, visão externa qualificada e confiança operacional. Sua precificação deve refletir o valor do problema que você resolve.

📌 **Sessão 7 - Contrato MM**: Cláusulas essenciais que protegem e valorizam: natureza consultiva clara, limitação de responsabilidade, direito de revisar atas, cláusula de indenização e defesa jurídica.

📌 **Módulo 2 (Hamilton)**: Fechamento de Projetos - a negociação comercial prática, estruturação de propostas e modelos de remuneração (fixo, variável, por projeto).`,

  "Governança corporativa na prática": `Governança é o ambiente onde você vai atuar! Abordamos isso em profundidade:

📌 **Sessão 7 - Anatomia da Governança**: O calendário estratégico dos conselhos: Janeiro (metas e estratégia), Março (AGO e transparência), Maio/Junho (ajuste de rotas), Set/Out (orçamento e investimentos), Dezembro (avaliação de liderança).

📌 **Sessão 7 - O Papel do CGO (Chief Governance Officer)**: A figura silenciosa mais poderosa - orquestra informações, estrutura agenda estratégica, media tensões e monitora deliberações.

📌 **Sessão 7 - Definindo Escopo Real**: Conselho atua em estratégia, riscos, sucessão e cultura. Conselho NÃO gerencia pessoas ou processos. A fronteira entre orientar e interferir.

📌 **Módulo 2 (Hamilton)**: Implementando o Conselho e Evoluindo o Conselho - como estruturar um conselho do zero e como fazer evoluir um conselho existente para maior maturidade.`,

  "Empresas familiares e conselhos consultivos": `Tema muito relevante! Empresas familiares são um dos focos da mentoria:

📌 **Sessão 1 - Tipos de Empresa que te Escolhem**: Empresas familiares têm características únicas: foco em legado e profissionalização, dinâmicas de sucessão, tensão entre família e negócio. Você vai definir se este é seu nicho e como se posicionar.

📌 **Sessão 7 - As 5 Perguntas para Sócios**: Especialmente relevantes para empresas familiares: "O que aconteceu para buscarem um conselho agora?", "Para onde cada sócio quer ir?" (visões divergentes), "Que decisões estão engavetadas?".

📌 **Sessão 7 - Due Diligence Ética, Política e Cultural**: Em empresas familiares, entender dinâmicas políticas e culturais é ainda mais crítico. O CEO suporta contradição? Os sócios querem provocação ou validação?

📌 **Módulo 2 (Hamilton)**: Implementando o Conselho - metodologia específica para criar conselhos consultivos em empresas de médio porte e familiares.`,

  "Due diligence e avaliação de empresas": `Este é o tema central da Sessão 7 - uma das mais práticas da mentoria:

📌 **Sessão 7 - A Pergunta que Expõe Governança Real**: "Quando foi a última vez que este conselho disse não para a gestão?" A resposta revela maturidade, independência e nível real de tensionamento estratégico.

📌 **Sessão 7 - Rol MM de Documentos Obrigatórios**: Demonstrações financeiras de 3 anos, análise de contingências e dívidas, atas e pautas dos últimos 12 meses, mapa de riscos e compliance, plano estratégico e KPIs, organograma funcional e real.

📌 **Sessão 7 - Perguntas Críticas para o CEO**: "O que te tira o sono hoje?", "Onde você acredita que eu agrego?", "Como você reage a tensionamentos estratégicos?", "O que a empresa ainda não está pronta para enfrentar?"

📌 **Sessão 7 - Red Flags para Recusar**: Conselho decorativo, falta de transparência, sócios desalinhados, CEO avesso ao contraditório. Entrar no conselho errado destrói reputação, energia e credibilidade.`,

  "Desenvolvimento de competências de conselheiro": `Desenvolvimento de competências é estruturado através do Framework 5C-MM:

📌 **Sessão 6 - As 5 Competências (5C-MM)**: 
• Competência: expertise setorial, fluência financeira, visão estratégica, gestão de riscos
• Caráter: integridade, independência de pensamento, confidencialidade, compromisso com bem comum
• Contexto: leitura organizacional, sensibilidade cultural, percepção de tensões, timing estratégico
• Contribuição: perguntas que destravam, pensamento sistêmico, solução de problemas, valor mensurável
• Credibilidade: reputação setorial, resultados comprovados, rede qualificada, visibilidade estratégica

📌 **Sessão 6 - Assessment 5C**: Você vai receber uma ferramenta de autoavaliação para medir onde está em cada dimensão e criar seu plano de desenvolvimento personalizado.

📌 **Sessão 1 - PRESENÇA**: A força invisível - influência sem autoridade. 6 dimensões: intelectual, emocional, comunicativa, facilitação, autoridade e síntese.`,

  "Uso de IA e inteligência artificial": `A IA é uma ferramenta integrada em toda a mentoria!

📌 **Sessão 3 - Prompts Personalizados para Posts**: Você vai receber prompts customizados para gerar insights, posts e imagens alinhados ao seu propósito, com instruções de customização para ChatGPT e outras IAs.

📌 **Sessão 4 - Prompts para Comentários e Newsletter**: Prompts específicos para gerar comentários de alto valor, respostas estratégicas e conteúdo de newsletter, mantendo sua voz autêntica.

📌 **Sessão 5 - Ferramentas de Automação**: Como usar Shield, Favikon e outras ferramentas para mapear líderes, analisar engajamento e automatizar networking de forma ética (mensagens personalizadas em escala, follow-ups automáticos).

📌 **Todas as Sessões**: Cada apresentação foi criada com imagens geradas por IA (DALL-E), demonstrando na prática como integrar tecnologia ao trabalho de conselheiro.

Você sai da mentoria dominando IA como ferramenta de produtividade e posicionamento.`,

  "Cases práticos e experiências reais": `A mentoria é 100% baseada em experiências reais!

📌 **Sessão 1 - Método STAR para Cases**: Você vai documentar seus cases com a estrutura Situação, Tarefa, Ação e Resultado. Praticar contar suas histórias em 2, 10 e 30 minutos.

📌 **Sessão 1 - Materiais de Prova**: Casos no formato STAR, números e "antes vs depois", recomendações e validação por pares, conteúdo público alinhado ao foco. Sem isso, não há convite.

📌 **Mentoria Coletiva (Turma 1)**: Os encontros incluem discussão de cases reais dos participantes - cada um apresenta sua frase de propósito e recebe feedback do grupo e do mentor.

📌 **Sessão 6 - Demonstração de Valor**: Traduzir sua experiência em ação aplicada ao cenário do CEO. Mostrar o que você faria diante do problema apresentado.

📌 **Depoimentos de Mentorados**: Isabella, Rodrigo, Marcelo e Luiz Fernando compartilham suas transformações reais após a mentoria.`,

  "Como criar oportunidades em conselhos": `Criar oportunidades é consequência de todo o processo da mentoria:

📌 **Sessão 1 - Matching Estratégico**: Onde você gera mais valor? Setor, porte, estágio, geografia, estrutura de controle. Dor dominante do momento. Fit entre sua experiência e a agenda do conselho.

📌 **Sessão 5 - Networking com Propósito**: Oportunidades surgem de relacionamentos, não de currículos. Generosidade estratégica: dar antes de pedir constrói confiança duradoura.

📌 **Sessão 6 - Pipeline MM de Oportunidades**: Da autoridade silenciosa até a conversa comercial estruturada. Eventos como aceleradores inteligentes - ambientes onde CEOs escutam sem defesas.

📌 **Sessão 6 - Perguntas de Descoberta**: "Qual é a decisão mais difícil que você está adiando?", "O que hoje tira o seu sono?", "Onde você sente que está voando às cegas?" - perguntas que abrem portas.

📌 **Módulo 2 (Hamilton)**: Prospecção de Empresas e Fechamento de Projetos - metodologia prática para identificar e converter oportunidades.`,

  "Estratégias de prospecção e abordagem": `Prospecção e abordagem são temas do Módulo 2 com Hamilton Felix, complementados pelo Módulo 1:

📌 **Sessão 6 - Elevator Pitch do Conselheiro**: Os 30 segundos que abrem portas - clareza extrema, problema que resolve, prova de credibilidade, fechamento leve. E o pitch expandido de 2 minutos.

📌 **Sessão 6 - Venda Consultiva para Conselhos**: O posicionamento correto reduz fricção, ansiedade e necessidade de autopromoção. Reputação estratégica cria tração e torna a venda consequência, não esforço.

📌 **Sessão 5 - Abordagem via LinkedIn**: Mensagem direta inteligente - agradeça, complemente e aprofunde a conversa. Evite abordagens forçadas. Conexão nasce da naturalidade.

📌 **Módulo 2 (Hamilton Felix)**: 
• Prospecção de Empresas: como identificar empresas-alvo com base no seu posicionamento
• Fechamento de Projetos: como converter conversas em convites e estruturar propostas comerciais`,

  "Conselhos fiscais e comitês especializados": `Conselhos fiscais e comitês são ótimas portas de entrada! Abordamos isso na mentoria:

📌 **Sessão 1 - Matching Estratégico**: Definir onde você gera mais valor inclui tipos de órgão: conselho deliberativo, consultivo, fiscal ou comitês especializados (auditoria, ESG, estratégia, sustentabilidade). Cada um tem dinâmica diferente.

📌 **Sessão 7 - Anatomia da Governança**: O calendário estratégico inclui os comitês - comitê de auditoria revisa controles, comitê de estratégia analisa investimentos, comitê ESG monitora sustentabilidade. Você vai entender onde sua expertise se encaixa.

📌 **Sessão 7 - Perguntas para Sócios**: "Qual é a estrutura de governança atual?" - entender se há comitês formados, conselho fiscal ativo, e onde estão as lacunas.

📌 **Sessão 6 - Competência Técnica (5C-MM)**: Para conselhos fiscais, fluência financeira é crítica. Para comitês de sustentabilidade, expertise setorial em ESG. Você vai mapear qual competência desenvolver para cada tipo de posição.`,

  "Áreas de atuação e nichos específicos": `Definir sua área de atuação é o primeiro passo da jornada! Isso é fundamental na mentoria:

📌 **Sessão 1 - PREP e Foco Estratégico**: Propósito define onde você gera mais valor. Experiência inclui setores onde você atuou, competências desenvolvidas e problemas que sabe resolver. Escolha 2 setores, não 20 - foco é poder.

📌 **Sessão 1 - Matching Estratégico**: Onde sua experiência em contabilidade, tecnologia, academia ou outra área se torna diferencial? Qual é a "dor dominante" que você resolve para CEOs?

📌 **Sessão 5 - Networking com Critérios**: Sua área de especialização define quem você deve conhecer. CEOs do seu setor, influenciadores de pensamento na sua área, outros conselheiros com expertise complementar.

📌 **Sessão 6 - Demonstração de Valor**: Traduzir sua experiência específica (seja contabilidade, tecnologia, inovação ou academia) em valor aplicável ao conselho. O CEO precisa ver como sua expertise resolve o problema DELE.

Seu diferencial nasce da intersecção entre experiência setorial, competências únicas e problemas que você sabe resolver melhor que outros.`,
};

// Função para obter resposta de um tema
function getTopicResponse(topic: string): string | null {
  return topicResponses[topic] || null;
}

function analyzeTopics(registrations: EventRegistration[]): TopicSuggestion[] {
  const topicPatterns: { topic: string; keywords: string[]; excludeKeywords?: string[] }[] = [
    { 
      topic: "Como conseguir a primeira posição em conselho", 
      keywords: ["primeiro conselho", "primeira posição", "começar em conselho", "iniciar em conselho", "entrada em conselho", "entrar em conselho", "como conseguir", "como conquistar"]
    },
    { 
      topic: "Construção de autoridade e posicionamento no LinkedIn", 
      keywords: ["linkedin", "autoridade", "posicionamento", "visibilidade", "marca pessoal", "personal branding", "conteúdo", "posts", "publicar", "perfil profissional"]
    },
    { 
      topic: "Networking estratégico para conselhos", 
      keywords: ["networking", "rede de contatos", "conexões estratégicas", "relacionamento profissional", "network"]
    },
    { 
      topic: "Transição de carreira executiva para conselheiro", 
      keywords: ["transição", "carreira executiva", "executivo", "c-level", "ceo", "diretor", "mudança de carreira", "migrar para conselho", "sair do executivo"]
    },
    { 
      topic: "Certificações e qualificações para conselhos", 
      keywords: ["certificação", "certificado", "curso de conselho", "formação em conselho", "ibgc", "qualificação", "preparação técnica", "capacitação"]
    },
    { 
      topic: "Remuneração e precificação de conselheiros", 
      keywords: ["remuneração", "salário de conselheiro", "quanto ganha", "pagamento", "honorários", "cobrar", "precificar", "valor de conselheiro"]
    },
    { 
      topic: "Governança corporativa na prática", 
      keywords: ["governança", "corporativa", "compliance", "boas práticas de governança"]
    },
    { 
      topic: "Empresas familiares e conselhos consultivos", 
      keywords: ["empresa familiar", "família empresária", "consultivo", "advisory board", "pme", "pequena empresa", "média empresa", "conselho consultivo"]
    },
    { 
      topic: "Due diligence e avaliação de empresas", 
      keywords: ["due diligence", "avaliar empresa", "análise de empresa", "riscos empresariais", "avaliar riscos"]
    },
    { 
      topic: "Desenvolvimento de competências de conselheiro", 
      keywords: ["competência de conselheiro", "habilidades de conselheiro", "soft skills", "desenvolver competências", "capacidade técnica"]
    },
    { 
      topic: "Uso de IA e inteligência artificial", 
      keywords: ["inteligência artificial", " ia ", "chatgpt", "gpt", "openai", "prompt", "automação com ia", "machine learning", "ai "]
    },
    { 
      topic: "Cases práticos e experiências reais", 
      keywords: ["case", "caso real", "experiência real", "história de sucesso", "depoimento", "exemplo prático"]
    },
    { 
      topic: "Como criar oportunidades em conselhos", 
      keywords: ["criar oportunidade", "oportunidade de conselho", "conquistar conselho", "conseguir conselho", "porta de entrada", "acesso a conselho"]
    },
    { 
      topic: "Estratégias de prospecção e abordagem", 
      keywords: ["prospecção", "prospectar empresa", "abordar empresa", "abordagem inicial", "pitch de conselheiro", "apresentação pessoal"]
    },
    { 
      topic: "Conselhos fiscais e comitês especializados", 
      keywords: ["conselho fiscal", "comitê", "fiscal", "sustentabilidade", "comitê de auditoria", "comitê estratégico"]
    },
    { 
      topic: "Áreas de atuação e nichos específicos", 
      keywords: ["contabilidade", "acadêmica", "tecnologia", "área de atuação", "nicho", "especialização", "setor específico", "inovação"]
    },
  ];

  // Helper function to check if keyword matches as whole word
  const matchesWholeWord = (text: string, keyword: string): boolean => {
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
    return regex.test(text);
  };

  const suggestions: TopicSuggestion[] = [];

  for (const pattern of topicPatterns) {
    const matchingComments: string[] = [];
    let totalMatches = 0;
    const foundKeywords: Set<string> = new Set();

    for (const reg of registrations) {
      const text = reg.interests;
      const matchedKeywords = pattern.keywords.filter(keyword => matchesWholeWord(text, keyword));
      
      if (matchedKeywords.length > 0) {
        totalMatches++;
        matchedKeywords.forEach(k => foundKeywords.add(k));
        matchingComments.push(`${reg.name}: "${reg.interests}"`);
      }
    }

    if (totalMatches > 0) {
      suggestions.push({
        topic: pattern.topic,
        keywords: Array.from(foundKeywords),
        count: totalMatches,
        relevantComments: matchingComments,
      });
    }
  }

  // Sort by count descending
  return suggestions.sort((a, b) => b.count - a.count);
}

function EventRegistrationsSection() {
  const { data: registrations, isLoading, error } = useQuery<EventRegistration[]>({
    queryKey: ['/api/event-registrations'],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Erro ao carregar inscrições do evento. Verifique a conexão com o Google Sheets.
      </div>
    );
  }

  const totalCount = registrations?.length || 0;
  const withCertification = registrations?.filter(r => r.hasCertification === 'Sim').length || 0;
  const withoutCertification = totalCount - withCertification;

  // Count board positions
  const boardCounts: Record<string, number> = {};
  registrations?.forEach(r => {
    const count = r.boardCount || 'Não informado';
    boardCounts[count] = (boardCounts[count] || 0) + 1;
  });

  // Aggregate interests/topics
  const allInterests = registrations?.map(r => r.interests).filter(Boolean) || [];

  // Analyze topics for suggestions
  const topicSuggestions = registrations ? analyzeTopics(registrations) : [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-event-total">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Com Certificação</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="text-with-cert">{withCertification}</div>
            <p className="text-xs text-gray-400">
              {totalCount > 0 ? `${Math.round((withCertification / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Sem Certificação</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="text-without-cert">{withoutCertification}</div>
            <p className="text-xs text-gray-400">
              {totalCount > 0 ? `${Math.round((withoutCertification / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Posições em Conselhos</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {Object.entries(boardCounts).slice(0, 4).map(([count, qty]) => (
                <div key={count} className="flex justify-between">
                  <span className="text-gray-400">{count}:</span>
                  <span className="font-medium text-white">{qty}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Topic Suggestions */}
      {topicSuggestions.length > 0 && (
        <Card className="bg-gray-900 border-blue-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="h-5 w-5 text-blue-400" />
              Sugestões Consolidadas para a Live
            </CardTitle>
            <CardDescription className="text-gray-400">
              Temas identificados a partir dos interesses dos participantes, ordenados por relevância
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topicSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="space-y-3"
                  data-testid={`suggestion-${index}`}
                >
                  {/* Header do Tópico */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-semibold text-white text-lg">{suggestion.topic}</h4>
                    </div>
                    <Badge className="flex items-center gap-1 bg-blue-600">
                      <TrendingUp className="h-3 w-3" />
                      {suggestion.count} {suggestion.count === 1 ? 'menção' : 'menções'}
                    </Badge>
                  </div>
                  
                  {suggestion.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {suggestion.keywords.slice(0, 5).map((keyword, kIndex) => (
                        <Badge key={kIndex} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Card 1: Comentários Relacionados */}
                  {suggestion.relevantComments.length > 0 && (
                    <div className="border border-gray-700 bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-300">Comentários Relacionados ({suggestion.relevantComments.length}):</p>
                      </div>
                      <div className="space-y-2">
                        {suggestion.relevantComments.map((comment, cIndex) => (
                          <p key={cIndex} className="text-sm text-gray-300 border-l-2 border-gray-600 pl-3">
                            {comment}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card 2: Resposta da Mentoria */}
                  {getTopicResponse(suggestion.topic) && (
                    <div className="border border-blue-500/30 bg-blue-950/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircleReply className="h-4 w-4 text-blue-400" />
                        <p className="text-sm font-semibold text-blue-400">Como abordaremos na Mentoria:</p>
                      </div>
                      <div className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                        {getTopicResponse(suggestion.topic)?.split('\n').map((line, lineIndex) => {
                          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
                          return (
                            <p 
                              key={lineIndex} 
                              className={`${line.startsWith('📌') ? 'mt-2' : ''} ${line.startsWith('•') ? 'ml-4' : ''}`}
                              dangerouslySetInnerHTML={{ __html: formattedLine }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Separador entre tópicos */}
                  {index < topicSuggestions.length - 1 && (
                    <div className="border-b border-gray-700 pt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Topics List */}
      {allInterests.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              Tópicos Individuais dos Participantes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Todos os comentários dos inscritos sobre o que gostariam de ver no evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrations?.map((reg, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                  <p className="font-medium text-sm text-white">{reg.name}</p>
                  <p className="text-sm text-gray-400 whitespace-pre-wrap">{reg.interests}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Inscritos no Evento</CardTitle>
          <CardDescription className="text-gray-400">
            Inscrições para o evento ao vivo de 04/12/2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="w-[50px] text-gray-400">#</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Telefone</TableHead>
                    <TableHead className="text-gray-400">LinkedIn</TableHead>
                    <TableHead className="text-gray-400">Certificação</TableHead>
                    <TableHead className="text-gray-400">Conselhos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => (
                    <TableRow key={index} data-testid={`row-event-${index}`} className="border-gray-800">
                      <TableCell className="font-medium text-white">{index + 1}</TableCell>
                      <TableCell className="text-sm text-gray-300">{reg.timestamp}</TableCell>
                      <TableCell className="text-white">{reg.name}</TableCell>
                      <TableCell className="text-gray-300">{reg.phone}</TableCell>
                      <TableCell>
                        {reg.linkedin && (
                          <a 
                            href={reg.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                          >
                            Perfil <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={reg.hasCertification === 'Sim' ? 'bg-green-600' : 'bg-gray-600'}>
                          {reg.hasCertification}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{reg.boardCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Commission table data based on batch pricing
const BATCH_CONFIG = [
  { 
    batch: 1, 
    deadline: "07/12/2025", 
    pixPrice: 8000, 
    installmentPrice: 1775, 
    installments: 5, 
    installmentTotal: 8875,
    cardFee: 781,
    taxRate: 0.1175,
    mmRate: 0.633,
    hfRate: 0.317,
    vendorRate: 0.05,
  },
  { 
    batch: 2, 
    deadline: "31/12/2025", 
    pixPrice: 8700, 
    installmentPrice: 1930, 
    installments: 5, 
    installmentTotal: 9650,
    cardFee: 849,
    taxRate: 0.1175,
    mmRate: 0.633,
    hfRate: 0.317,
    vendorRate: 0.05,
  },
  { 
    batch: 3, 
    deadline: "04/01/2026", 
    pixPrice: 9400, 
    installmentPrice: 2085, 
    installments: 5, 
    installmentTotal: 10425,
    cardFee: 917,
    taxRate: 0.1175,
    mmRate: 0.633,
    hfRate: 0.317,
    vendorRate: 0.05,
  },
];

// Calculate commissions for a registration
function calculateCommissions(reg: Registration, batchConfig: typeof BATCH_CONFIG[0]) {
  const isPix = reg.paymentMethod === 'pix';
  const total = isPix ? batchConfig.pixPrice : batchConfig.installmentTotal;
  const cardFee = isPix ? 0 : batchConfig.cardFee;
  const netBeforeTax = total - cardFee;
  const taxes = Math.round(netBeforeTax * batchConfig.taxRate);
  const netAfterTax = netBeforeTax - taxes;
  
  const hasVendor = !!reg.vendor?.trim();
  const vendorComm = hasVendor ? Math.round(total * batchConfig.vendorRate) : 0;
  
  // When no vendor: split 2/3 MM and 1/3 HF from net after tax
  // When vendor: use configured rates from net after tax minus vendor commission
  const distributableAmount = netAfterTax - vendorComm;
  
  let mmComm: number;
  let hfComm: number;
  
  if (hasVendor) {
    mmComm = Math.round(distributableAmount * batchConfig.mmRate);
    hfComm = Math.round(distributableAmount * batchConfig.hfRate);
  } else {
    // 2/3 for MM, 1/3 for HF
    mmComm = Math.round(distributableAmount * (2/3));
    hfComm = Math.round(distributableAmount * (1/3));
  }
  
  return {
    total,
    cardFee,
    netBeforeTax,
    taxes,
    netAfterTax,
    vendorComm,
    mmComm,
    hfComm,
  };
}

function MentorshipRegistrationsSection() {
  const { toast } = useToast();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pendente' | 'pago' | 'parcial'>('pendente');
  const [paidAmount, setPaidAmount] = useState('');
  const [remainingPaymentDate, setRemainingPaymentDate] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorValue, setVendorValue] = useState('');
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchValue, setBatchValue] = useState<number>(1);

  const PIX_TOTAL = 8000;

  const { data: registrations, isLoading, error } = useQuery<Registration[]>({
    queryKey: ['/api/registrations'],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/registrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Inscrição excluída",
        description: "A inscrição foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a inscrição.",
        variant: "destructive",
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, received }: { id: string; received: boolean }) => {
      await apiRequest("PATCH", `/api/registrations/${id}/payment`, { received });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Status atualizado",
        description: "O status do pagamento foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const paymentStatusMutation = useMutation({
    mutationFn: async (data: { id: string; paymentStatus: string; paidAmount?: number; totalAmount?: number; remainingPaymentDate?: string | null }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/payment-status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setPaymentModalOpen(false);
      toast({
        title: "Status atualizado",
        description: "O status do pagamento foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const vendorMutation = useMutation({
    mutationFn: async (data: { id: string; vendor: string | null; batch?: number }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/vendor`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setEditingVendorId(null);
      setEditingBatchId(null);
      toast({
        title: "Vendedor atualizado",
        description: "O vendedor foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o vendedor.",
        variant: "destructive",
      });
    },
  });

  const handleSaveVendor = (id: string) => {
    vendorMutation.mutate({ id, vendor: vendorValue.trim() || null, batch: batchValue });
  };

  const startEditingVendor = (reg: Registration) => {
    setEditingVendorId(reg.id);
    setVendorValue(reg.vendor || '');
    setBatchValue(reg.batch || 1);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a inscrição de "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePayment = (id: string, currentStatus: boolean) => {
    paymentMutation.mutate({ id, received: !currentStatus });
  };

  const openPaymentModal = (reg: Registration) => {
    setSelectedRegistration(reg);
    setPaymentStatus((reg.paymentStatus as 'pendente' | 'pago' | 'parcial') || 'pendente');
    setPaidAmount(reg.paidAmount?.toString() || '');
    setRemainingPaymentDate(reg.remainingPaymentDate ? new Date(reg.remainingPaymentDate).toISOString().split('T')[0] : '');
    setPaymentModalOpen(true);
  };

  const handleSavePaymentStatus = () => {
    if (!selectedRegistration) return;

    // Validate partial payment fields
    if (paymentStatus === 'parcial') {
      const paidNum = Number(paidAmount);
      if (isNaN(paidNum) || paidNum <= 0 || paidNum >= PIX_TOTAL) {
        toast({
          title: "Valor inválido",
          description: "O valor pago deve ser maior que 0 e menor que R$ 8.000",
          variant: "destructive",
        });
        return;
      }
    }

    const paidAmountNum = paymentStatus === 'parcial' ? Number(paidAmount) : (paymentStatus === 'pago' ? PIX_TOTAL : 0);

    paymentStatusMutation.mutate({
      id: selectedRegistration.id,
      paymentStatus,
      paidAmount: paidAmountNum,
      totalAmount: PIX_TOTAL,
      remainingPaymentDate: paymentStatus === 'parcial' && remainingPaymentDate ? remainingPaymentDate : null,
    });
  };

  const getRemainingAmount = () => {
    const paid = Number(paidAmount) || 0;
    return PIX_TOTAL - paid;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Erro ao carregar inscrições da mentoria.
      </div>
    );
  }

  const paidCount = registrations?.filter(r => r.paymentReceived).length || 0;
  const totalCount = registrations?.length || 0;
  const pixCount = registrations?.filter(r => r.paymentMethod === 'pix').length || 0;
  const installmentsCount = totalCount - pixCount;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white" data-testid="text-mentorship-total">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Pagamentos Confirmados</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400" data-testid="text-paid">{paidCount}</div>
            <p className="text-xs text-gray-400">
              {totalCount > 0 ? `${Math.round((paidCount / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Aguardando Pagamento</CardTitle>
            <X className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400" data-testid="text-pending">{totalCount - paidCount}</div>
            <p className="text-xs text-gray-400">
              {totalCount > 0 ? `${Math.round(((totalCount - paidCount) / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-white">Formas de Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">PIX:</span>
                <span className="font-medium text-white">{pixCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Parcelado:</span>
                <span className="font-medium text-white">{installmentsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Reference Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            Tabela de Comissões por Lote
          </CardTitle>
          <CardDescription className="text-gray-400">
            Taxa de cartão: parcelado apenas | Impostos: 11,75% | MM: 63,3% | HF: 31,7% | Comissão Vendedor: 5%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Lote</TableHead>
                  <TableHead className="text-gray-400">Prazo</TableHead>
                  <TableHead className="text-gray-400">Tipo</TableHead>
                  <TableHead className="text-gray-400">Parcelas</TableHead>
                  <TableHead className="text-gray-400">Valor</TableHead>
                  <TableHead className="text-gray-400">Total</TableHead>
                  <TableHead className="text-gray-400">Taxa Cartão</TableHead>
                  <TableHead className="text-gray-400">Líquido s/ Impostos</TableHead>
                  <TableHead className="text-gray-400">Impostos (11,75%)</TableHead>
                  <TableHead className="text-gray-400">Líquido c/ Impostos</TableHead>
                  <TableHead className="text-gray-400 text-blue-400">MM (63,3%)</TableHead>
                  <TableHead className="text-gray-400 text-purple-400">HF (31,7%)</TableHead>
                  <TableHead className="text-gray-400 text-yellow-400">Vendedor (5%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BATCH_CONFIG.map((batch) => (
                  <>
                    <TableRow key={`${batch.batch}-pix`} className="border-gray-800">
                      <TableCell className="text-white font-medium">{batch.batch}</TableCell>
                      <TableCell className="text-gray-300">{batch.deadline}</TableCell>
                      <TableCell><Badge className="bg-blue-600">PIX</Badge></TableCell>
                      <TableCell className="text-gray-300">1</TableCell>
                      <TableCell className="text-gray-300">R$ {batch.pixPrice.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-white font-medium">R$ {batch.pixPrice.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-gray-500">-</TableCell>
                      <TableCell className="text-gray-300">R$ {batch.pixPrice.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-red-400">- R$ {Math.round(batch.pixPrice * batch.taxRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-green-400">R$ {Math.round(batch.pixPrice * (1 - batch.taxRate)).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-blue-400">R$ {Math.round(batch.pixPrice * (1 - batch.taxRate) * batch.mmRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-purple-400">R$ {Math.round(batch.pixPrice * (1 - batch.taxRate) * batch.hfRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-yellow-400">R$ {Math.round(batch.pixPrice * batch.vendorRate).toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                    <TableRow key={`${batch.batch}-card`} className="border-gray-800">
                      <TableCell className="text-white font-medium">{batch.batch}</TableCell>
                      <TableCell className="text-gray-300">{batch.deadline}</TableCell>
                      <TableCell><Badge className="bg-gray-600">Cartão</Badge></TableCell>
                      <TableCell className="text-gray-300">5</TableCell>
                      <TableCell className="text-gray-300">R$ {batch.installmentPrice.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-white font-medium">R$ {batch.installmentTotal.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-red-400">- R$ {batch.cardFee.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-gray-300">R$ {(batch.installmentTotal - batch.cardFee).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-red-400">- R$ {Math.round((batch.installmentTotal - batch.cardFee) * batch.taxRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-green-400">R$ {Math.round((batch.installmentTotal - batch.cardFee) * (1 - batch.taxRate)).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-blue-400">R$ {Math.round((batch.installmentTotal - batch.cardFee) * (1 - batch.taxRate) * batch.mmRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-purple-400">R$ {Math.round((batch.installmentTotal - batch.cardFee) * (1 - batch.taxRate) * batch.hfRate).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-yellow-400">R$ {Math.round(batch.installmentTotal * batch.vendorRate).toLocaleString('pt-BR')}</TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Inscrições da Mentoria - Turma 2</CardTitle>
          <CardDescription className="text-gray-400">
            Janeiro a Março 2026 - Marcelo Murilo & Hamilton Felix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="w-[50px] text-gray-400">#</TableHead>
                    <TableHead className="text-gray-400">Nome</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Telefone</TableHead>
                    <TableHead className="text-gray-400">Lote</TableHead>
                    <TableHead className="text-gray-400">Vendedor</TableHead>
                    <TableHead className="text-gray-400">Forma de Pagamento</TableHead>
                    <TableHead className="text-gray-400">Status Pagamento</TableHead>
                    <TableHead className="text-gray-400 text-blue-400">MM</TableHead>
                    <TableHead className="text-gray-400 text-purple-400">HF</TableHead>
                    <TableHead className="text-gray-400 text-yellow-400">Vendedor</TableHead>
                    <TableHead className="text-gray-400">Data de Inscrição</TableHead>
                    <TableHead className="w-[100px] text-gray-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => {
                    const batchConfig = BATCH_CONFIG.find(b => b.batch === (reg.batch || 1)) || BATCH_CONFIG[0];
                    const commissions = calculateCommissions(reg, batchConfig);
                    
                    return (
                    <TableRow key={reg.id} data-testid={`row-registration-${index}`} className="border-gray-800">
                      <TableCell className="font-medium text-white">{index + 1}</TableCell>
                      <TableCell className="text-white">{reg.name}</TableCell>
                      <TableCell className="text-gray-300">{reg.email}</TableCell>
                      <TableCell className="text-gray-300">{reg.phone}</TableCell>
                      <TableCell>
                        {editingVendorId === reg.id ? (
                          <Select value={batchValue.toString()} onValueChange={(val) => setBatchValue(Number(val))}>
                            <SelectTrigger className="w-20 bg-gray-800 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className="bg-primary">{reg.batch || 1}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingVendorId === reg.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={vendorValue}
                              onChange={(e) => setVendorValue(e.target.value)}
                              placeholder="Vendedor"
                              className="w-24 h-8 bg-gray-800 border-gray-600 text-sm"
                              data-testid={`input-vendor-${index}`}
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleSaveVendor(reg.id)}
                              disabled={vendorMutation.isPending}
                              className="h-8 w-8"
                              data-testid={`button-save-vendor-${index}`}
                            >
                              <Save className="w-4 h-4 text-green-400" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingVendorId(null)}
                              className="h-8 w-8"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className={reg.vendor ? "text-yellow-400" : "text-gray-500"}>
                              {reg.vendor || "-"}
                            </span>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => startEditingVendor(reg)}
                              className="h-6 w-6"
                              data-testid={`button-edit-vendor-${index}`}
                            >
                              <Edit2 className="w-3 h-3 text-gray-400" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={reg.paymentMethod === 'pix' ? 'bg-blue-600' : 'bg-gray-600'}
                          data-testid={`badge-payment-${index}`}
                        >
                          {reg.paymentMethod === 'pix' 
                            ? `PIX (R$ ${batchConfig.pixPrice.toLocaleString('pt-BR')})` 
                            : `5x R$ ${batchConfig.installmentPrice.toLocaleString('pt-BR')}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reg.paymentMethod === 'pix' ? (
                          <div className="space-y-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentModal(reg)}
                              data-testid={`button-payment-${index}`}
                              className={
                                reg.paymentStatus === 'pago' 
                                  ? "bg-green-600 hover:bg-green-700 border-green-600" 
                                  : reg.paymentStatus === 'parcial'
                                    ? "bg-orange-600 hover:bg-orange-700 border-orange-600"
                                    : "border-yellow-500 text-yellow-400 hover:bg-yellow-900/20"
                              }
                            >
                              {reg.paymentStatus === 'pago' ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Pago
                                </>
                              ) : reg.paymentStatus === 'parcial' ? (
                                <>
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Parcial
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Pendente
                                </>
                              )}
                            </Button>
                            {reg.paymentStatus === 'parcial' && (
                              <div className="text-xs text-gray-400">
                                <div>Pago: R$ {reg.paidAmount?.toLocaleString('pt-BR')}</div>
                                <div className="text-orange-400">Saldo: R$ {(8000 - (reg.paidAmount || 0)).toLocaleString('pt-BR')}</div>
                                {reg.remainingPaymentDate && (
                                  <div className="text-blue-400">
                                    Previsto: {new Date(reg.remainingPaymentDate).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant={reg.paymentReceived ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTogglePayment(reg.id, reg.paymentReceived)}
                            disabled={paymentMutation.isPending}
                            data-testid={`button-payment-${index}`}
                            className={reg.paymentReceived 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "border-yellow-500 text-yellow-400 hover:bg-yellow-900/20"
                            }
                          >
                            {reg.paymentReceived ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Pago
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Pendente
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-400 font-medium">
                        R$ {commissions.mmComm.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-purple-400 font-medium">
                        R$ {commissions.hfComm.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-yellow-400 font-medium">
                        {commissions.vendorComm > 0 ? `R$ ${commissions.vendorComm.toLocaleString('pt-BR')}` : '-'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(reg.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reg.id, reg.name)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${index}`}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Pagamento PIX</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedRegistration?.name} - Total: R$ 8.000,00
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Status do Pagamento</Label>
              <Select value={paymentStatus} onValueChange={(val) => setPaymentStatus(val as 'pendente' | 'pago' | 'parcial')}>
                <SelectTrigger className="bg-gray-800 border-gray-600">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago (Total)</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentStatus === 'parcial' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Valor Pago (R$)</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="Ex: 4000"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div className="p-3 bg-gray-800 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor Total:</span>
                    <span className="text-white">R$ 8.000,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor Pago:</span>
                    <span className="text-green-400">R$ {(Number(paidAmount) || 0).toLocaleString('pt-BR')},00</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-orange-400">Saldo Pendente:</span>
                    <span className="text-orange-400">R$ {getRemainingAmount().toLocaleString('pt-BR')},00</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remainingPaymentDate">Data Prevista do Pagamento do Saldo</Label>
                  <Input
                    id="remainingPaymentDate"
                    type="date"
                    value={remainingPaymentDate}
                    onChange={(e) => setRemainingPaymentDate(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePaymentStatus}
              disabled={paymentStatusMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {paymentStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <p className="text-gray-400">Mentoria Marcelo Murilo & Hamilton Felix</p>
        </div>

        <Tabs defaultValue="event" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800">
            <TabsTrigger value="event" data-testid="tab-event" className="data-[state=active]:bg-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              Evento ao Vivo
            </TabsTrigger>
            <TabsTrigger value="mentorship" data-testid="tab-mentorship" className="data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Mentoria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="event">
            <EventRegistrationsSection />
          </TabsContent>

          <TabsContent value="mentorship">
            <MentorshipRegistrationsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
