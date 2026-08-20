import { useState, Fragment, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2, Check, X, Users, Calendar, Award, MessageSquare, ExternalLink, Lightbulb, TrendingUp, MessageCircleReply, Clock, RotateCcw, DollarSign, Edit2, Edit, Save, User, UserCheck, ChevronDown, ChevronUp, MessageCircle, FileText, Receipt, Target, Phone, Linkedin, RefreshCw, UserPlus, Plus, Flame, Snowflake, ThermometerSun, Send, Bot, CalendarClock, CheckCircle2, Settings, Copy, Pencil, Download, Banknote, BarChart3, Upload } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Registration, Lead, Vendor, LeadActivity, LeadFollowUp, TurmaConfig, BatchPricingItem, PaymentPlan } from "@shared/schema";
import BatchPricing from "@/components/BatchPricing";
import { ScrollArea } from "@/components/ui/scroll-area";
import UnifiedRepassesSection from "@/components/UnifiedRepassesSection";

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
// Default tax rate - can be overridden by user
const DEFAULT_TAX_RATE = 0.1175;

// Get saved tax rate from localStorage or use default
function getSavedTaxRate(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('taxRate');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  }
  return DEFAULT_TAX_RATE;
}

// Base batch config without tax rate (tax rate applied dynamically)
const BATCH_CONFIG_BASE = [
  { 
    batch: 1, 
    deadline: "07/12/2025", 
    pixPrice: 8000, 
    installmentPrice: 1775, 
    installments: 5, 
    installmentTotal: 8875,
    cardFee: 781,
    mmRate: 0.6667,
    hfRate: 0.3333,
    vendorRate: 0.05,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
  },
  { 
    batch: 2, 
    deadline: "31/12/2025", 
    pixPrice: 8700, 
    installmentPrice: 1930, 
    installments: 5, 
    installmentTotal: 9650,
    cardFee: 849,
    mmRate: 0.6667,
    hfRate: 0.3333,
    vendorRate: 0.05,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
  },
  { 
    batch: 3, 
    deadline: "04/01/2026", 
    pixPrice: 9400, 
    installmentPrice: 2085, 
    installments: 5, 
    installmentTotal: 10425,
    cardFee: 917,
    mmRate: 0.6667,
    hfRate: 0.3333,
    vendorRate: 0.05,
    paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
    // CJ7 - 10x option
    installment10Price: 1100,
    installment10Total: 11000,
    cardFee10: 1657,
    paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
  },
  { 
    batch: 4, 
    deadline: "Condição Especial", 
    pixPrice: 10000, 
    installmentPrice: 1000, 
    installments: 10, 
    installmentTotal: 10000,
    cardFee: 1506,
    mmRate: 0.6667,
    hfRate: 0.3333,
    vendorRate: 0.05,
    paymentLink: "",
    installment10Price: 1000,
    installment10Total: 10000,
    cardFee10: 1506,
    paymentLink10: "",
  },
];

// Function to get BATCH_CONFIG with current tax rate
function getBatchConfig(taxRate: number) {
  return BATCH_CONFIG_BASE.map(batch => ({
    ...batch,
    taxRate,
  }));
}

// For backwards compatibility - default BATCH_CONFIG
const BATCH_CONFIG = getBatchConfig(getSavedTaxRate());

// Resolve the effective batch config for a registration, merging turma config rates.
// Returns same shape as BATCH_CONFIG items so all existing call sites work unchanged.
function resolveConfig(
  reg: Registration,
  turmaConfigsList: TurmaConfig[],
  taxRate: number
): typeof BATCH_CONFIG[0] {
  const batchNum = reg.batch || 3;
  const tc = turmaConfigsList.find(c => c.turmaId === reg.turma);
  if (tc && tc.batches && (tc.batches as BatchPricingItem[]).length > 0) {
    const items = tc.batches as BatchPricingItem[];
    const bp = items.find(b => b.batch === batchNum)
             ?? items.filter(b => b.batch <= batchNum).pop()
             ?? items[items.length - 1];
    if (bp) {
      const bpAny = bp as any;
      // New flexible plans format
      if (bpAny.plans && bpAny.plans.length > 0) {
        const plans = bpAny.plans as PaymentPlan[];
        const pixPlan = plans.find(p => p.id === 'pix') ?? plans.find(p => p.installments === 1);
        const card5Plan = plans.find(p => p.id === 'installments') ?? plans.filter(p => p.installments > 1)[0];
        const card10Plan = plans.find(p => p.id === 'installments10')
                        ?? [...plans].filter(p => p.installments > 1).sort((a, b) => b.installments - a.installments)[0];
        return {
          batch: batchNum,
          deadline: bp.deadline,
          pixPrice: pixPlan?.totalAmount ?? 0,
          installmentPrice: card5Plan ? Math.round(card5Plan.totalAmount / card5Plan.installments) : 0,
          installments: card5Plan?.installments ?? 5,
          installmentTotal: card5Plan?.totalAmount ?? 0,
          cardFee: card5Plan ? Math.round(card5Plan.totalAmount * card5Plan.feeRate) : 0,
          installment10Price: card10Plan ? Math.round(card10Plan.totalAmount / card10Plan.installments) : 0,
          installment10Total: card10Plan?.totalAmount ?? 0,
          cardFee10: card10Plan ? Math.round(card10Plan.totalAmount * card10Plan.feeRate) : 0,
          taxRate: tc.taxRate,
          mmRate: tc.mmRate,
          hfRate: tc.hfRate,
          vendorRate: tc.vendorCommissionRate,
          paymentLink: card5Plan?.paymentLink ?? tc.card5PaymentLink ?? '',
          paymentLink10: card10Plan?.paymentLink ?? tc.card10PaymentLink ?? '',
        };
      }
      // Legacy format (pixPrice/card5Total/etc.)
      const c5i = bpAny.card5Installments || 5;
      const c10i = bpAny.card10Installments || 10;
      const c10tot = bpAny.card10Total || bpAny.card5Total || 0;
      return {
        batch: batchNum,
        deadline: bp.deadline,
        pixPrice: bpAny.pixPrice ?? 0,
        installmentPrice: bpAny.card5Total ? Math.round(bpAny.card5Total / c5i) : 0,
        installments: c5i,
        installmentTotal: bpAny.card5Total ?? 0,
        cardFee: bpAny.card5Total ? Math.round(bpAny.card5Total * tc.card5FeeRate) : 0,
        installment10Price: c10tot ? Math.round(c10tot / c10i) : 0,
        installment10Total: c10tot,
        cardFee10: c10tot ? Math.round(c10tot * tc.card10FeeRate) : 0,
        taxRate: tc.taxRate,
        mmRate: tc.mmRate,
        hfRate: tc.hfRate,
        vendorRate: tc.vendorCommissionRate,
        paymentLink: tc.card5PaymentLink ?? '',
        paymentLink10: tc.card10PaymentLink ?? '',
      };
    }
  }
  // Fallback to legacy BATCH_CONFIG
  const base = getBatchConfig(taxRate);
  return base.find(b => b.batch === batchNum) ?? base[base.length - 1];
}

// Calculate commissions for a registration
// Order: 1) Tax on gross, 2) Subtract tax + card fee, 3) Vendor 5% if exists, 4) Split MM 2/3, HF 1/3
function calculateCommissions(reg: Registration, batchConfig: typeof BATCH_CONFIG[0]) {
  const isPix = reg.paymentMethod === 'pix';
  const is10x = reg.paymentMethod === 'installments10';
  
  // Get correct total and card fee based on payment method
  let total: number;
  let cardFee: number;
  
  if (isPix) {
    total = batchConfig.pixPrice;
    cardFee = 0;
  } else if (is10x && batchConfig.installment10Total) {
    total = batchConfig.installment10Total;
    cardFee = batchConfig.cardFee10 || 1657; // Default for batch 3
  } else {
    total = batchConfig.installmentTotal;
    cardFee = batchConfig.cardFee;
  }
  
  // Tax is calculated on GROSS amount (total)
  const taxes = Math.round(total * batchConfig.taxRate);
  
  // Net after deducting tax and card fee
  const netAfterTax = total - taxes - cardFee;
  
  const hasVendor = !!reg.vendor?.trim();
  // Vendor commission is 5% of net after tax (not gross)
  const vendorComm = hasVendor ? Math.round(netAfterTax * batchConfig.vendorRate) : 0;
  
  // Distributable amount after vendor commission
  const distributableAmount = netAfterTax - vendorComm;
  
  // Split using turma-level rates (default 2/3 MM, 1/3 HF)
  const mmComm = Math.round(distributableAmount * (batchConfig.mmRate ?? (2/3)));
  const hfComm = Math.round(distributableAmount * (batchConfig.hfRate ?? (1/3)));
  
  return {
    gross: total,
    total,
    cardFee,
    netBeforeTax: total - cardFee,
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
  const [editingObsId, setEditingObsId] = useState<string | null>(null);
  const [obsValue, setObsValue] = useState('');
  const [commissionTableOpen, setCommissionTableOpen] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchValue, setBatchValue] = useState<number>(3);
  const [vendorPaymentModalOpen, setVendorPaymentModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [vendorPaymentAmount, setVendorPaymentAmount] = useState('');
  const [vendorPaymentDate, setVendorPaymentDate] = useState('');
  const [vendorMaxPayment, setVendorMaxPayment] = useState(0);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceReg, setSelectedInvoiceReg] = useState<Registration | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  
  // Multi-NF emit modal state
  const [emitNfModalOpen, setEmitNfModalOpen] = useState(false);
  const [emitNfReg, setEmitNfReg] = useState<Registration | null>(null);
  const [emitNfAmount, setEmitNfAmount] = useState('');
  
  // Individual vendor commission edit states
  const [vendorCommissionEditModalOpen, setVendorCommissionEditModalOpen] = useState(false);
  const [editingCommissionReg, setEditingCommissionReg] = useState<Registration | null>(null);
  const [editingCommissionAmount, setEditingCommissionAmount] = useState('');
  const [editingCommissionMax, setEditingCommissionMax] = useState(0);
  
  // Tax rate configuration
  const [taxRate, setTaxRate] = useState(getSavedTaxRate());
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateInput, setTaxRateInput] = useState((getSavedTaxRate() * 100).toFixed(2));

  // Turma filter for entire page (single filter)
  const [turmaFilter, setTurmaFilter] = useState<'todas' | 'turma_2' | 'turma_3' | 'turma_4'>('todas');
  const dreTurmaFilter = turmaFilter; // Same filter for DRE section
  const setDreTurmaFilter = setTurmaFilter;
  const [manualRegTurma, setManualRegTurma] = useState<'turma_2' | 'turma_3' | 'turma_4'>('turma_4');
  
  // Dynamically computed BATCH_CONFIG based on current tax rate
  const currentBatchConfig = getBatchConfig(taxRate);

  // Turma config — used to override rates per turma
  const { data: turmaConfigsList = [] } = useQuery<TurmaConfig[]>({
    queryKey: ['/api/turma-configs'],
  });

  // rc(reg) = resolveConfig for a registration (merges turma config rates + batch prices)
  const rc = (r: Registration) => resolveConfig(r, turmaConfigsList, taxRate);

  // Transfer control states
  const [transferDashboardOpen, setTransferDashboardOpen] = useState(false);
  const [transferPaymentModalOpen, setTransferPaymentModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState<'hamilton' | 'vendor'>('hamilton');
  const [transferVendorName, setTransferVendorName] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferPaymentMethod, setTransferPaymentMethod] = useState('pix');
  const [transferSelectedRegIds, setTransferSelectedRegIds] = useState<Set<number>>(new Set());
  const [transferAmounts, setTransferAmounts] = useState<Record<string, number>>({});
  const [transferPaymentDate, setTransferPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get current user email and auth token from localStorage
  const currentUserEmail = localStorage.getItem('crm_vendor_email');
  const currentAuthToken = localStorage.getItem('crm_auth_token');
  const hasValidAuth = !!(currentUserEmail && currentAuthToken);
  
  // Admin check - only specific emails can delete payments
  const ADMIN_EMAILS = ["contato@marcelomurilo.com.br", "marcelo@marcelomurilo.com.br"];
  const isAdminUser = currentUserEmail ? ADMIN_EMAILS.includes(currentUserEmail.toLowerCase()) : false;
  
  // Manual registration states
  const [manualRegModalOpen, setManualRegModalOpen] = useState(false);
  const [manualRegName, setManualRegName] = useState('');
  const [manualRegEmail, setManualRegEmail] = useState('');
  const [manualRegPhone, setManualRegPhone] = useState('');
  const [manualRegCpfCnpj, setManualRegCpfCnpj] = useState('');
  const [manualRegRazaoSocial, setManualRegRazaoSocial] = useState('');
  const [manualRegPaymentMethod, setManualRegPaymentMethod] = useState<'pix' | 'installments' | 'installments10'>('pix');
  const [manualRegPaymentStatus, setManualRegPaymentStatus] = useState<'pendente' | 'parcial' | 'pago'>('pendente');
  const [manualRegTotalAmount, setManualRegTotalAmount] = useState('9400');
  const [manualRegPaidAmount, setManualRegPaidAmount] = useState('0');
  const [manualRegObservations, setManualRegObservations] = useState('');

  const { data: registrations, isLoading, error } = useQuery<Registration[]>({
    queryKey: ['/api/registrations'],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['/api/crm/vendors'],
  });

  const { data: financialSummary } = useQuery<{
    marceloTotal: number;
    marceloReceived: number;
    hamiltonTotal: number;
    hamiltonReceived: number;
  }>({
    queryKey: ['/api/financial-summary'],
    enabled: hasValidAuth,
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
    mutationFn: async (data: { id: string; vendor: string | null }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/vendor`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setEditingVendorId(null);
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

  const observationsMutation = useMutation({
    mutationFn: async (data: { id: string; observations: string | null }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/observations`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setEditingObsId(null);
      toast({
        title: "Observações atualizadas",
        description: "As observações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as observações.",
        variant: "destructive",
      });
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: async (data: { id: string; invoiceIssued: boolean; invoiceIssuedAt: string | null; invoices?: string }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/invoice`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "NF atualizada",
        description: "O status da nota fiscal foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a NF.",
        variant: "destructive",
      });
    },
  });

  const emitNfMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/registrations/${id}/emit-nf`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "NFS-e emitida",
        description: "A nota fiscal foi emitida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao emitir NFS-e",
        description: error?.message || "Não foi possível emitir a nota fiscal.",
        variant: "destructive",
      });
    },
  });

  const cancelNfMutation = useMutation({
    mutationFn: async ({ id, justificativa }: { id: string; justificativa: string }) => {
      return await apiRequest("POST", `/api/registrations/${id}/cancel-nf`, { justificativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "NFS-e cancelada",
        description: "A nota fiscal foi cancelada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar NFS-e",
        description: error?.message || "Não foi possível cancelar a nota fiscal.",
        variant: "destructive",
      });
    },
  });

  // Multi-NF mutations
  const emitNfPartialMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      return await apiRequest("POST", `/api/registrations/${id}/emit-nf-partial`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "NFS-e emitida",
        description: "A nota fiscal parcial foi emitida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao emitir NFS-e",
        description: error?.message || "Não foi possível emitir a nota fiscal.",
        variant: "destructive",
      });
    },
  });

  const cancelInvoiceMutation = useMutation({
    mutationFn: async ({ id, invoiceIndex, justificativa }: { id: string; invoiceIndex: number; justificativa?: string }) => {
      return await apiRequest("POST", `/api/registrations/${id}/invoices/${invoiceIndex}/cancel`, { justificativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "NF cancelada",
        description: "A nota fiscal foi cancelada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar NF",
        description: error?.message || "Não foi possível cancelar.",
        variant: "destructive",
      });
    },
  });

  const resendInvoiceMutation = useMutation({
    mutationFn: async ({ id, invoiceIndex }: { id: string; invoiceIndex: number }) => {
      return await apiRequest("POST", `/api/registrations/${id}/invoices/${invoiceIndex}/resend`, {});
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "A NF foi reenviada por email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar",
        description: error?.message || "Não foi possível enviar o email.",
        variant: "destructive",
      });
    },
  });

  const refreshInvoiceMutation = useMutation({
    mutationFn: async ({ id, invoiceIndex }: { id: string; invoiceIndex: number }) => {
      return await apiRequest("GET", `/api/registrations/${id}/invoices/${invoiceIndex}/refresh`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Status atualizado",
        description: "O status da NF foi atualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error?.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const batchMutation = useMutation({
    mutationFn: async (data: { id: string; batch: number }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/batch`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setEditingBatchId(null);
      toast({
        title: "Lote atualizado",
        description: "O lote foi alterado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lote.",
        variant: "destructive",
      });
    },
  });

  const vendorCommissionMutation = useMutation({
    mutationFn: async (data: { id: string; vendorCommissionPaid: number; vendorCommissionPaidAt: string | null }) => {
      await apiRequest("PATCH", `/api/registrations/${data.id}/vendor-commission`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({
        title: "Comissão atualizada",
        description: "O pagamento de comissão foi registrado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a comissão.",
        variant: "destructive",
      });
    },
  });

  const manualRegMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      cpfCnpj: string;
      razaoSocial?: string;
      paymentMethod: 'pix' | 'installments' | 'installments10';
      paymentStatus: 'pendente' | 'parcial' | 'pago';
      totalAmount: number;
      paidAmount: number;
      observations?: string;
      turma: 'turma_2' | 'turma_3' | 'turma_4';
    }) => {
      // Include signed auth token for fallback authentication in production
      const authToken = localStorage.getItem('crm_auth_token');
      return await apiRequest("POST", "/api/registrations/manual", {
        ...data,
        authToken: authToken || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      setManualRegModalOpen(false);
      resetManualRegForm();
      toast({
        title: "Inscrição criada",
        description: "A inscrição foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível criar a inscrição.",
        variant: "destructive",
      });
    },
  });

  const resetManualRegForm = () => {
    setManualRegName('');
    setManualRegEmail('');
    setManualRegPhone('');
    setManualRegCpfCnpj('');
    setManualRegRazaoSocial('');
    setManualRegPaymentMethod('pix');
    setManualRegPaymentStatus('pendente');
    setManualRegTotalAmount('9400');
    setManualRegPaidAmount('0');
    setManualRegObservations('');
    setManualRegTurma('turma_3');
  };

  const handleManualRegistration = () => {
    if (!manualRegName || !manualRegEmail || !manualRegPhone || !manualRegCpfCnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const totalAmount = Number(manualRegTotalAmount) || 0;
    const paidAmount = Number(manualRegPaidAmount) || 0;
    
    if (totalAmount < 100) {
      toast({
        title: "Valor inválido",
        description: "O valor total deve ser pelo menos R$ 100.",
        variant: "destructive",
      });
      return;
    }
    
    if (paidAmount > totalAmount) {
      toast({
        title: "Valor inválido",
        description: "O valor pago não pode ser maior que o valor total.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate payment status coherence
    if (manualRegPaymentStatus === 'pago' && paidAmount < totalAmount) {
      toast({
        title: "Status inconsistente",
        description: "Se o status é 'Pago', o valor pago deve ser igual ao valor total.",
        variant: "destructive",
      });
      return;
    }
    
    if (manualRegPaymentStatus === 'pendente' && paidAmount > 0) {
      toast({
        title: "Status inconsistente",
        description: "Se o status é 'Pendente', o valor pago deve ser zero.",
        variant: "destructive",
      });
      return;
    }

    manualRegMutation.mutate({
      name: manualRegName.trim(),
      email: manualRegEmail.trim().toLowerCase(),
      phone: manualRegPhone.trim(),
      cpfCnpj: manualRegCpfCnpj.trim(),
      razaoSocial: manualRegRazaoSocial.trim() || undefined,
      paymentMethod: manualRegPaymentMethod,
      paymentStatus: manualRegPaymentStatus,
      totalAmount,
      paidAmount,
      observations: manualRegObservations.trim() || undefined,
      turma: manualRegTurma,
    });
  };

  const handleSaveVendor = (id: string) => {
    const vendor = vendorValue === '__none__' ? null : (vendorValue.trim() || null);
    vendorMutation.mutate({ id, vendor });
  };

  const handleSaveObservations = (id: string) => {
    observationsMutation.mutate({ id, observations: obsValue.trim() || null });
  };

  const startEditingObservations = (reg: Registration) => {
    setEditingObsId(reg.id);
    setObsValue(reg.observations || '');
  };

  const startEditingVendor = (reg: Registration) => {
    setEditingVendorId(reg.id);
    setVendorValue(reg.vendor || '');
  };

  const startEditingBatch = (reg: Registration) => {
    setEditingBatchId(reg.id);
    setBatchValue(reg.batch || 1);
  };

  const handleSaveBatch = (id: string) => {
    batchMutation.mutate({ id, batch: batchValue });
  };

  const openInvoiceModal = (reg: Registration) => {
    setSelectedInvoiceReg(reg);
    setInvoiceAmount('');
    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);
    setInvoiceModalOpen(true);
  };

  // Helper: get unified invoices array from registration (with migration from old nfId fields)
  const getInvoicesFromReg = (reg: Registration): Array<{
    id?: number;
    amount: number;
    date: string;
    status: string;
    number?: string;
    pdfUrl?: string;
    createdAt: string;
    cancelledAt?: string;
  }> => {
    let invoices: any[] = [];
    if (reg.invoices) {
      try {
        invoices = JSON.parse(reg.invoices);
      } catch { invoices = []; }
    }
    // Migrate old nfId/nfStatus fields if invoices array doesn't already contain them
    if (reg.nfId && reg.nfId > 0 && invoices.length === 0) {
      const migratedStatus = reg.nfStatus === 'issued' || reg.nfStatus === 'authorized' 
        ? reg.nfStatus 
        : reg.nfStatus || 'pending';
      invoices.push({
        id: reg.nfId,
        amount: (reg.paidAmount || 0) / 100,
        date: reg.nfEmittedAt 
          ? new Date(reg.nfEmittedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: migratedStatus,
        number: reg.nfNumber || undefined,
        pdfUrl: reg.nfPdfUrl || undefined,
        createdAt: reg.nfEmittedAt 
          ? new Date(reg.nfEmittedAt).toISOString() 
          : new Date().toISOString(),
      });
    }
    return invoices;
  };

  const openEmitNfModal = (reg: Registration) => {
    const invoices = getInvoicesFromReg(reg);
    const sumNonCancelled = invoices
      .filter(inv => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const paidReais = (reg.paidAmount || 0) / 100;
    const remaining = Math.max(0, paidReais - sumNonCancelled);
    setEmitNfReg(reg);
    setEmitNfAmount(remaining > 0 ? remaining.toFixed(2) : '');
    setEmitNfModalOpen(true);
  };

  const handleEmitNfPartial = () => {
    if (!emitNfReg || !emitNfAmount) return;
    const amount = Number(emitNfAmount);
    if (isNaN(amount) || amount <= 0) return;
    emitNfPartialMutation.mutate({ id: emitNfReg.id, amount });
    setEmitNfModalOpen(false);
  };

  const handleAddInvoice = () => {
    if (!selectedInvoiceReg || !invoiceAmount || !invoiceDate) return;
    
    const existingInvoices = getInvoicesFromReg(selectedInvoiceReg);
    const newInvoice = {
      amount: Number(invoiceAmount),
      date: invoiceDate,
      status: 'manual',
      createdAt: new Date().toISOString()
    };
    existingInvoices.push(newInvoice);
    
    invoiceMutation.mutate({
      id: selectedInvoiceReg.id,
      invoiceIssued: true,
      invoiceIssuedAt: new Date().toISOString(),
      invoices: JSON.stringify(existingInvoices)
    });
    setInvoiceModalOpen(false);
  };

  const copyPaymentInstructions = (reg: Registration) => {
    const batchConfig = rc(reg);
    const firstName = reg.name.split(' ')[0];
    
    let text = '';
    
    if (reg.paymentMethod === 'pix') {
      text = `Olá ${firstName}!

Seguem as instruções para pagamento via PIX:

Valor: R$ ${batchConfig.pixPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Chave PIX (CNPJ): 66.142.918/0001-83
Beneficiário: Mentoria MM Treinamentos Ltda

Após o pagamento, por favor envie o comprovante para confirmarmos sua inscrição na Mentoria Turmas 3 e 4 (Agosto a Outubro 2026).

Qualquer dúvida, estamos à disposição!`;
    } else if (reg.paymentMethod === 'installments10') {
      const price10 = batchConfig.installment10Price || 1100;
      const total10 = batchConfig.installment10Total || 11000;
      const link10 = batchConfig.paymentLink10 || '';
      text = `Olá ${firstName}!

Seguem as instruções para pagamento no cartão de crédito:

Valor: 10x de R$ ${price10.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (sem juros)
Total: R$ ${total10.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${link10 ? `

Link de pagamento: ${link10}` : ''}

Após o pagamento, por favor envie o comprovante para confirmarmos sua inscrição na Mentoria Turmas 3 e 4 (Agosto a Outubro 2026).

Qualquer dúvida, estamos à disposição!`;
    } else {
      text = `Olá ${firstName}!

Seguem as instruções para pagamento no cartão de crédito:

Valor: 5x de R$ ${batchConfig.installmentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (sem juros)
Total: R$ ${batchConfig.installmentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Link de pagamento: ${batchConfig.paymentLink}

Após o pagamento, por favor envie o comprovante para confirmarmos sua inscrição na Mentoria Turmas 3 e 4 (Agosto a Outubro 2026).

Qualquer dúvida, estamos à disposição!`;
    }
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Instruções copiadas!",
      description: `Instruções de pagamento via ${reg.paymentMethod === 'pix' ? 'PIX' : 'Cartão ' + (reg.paymentMethod === 'installments10' ? '10x' : '5x')} copiadas para a área de transferência.`,
    });
  };

  const openVendorPaymentModal = (vendor: string, maxPayment: number) => {
    setSelectedVendor(vendor);
    setVendorMaxPayment(maxPayment);
    setVendorPaymentAmount(maxPayment.toString());
    const today = new Date().toISOString().split('T')[0];
    setVendorPaymentDate(today);
    setVendorPaymentModalOpen(true);
  };
  
  const openVendorCommissionEditModal = (reg: Registration, maxCommission: number) => {
    setEditingCommissionReg(reg);
    setEditingCommissionMax(maxCommission);
    setEditingCommissionAmount((reg.vendorCommissionPaid || 0).toString());
    setVendorCommissionEditModalOpen(true);
  };
  
  const handleSaveVendorCommissionEdit = () => {
    if (!editingCommissionReg) return;
    
    const amount = Number(editingCommissionAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser um número válido maior ou igual a zero",
        variant: "destructive",
      });
      return;
    }
    
    vendorCommissionMutation.mutate({
      id: editingCommissionReg.id,
      vendorCommissionPaid: amount,
      vendorCommissionPaidAt: new Date().toISOString().split('T')[0]
    });
    
    setVendorCommissionEditModalOpen(false);
    setEditingCommissionReg(null);
  };

  const handleDeleteVendorPayment = (reg: Registration) => {
    if (!window.confirm(`Tem certeza que deseja apagar o repasse de R$ ${(reg.vendorCommissionPaid || 0).toLocaleString('pt-BR')} para o vendedor ${reg.vendor}?`)) {
      return;
    }
    
    vendorCommissionMutation.mutate({
      id: reg.id,
      vendorCommissionPaid: 0,
      vendorCommissionPaidAt: null
    });
    
    toast({
      title: "Repasse apagado",
      description: `O repasse do vendedor ${reg.vendor} foi zerado com sucesso`,
    });
  };

  const handleVendorPayment = () => {
    if (!selectedVendor || !vendorPaymentAmount || !vendorPaymentDate) return;
    
    const amount = Number(vendorPaymentAmount);
    if (amount <= 0 || amount > vendorMaxPayment) {
      toast({
        title: "Erro",
        description: `O valor deve estar entre R$ 1 e R$ ${vendorMaxPayment.toLocaleString('pt-BR')}`,
        variant: "destructive",
      });
      return;
    }
    
    // Find all registrations with this vendor and distribute the payment
    const vendorRegs = registrations?.filter(r => r.vendor === selectedVendor) || [];
    let remainingPayment = amount;
    
    vendorRegs.forEach(reg => {
      if (remainingPayment <= 0) return;
      
      const batchConfig = rc(reg);
      const comms = calculateCommissions(reg, batchConfig);
      const alreadyPaid = reg.vendorCommissionPaid || 0;
      const owedToVendor = comms.vendorComm - alreadyPaid;
      
      if (owedToVendor > 0) {
        const paymentForThisReg = Math.min(remainingPayment, owedToVendor);
        vendorCommissionMutation.mutate({
          id: reg.id,
          vendorCommissionPaid: alreadyPaid + paymentForThisReg,
          vendorCommissionPaidAt: vendorPaymentDate
        });
        remainingPayment -= paymentForThisReg;
      }
    });
    
    setVendorPaymentModalOpen(false);
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

    const batchConfig = getSelectedBatchConfig();
    // Use correct total based on payment method
    const isPix = selectedRegistration.paymentMethod === 'pix';
    const totalPrice = isPix ? batchConfig.pixPrice : batchConfig.installmentTotal;

    // Validate partial payment fields
    if (paymentStatus === 'parcial') {
      const paidNum = Number(paidAmount);
      if (isNaN(paidNum) || paidNum <= 0 || paidNum >= totalPrice) {
        toast({
          title: "Valor inválido",
          description: `O valor pago deve ser maior que 0 e menor que R$ ${totalPrice.toLocaleString('pt-BR')}`,
          variant: "destructive",
        });
        return;
      }
    }
    const paidAmountNum = paymentStatus === 'parcial' ? Number(paidAmount) : (paymentStatus === 'pago' ? totalPrice : 0);

    paymentStatusMutation.mutate({
      id: selectedRegistration.id,
      paymentStatus,
      paidAmount: paidAmountNum,
      totalAmount: totalPrice,
      remainingPaymentDate: paymentStatus === 'parcial' && remainingPaymentDate ? remainingPaymentDate : null,
    });
  };

  const getSelectedBatchConfig = () => {
    if (!selectedRegistration) return currentBatchConfig[0];
    return rc(selectedRegistration);
  };

  const getRemainingAmount = () => {
    const paid = Number(paidAmount) || 0;
    const batchConfig = getSelectedBatchConfig();
    return batchConfig.pixPrice - paid;
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

  const filteredRegistrations = turmaFilter === 'todas'
    ? (registrations || [])
    : (registrations || []).filter(r => r.turma === turmaFilter);

  const paidCount = filteredRegistrations.filter(r => r.paymentReceived).length;
  const totalCount = filteredRegistrations.length;
  const pixCount = filteredRegistrations.filter(r => r.paymentMethod === 'pix').length;
  const installmentsCount = totalCount - pixCount;
  
  // Get list of vendors with commission enabled for filtering
  const vendorsWithCommission = vendors.filter(v => v.hasCommission !== false).map(v => v.name);
  
  // Calculate total commissions (only count vendor commissions for vendors with hasCommission=true)
  const totalCommissions = filteredRegistrations.reduce((acc, reg) => {
    const batchConfig = rc(reg);
    const comms = calculateCommissions(reg, batchConfig);
    // Only add vendor commission if vendor has commission enabled
    const vendorHasCommission = reg.vendor && vendorsWithCommission.includes(reg.vendor);
    return {
      mm: acc.mm + comms.mmComm,
      hf: acc.hf + comms.hfComm,
      vendor: acc.vendor + (vendorHasCommission ? comms.vendorComm : 0),
      gross: acc.gross + comms.gross,
      net: acc.net + comms.netAfterTax
    };
  }, { mm: 0, hf: 0, vendor: 0, gross: 0, net: 0 });

  return (
    <div className="space-y-6">
      {/* Turma filter — afeta TODOS os cards e a lista abaixo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Exibindo:</span>
        {([
          ['todas',   'Todas as turmas'],
          ['turma_2', 'Turma 2 (legado)'],
          ['turma_3', 'Turma 3 — Seg'],
          ['turma_4', 'Turma 4 — Qua'],
        ] as const).map(([val, label]) => {
          const count = val === 'todas'
            ? (registrations?.length || 0)
            : (registrations?.filter(r => r.turma === val).length || 0);
          return (
            <Button
              key={val}
              size="sm"
              variant={turmaFilter === val ? 'default' : 'outline'}
              onClick={() => setTurmaFilter(val)}
              className="border-gray-300 text-xs"
              data-testid={`button-turma-filter-${val}`}
            >
              {label}
              <span className="ml-1 opacity-60">({count})</span>
            </Button>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900" data-testid="text-mentorship-total">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pagamentos Confirmados</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-paid">{paidCount}</div>
            <p className="text-xs text-gray-500">
              {totalCount > 0 ? `${Math.round((paidCount / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Aguardando Pagamento</CardTitle>
            <X className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500" data-testid="text-pending">{totalCount - paidCount}</div>
            <p className="text-xs text-gray-500">
              {totalCount > 0 ? `${Math.round(((totalCount - paidCount) / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Formas de Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">PIX:</span>
                <span className="font-medium text-gray-900">{pixCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parcelado:</span>
                <span className="font-medium text-gray-900">{installmentsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Faturamento Bruto</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">R$ {totalCommissions.gross.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-gray-700">Líquido (após impostos)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-900">R$ {totalCommissions.net.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-blue-700">MM (Marcelo)</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700">R$ {totalCommissions.mm.toLocaleString('pt-BR')}</div>
            {financialSummary && (
              <div className="mt-1 text-xs text-blue-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Recebido:</span>
                  <span className="font-medium">R$ {(financialSummary.marceloReceived / 100).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-blue-500">
                  <span>Pendente:</span>
                  <span className="font-medium">R$ {((financialSummary.marceloTotal - financialSummary.marceloReceived) / 100).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-purple-700">HF (Hamilton)</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-700">R$ {totalCommissions.hf.toLocaleString('pt-BR')}</div>
            {financialSummary && (
              <div className="mt-1 text-xs text-purple-600 space-y-0.5">
                <div className="flex justify-between">
                  <span>Recebido:</span>
                  <span className="font-medium">R$ {(financialSummary.hamiltonReceived / 100).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-purple-500">
                  <span>Pendente:</span>
                  <span className="font-medium">R$ {((financialSummary.hamiltonTotal - financialSummary.hamiltonReceived) / 100).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium text-amber-700">Vendedores</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-700">R$ {totalCommissions.vendor.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Control Dashboard - DRE + Vendors + Hamilton */}
      <Collapsible open={transferDashboardOpen} onOpenChange={setTransferDashboardOpen}>
        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-slate-100/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-600" />
                  Controle Financeiro e Repasses
                </CardTitle>
                {transferDashboardOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <CardDescription className="text-gray-600">
                DRE simplificada, comissões de vendedores e repasses para Hamilton Felix
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Turma filter for DRE */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Filtrar por turma:</span>
                {([['todas', 'Todas'], ['turma_2', 'Turma 2'], ['turma_3', 'T3 Seg'], ['turma_4', 'T4 Qua']] as const).map(([val, label]) => (
                  <Button key={val} size="sm" variant={dreTurmaFilter === val ? 'default' : 'outline'} onClick={() => setDreTurmaFilter(val)} className="h-7 text-xs border-gray-300">
                    {label}
                  </Button>
                ))}
              </div>

              {/* DRE Cards - Grid Layout */}
              {(() => {
                const dreRegs = dreTurmaFilter === 'todas' ? registrations : registrations?.filter(r => r.turma === dreTurmaFilter);
                const dreData = dreRegs?.reduce((acc, reg) => {
                  const batchConfig = rc(reg);
                  const comms = calculateCommissions(reg, batchConfig);
                  // When PAGO: use full net amount (after taxes and card fees)
                  // When PARCIAL: use proportional amount based on paidAmount (in cents)
                  const paidAmountReais = (reg.paidAmount || 0) / 100;
                  const normalizedStatus = (reg.paymentStatus || '').toLowerCase().trim();
                  const receivedForThisReg = normalizedStatus === 'pago' ? comms.netAfterTax : 
                                            normalizedStatus === 'parcial' ? paidAmountReais : 0;
                  
                  return {
                    grossRevenue: acc.grossRevenue + comms.gross,
                    taxes: acc.taxes + comms.taxes,
                    cardFees: acc.cardFees + comms.cardFee,
                    netRevenue: acc.netRevenue + comms.netAfterTax,
                    receivedNet: acc.receivedNet + receivedForThisReg,
                  };
                }, { grossRevenue: 0, taxes: 0, cardFees: 0, netRevenue: 0, receivedNet: 0 }) || { grossRevenue: 0, taxes: 0, cardFees: 0, netRevenue: 0, receivedNet: 0 };

                const receitaLiquida = dreData.grossRevenue - dreData.taxes;
                const resultadoFinal = receitaLiquida - dreData.cardFees;

                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Faturamento Bruto</div>
                      <div className="text-xl font-bold text-gray-900">R$ {dreData.grossRevenue.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                      <div className="text-xs text-red-600 uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                        (-) Impostos 
                        {editingTaxRate ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={taxRateInput}
                              onChange={(e) => setTaxRateInput(e.target.value)}
                              className="w-16 h-5 text-xs text-center p-1"
                              step="0.01"
                              min="0"
                              max="100"
                              data-testid="input-tax-rate"
                            />
                            <span>%</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={() => {
                                const newRate = parseFloat(taxRateInput) / 100;
                                if (!isNaN(newRate) && newRate >= 0 && newRate <= 1) {
                                  setTaxRate(newRate);
                                  localStorage.setItem('taxRate', newRate.toString());
                                  setEditingTaxRate(false);
                                }
                              }}
                              data-testid="button-save-tax-rate"
                            >
                              <Check className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5"
                              onClick={() => {
                                setTaxRateInput((taxRate * 100).toFixed(2));
                                setEditingTaxRate(false);
                              }}
                              data-testid="button-cancel-tax-rate"
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingTaxRate(true)}
                            className="hover:underline cursor-pointer flex items-center gap-1"
                            data-testid="button-edit-tax-rate"
                          >
                            {(taxRate * 100).toFixed(2)}%
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-xl font-bold text-red-700">R$ {dreData.taxes.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receita Líquida</div>
                      <div className="text-xl font-bold text-gray-900">R$ {receitaLiquida.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                      <div className="text-xs text-red-600 uppercase tracking-wide mb-1">(-) Taxas Cartão</div>
                      <div className="text-xl font-bold text-red-700">R$ {dreData.cardFees.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg border border-green-300 p-4 text-center">
                      <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Resultado Final</div>
                      <div className="text-xl font-bold text-green-700">R$ {resultadoFinal.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg border border-blue-300 p-4 text-center">
                      <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Recebido (Líq.)</div>
                      <div className="text-xl font-bold text-blue-700">R$ {dreData.receivedNet.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Unified Repasses Section (Mentors + Vendors) */}
              <div className="border-t border-slate-200 pt-6">
                <UnifiedRepassesSection
                  registrations={registrations || []}
                  vendors={vendors || []}
                  calculateCommissions={calculateCommissions}
                  rc={rc}
                  turmaFilter={dreTurmaFilter}
                  onPayMentor={() => {
                    setTransferRecipient('hamilton');
                    setTransferVendorName('');
                    setTransferNotes('');
                    setTransferAmounts({});
                    setTransferPaymentDate(new Date().toISOString().split('T')[0]);
                    const pendingIds = new Set<number>();
                    (registrations || []).forEach(r => {
                      const bc = rc(r);
                      const comms = calculateCommissions(r, bc);
                      const paidAmountReais = (r.paidAmount || 0) / 100;
                      const ns = (r.paymentStatus || '').toLowerCase().trim();
                      const paidRatio = ns === 'pago' ? 1 : ns === 'parcial' ? paidAmountReais / comms.gross : 0;
                      const due = Math.round(comms.hfComm * paidRatio) - (r.hamiltonPaid || 0);
                      if (due > 0) pendingIds.add(r.id as any);
                    });
                    setTransferSelectedRegIds(pendingIds);
                    setTransferPaymentModalOpen(true);
                  }}
                  onPayVendor={(vendorName) => {
                    setTransferRecipient('vendor');
                    setTransferVendorName(vendorName);
                    setTransferNotes('');
                    setTransferAmounts({});
                    setTransferPaymentDate(new Date().toISOString().split('T')[0]);
                    const pendingIds = new Set<number>();
                    (registrations || []).filter(r => r.vendor === vendorName).forEach(r => {
                      const bc = rc(r);
                      const comms = calculateCommissions(r, bc);
                      const paidAmountReais = (r.paidAmount || 0) / 100;
                      const ns = (r.paymentStatus || '').toLowerCase().trim();
                      const paidRatio = ns === 'pago' ? 1 : ns === 'parcial' ? paidAmountReais / comms.gross : 0;
                      const due = Math.round(comms.vendorComm * paidRatio) - (r.vendorCommissionPaid || 0);
                      if (due > 0) pendingIds.add(r.id as any);
                    });
                    setTransferSelectedRegIds(pendingIds);
                    setTransferPaymentModalOpen(true);
                  }}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Transfer Payment Modal */}
      <Dialog open={transferPaymentModalOpen} onOpenChange={setTransferPaymentModalOpen}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {transferRecipient === 'hamilton' ? 'Registrar Repasse - Hamilton Felix' : `Pagar Comissão - ${transferVendorName}`}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Selecione as inscrições que deseja quitar e confirme a data do pagamento.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            // Compute pending regs for this transfer
            const sourceRegs = transferRecipient === 'vendor'
              ? (registrations || []).filter(r => r.vendor === transferVendorName)
              : (registrations || []);

            const pendingRegs = sourceRegs.map(reg => {
              const bc = rc(reg);
              const comms = calculateCommissions(reg, bc);
              const paidAmountReais = (reg.paidAmount || 0) / 100;
              const ns = (reg.paymentStatus || '').toLowerCase().trim();
              const paidRatio = ns === 'pago' ? 1 : ns === 'parcial' && comms.gross > 0 ? paidAmountReais / comms.gross : 0;
              
              let dueNow = 0;
              let alreadyPaid = 0;
              let mentorDue = 0;
              let commDue = 0;
              
              if (transferRecipient === 'vendor') {
                // Pure vendor payment
                commDue = Math.round(comms.vendorComm * paidRatio);
                dueNow = commDue;
                alreadyPaid = reg.vendorCommissionPaid || 0;
              } else {
                // Hamilton as mentor
                mentorDue = Math.round(comms.hfComm * paidRatio);
                dueNow = mentorDue;
                alreadyPaid = reg.hamiltonPaid || 0;
                // Also add vendor commission if Hamilton is the vendor
                if (reg.vendor?.trim() === 'Hamilton Felix') {
                  commDue = Math.round(comms.vendorComm * paidRatio);
                  dueNow += commDue;
                  alreadyPaid += (reg.vendorCommissionPaid || 0);
                }
              }
              
              const balance = dueNow - alreadyPaid;
              return { reg, comms, dueNow, alreadyPaid, balance, mentorDue, commDue };
            }).filter(item => item.balance > 0);

            const selectedTotal = pendingRegs
              .filter(item => transferSelectedRegIds.has(item.reg.id))
              .reduce((sum, item) => sum + (transferAmounts[item.reg.id] ?? item.balance), 0);

            const allSelected = pendingRegs.length > 0 && pendingRegs.every(item => transferSelectedRegIds.has(item.reg.id));
            const noneSelected = pendingRegs.every(item => !transferSelectedRegIds.has(item.reg.id));

            const toggleAll = () => {
              if (allSelected) {
                setTransferSelectedRegIds(new Set());
              } else {
                setTransferSelectedRegIds(new Set(pendingRegs.map(item => item.reg.id)));
              }
            };

            const toggleReg = (id: number) => {
              const next = new Set(transferSelectedRegIds);
              if (next.has(id)) next.delete(id); else next.add(id);
              setTransferSelectedRegIds(next);
            };

            const isHamilton = transferRecipient === 'hamilton';
            const accentClass = isHamilton ? 'text-purple-700' : 'text-amber-700';
            const bgAccent = isHamilton ? 'bg-purple-50' : 'bg-amber-50';

            return (
              <div className="space-y-4 py-2">
                {/* Pending registrations selector */}
                {pendingRegs.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-slate-50 rounded-lg">
                    Nenhuma inscrição com saldo pendente.
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-gray-700 font-medium">Inscrições com saldo pendente</Label>
                      <button
                        type="button"
                        onClick={toggleAll}
                        className={`text-xs font-medium ${accentClass} hover:underline`}
                      >
                        {allSelected ? 'Desmarcar todas' : 'Selecionar todas'}
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-100 text-left">
                            <th className="px-3 py-2 w-8">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={toggleAll}
                                data-testid="checkbox-select-all-regs"
                              />
                            </th>
                            <th className="px-3 py-2 font-medium text-gray-600">Aluno</th>
                            {transferRecipient === 'hamilton' && <th className="px-3 py-2 font-medium text-gray-600 text-right">Mentor</th>}
                            {transferRecipient === 'hamilton' && <th className="px-3 py-2 font-medium text-gray-600 text-right">Comissão</th>}
                            <th className="px-3 py-2 font-medium text-gray-600 text-right">Saldo Pendente</th>
                            <th className="px-3 py-2 font-medium text-gray-600 text-right">Pagar Agora</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingRegs.map(({ reg, balance, mentorDue, commDue }) => (
                            <tr
                              key={reg.id}
                              className={`transition-colors ${transferSelectedRegIds.has(reg.id) ? bgAccent : 'hover:bg-slate-50'}`}
                            >
                              <td className="px-3 py-2">
                                <Checkbox
                                  checked={transferSelectedRegIds.has(reg.id)}
                                  onCheckedChange={() => toggleReg(reg.id)}
                                  data-testid={`checkbox-reg-${reg.id}`}
                                />
                              </td>
                              <td className="px-3 py-2 cursor-pointer" onClick={() => toggleReg(reg.id)}>
                                <p className="font-medium text-gray-900">{reg.name}</p>
                                <p className="text-xs text-gray-500">Lote {reg.batch || 1} • {reg.paymentMethod === 'pix' ? 'PIX' : reg.paymentMethod === 'installments10' ? '10x' : '5x'}</p>
                              </td>
                              {transferRecipient === 'hamilton' && (
                                <td className="px-3 py-2 text-right text-purple-700 cursor-pointer" onClick={() => toggleReg(reg.id)}>
                                  R$ {mentorDue.toLocaleString('pt-BR')}
                                </td>
                              )}
                              {transferRecipient === 'hamilton' && (
                                <td className="px-3 py-2 text-right text-amber-700 cursor-pointer" onClick={() => toggleReg(reg.id)}>
                                  {commDue > 0 ? `R$ ${commDue.toLocaleString('pt-BR')}` : '-'}
                                </td>
                              )}
                              <td className={`px-3 py-2 text-right font-medium ${accentClass} cursor-pointer`} onClick={() => toggleReg(reg.id)}>
                                R$ {balance.toLocaleString('pt-BR')}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {transferSelectedRegIds.has(reg.id) && (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={balance}
                                    value={transferAmounts[reg.id] !== undefined ? transferAmounts[reg.id] : balance}
                                    className="w-24 h-7 text-xs text-right bg-white border-gray-300 ml-auto"
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setTransferAmounts(prev => ({ ...prev, [reg.id]: Math.min(val, balance) }));
                                    }}
                                  />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className={`${bgAccent} font-semibold`}>
                            <td className="px-3 py-2" colSpan={transferRecipient === 'hamilton' ? 5 : 3}>
                              Total selecionado ({transferSelectedRegIds.size} de {pendingRegs.length})
                            </td>
                            <td className={`px-3 py-2 text-right ${accentClass}`}>
                              R$ {selectedTotal.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Date field */}
                <div>
                  <Label className="text-gray-700">Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={transferPaymentDate}
                    onChange={(e) => setTransferPaymentDate(e.target.value)}
                    className="mt-1 bg-white border-gray-300"
                    data-testid="input-transfer-date"
                  />
                </div>

                {/* Payment method */}
                <div>
                  <Label className="text-gray-700">Forma de Pagamento</Label>
                  <Select value={transferPaymentMethod} onValueChange={setTransferPaymentMethod}>
                    <SelectTrigger className="mt-1 bg-white border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-gray-700">Observações</Label>
                  <Input
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Observações opcionais"
                    className="mt-1 bg-white border-gray-300"
                    data-testid="input-transfer-notes"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setTransferPaymentModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    disabled={noneSelected || pendingRegs.length === 0}
                    onClick={async () => {
                      if (transferSelectedRegIds.size === 0) return;
                      const paymentDateISO = transferPaymentDate
                        ? new Date(transferPaymentDate + 'T12:00:00').toISOString()
                        : new Date().toISOString();

                      const selectedItems = pendingRegs.filter(item => transferSelectedRegIds.has(item.reg.id));
                      let totalPaid = 0;

                      for (const { reg, balance, mentorDue, commDue } of selectedItems) {
                        const payAmount = transferAmounts[reg.id] ?? balance;
                        try {
                          if (transferRecipient === 'vendor') {
                            const newPaid = (reg.vendorCommissionPaid || 0) + payAmount;
                            await apiRequest('PATCH', `/api/registrations/${reg.id}/vendor-commission`, {
                              vendorCommissionPaid: newPaid,
                              vendorCommissionPaidAt: paymentDateISO,
                            });
                          } else {
                            // Hamilton: split between mentor and vendor commission if applicable
                            const mentorAlreadyPaid = reg.hamiltonPaid || 0;
                            const commAlreadyPaid = reg.vendor?.trim() === 'Hamilton Felix' ? (reg.vendorCommissionPaid || 0) : 0;
                            const mentorRemaining = mentorDue - mentorAlreadyPaid;
                            const commRemaining = commDue - commAlreadyPaid;
                            
                            // Allocate payment: mentor first, then commission
                            let remaining = payAmount;
                            const mentorPayment = Math.min(remaining, Math.max(0, mentorRemaining));
                            remaining -= mentorPayment;
                            const commPayment = Math.min(remaining, Math.max(0, commRemaining));
                            
                            if (mentorPayment > 0) {
                              await apiRequest('PATCH', `/api/registrations/${reg.id}/hamilton-payment`, {
                                hamiltonPaid: mentorAlreadyPaid + mentorPayment,
                                hamiltonPaidAt: paymentDateISO,
                              });
                            }
                            if (commPayment > 0 && reg.vendor?.trim() === 'Hamilton Felix') {
                              await apiRequest('PATCH', `/api/registrations/${reg.id}/vendor-commission`, {
                                vendorCommissionPaid: commAlreadyPaid + commPayment,
                                vendorCommissionPaidAt: paymentDateISO,
                              });
                            }
                          }
                          totalPaid += payAmount;
                        } catch (error) {
                          console.error('Error updating payment:', error);
                        }
                      }

                      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
                      toast({
                        title: transferRecipient === 'hamilton' ? 'Repasse registrado' : 'Pagamento registrado',
                        description: `R$ ${totalPaid.toLocaleString('pt-BR')} registrado para ${selectedItems.length} inscrição(ões) em ${new Date(paymentDateISO).toLocaleDateString('pt-BR')}.`,
                      });
                      setTransferPaymentModalOpen(false);
                    }}
                    className={isHamilton ? 'bg-purple-600 hover:bg-purple-700' : 'bg-amber-600 hover:bg-amber-700'}
                    data-testid="button-confirm-transfer"
                  >
                    Confirmar Pagamento
                    {transferSelectedRegIds.size > 0 && (
                      <span className="ml-1 opacity-75">
                        (R$ {selectedTotal.toLocaleString('pt-BR')})
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Manual Registration Dialog */}
      <Dialog open={manualRegModalOpen} onOpenChange={setManualRegModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Nova Inscrição Manual</DialogTitle>
            <DialogDescription className="text-gray-600">
              Cadastre uma nova inscrição manualmente
            </DialogDescription>
          </DialogHeader>
          
          {!hasValidAuth ? (
            <div className="py-6 text-center">
              <p className="text-red-600 font-medium mb-4">Sessão expirada ou inválida</p>
              <p className="text-gray-600 mb-4">Faça login novamente na aba CRM para cadastrar inscrições.</p>
              <Button variant="outline" onClick={() => setManualRegModalOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : (
          <>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Cadastrando como:</strong> {currentUserEmail}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-gray-700">Nome Completo *</Label>
                <Input
                  value={manualRegName}
                  onChange={(e) => setManualRegName(e.target.value)}
                  placeholder="Nome do aluno"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-name"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-700">Email *</Label>
                <Input
                  type="email"
                  value={manualRegEmail}
                  onChange={(e) => setManualRegEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-email"
                />
              </div>
              <div>
                <Label className="text-gray-700">Telefone/WhatsApp *</Label>
                <Input
                  value={manualRegPhone}
                  onChange={(e) => setManualRegPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-phone"
                />
              </div>
              <div>
                <Label className="text-gray-700">CPF/CNPJ *</Label>
                <Input
                  value={manualRegCpfCnpj}
                  onChange={(e) => setManualRegCpfCnpj(e.target.value)}
                  placeholder="000.000.000-00"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-cpf"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-700">Razão Social (se CNPJ)</Label>
                <Input
                  value={manualRegRazaoSocial}
                  onChange={(e) => setManualRegRazaoSocial(e.target.value)}
                  placeholder="Razão Social da empresa"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-razao"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-700">Turma *</Label>
                <Select value={manualRegTurma} onValueChange={(v: 'turma_2' | 'turma_3' | 'turma_4') => setManualRegTurma(v)}>
                  <SelectTrigger className="mt-1 bg-white border-gray-300" data-testid="select-manual-turma">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="turma_3">Turma 3 — Segundas-feiras</SelectItem>
                    <SelectItem value="turma_4">Turma 4 — Quartas-feiras</SelectItem>
                    <SelectItem value="turma_2">Turma 2 (legado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Forma de Pagamento</Label>
                <Select value={manualRegPaymentMethod} onValueChange={(v: 'pix' | 'installments' | 'installments10') => setManualRegPaymentMethod(v)}>
                  <SelectTrigger className="mt-1 bg-white border-gray-300" data-testid="select-manual-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="installments">Parcelado (5x)</SelectItem>
                    <SelectItem value="installments10">Parcelado (10x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Status do Pagamento</Label>
                <Select value={manualRegPaymentStatus} onValueChange={(v: 'pendente' | 'parcial' | 'pago') => setManualRegPaymentStatus(v)}>
                  <SelectTrigger className="mt-1 bg-white border-gray-300" data-testid="select-manual-payment-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700">Valor Total (R$)</Label>
                <Input
                  type="number"
                  value={manualRegTotalAmount}
                  onChange={(e) => setManualRegTotalAmount(e.target.value)}
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-total"
                />
              </div>
              <div>
                <Label className="text-gray-700">Valor Pago (R$)</Label>
                <Input
                  type="number"
                  value={manualRegPaidAmount}
                  onChange={(e) => setManualRegPaidAmount(e.target.value)}
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-paid"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-gray-700">Observações</Label>
                <Input
                  value={manualRegObservations}
                  onChange={(e) => setManualRegObservations(e.target.value)}
                  placeholder="Observações sobre a inscrição"
                  className="mt-1 bg-white border-gray-300"
                  data-testid="input-manual-obs"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setManualRegModalOpen(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button 
              onClick={handleManualRegistration} 
              disabled={manualRegMutation.isPending}
              data-testid="button-save-manual-reg"
            >
              {manualRegMutation.isPending ? "Salvando..." : "Cadastrar Inscrição"}
            </Button>
          </DialogFooter>
          </>
          )}
        </DialogContent>
      </Dialog>

      {/* Registrations Table - Two-line layout to avoid horizontal scroll */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-gray-900">
              Inscrições da Mentoria —{' '}
              {turmaFilter === 'turma_2' ? 'Turma 2 (Legado)'
                : turmaFilter === 'turma_3' ? 'Turma 3'
                : turmaFilter === 'turma_4' ? 'Turma 4'
                : 'Turmas 3 e 4'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Agosto a Outubro 2026 · Marcelo Murilo & Hamilton Felix
            </CardDescription>
          </div>
          <Button 
            onClick={() => setManualRegModalOpen(true)} 
            className="shrink-0"
            data-testid="button-new-manual-registration"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Inscrição
          </Button>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-4">
              {filteredRegistrations.map((reg, index) => {
                const batchConfig = rc(reg);
                const commissions = calculateCommissions(reg, batchConfig);
                
                return (
                  <div key={reg.id} data-testid={`row-registration-${index}`} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                    {/* First Row: Name, Batch, Payment Method, Status */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-gray-400 text-sm font-mono w-6">{index + 1}</span>
                      <span className="text-gray-900 font-medium flex-1 min-w-[150px]">{reg.name}</span>
                      <Badge className={`text-xs shrink-0 ${reg.turma === 'turma_3' ? 'bg-green-700' : reg.turma === 'turma_4' ? 'bg-teal-700' : 'bg-slate-500'}`}>
                        {reg.turma === 'turma_3' ? 'T3 Seg' : reg.turma === 'turma_4' ? 'T4 Qua' : 'T2'}
                      </Badge>
                      {editingBatchId === reg.id ? (
                        <div className="flex items-center gap-1">
                          <Select value={batchValue.toString()} onValueChange={(val) => setBatchValue(Number(val))}>
                            <SelectTrigger className="w-16 h-7 bg-white border-gray-300 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4 (Especial)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" onClick={() => handleSaveBatch(reg.id)} disabled={batchMutation.isPending} className="h-7 w-7">
                            <Save className="w-3 h-3 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingBatchId(null)} className="h-7 w-7">
                            <X className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                      ) : (
                        <Badge 
                          className={`cursor-pointer ${(reg.batch || 1) === 4 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary/80'}`}
                          title="Clique para alterar o lote"
                          onClick={() => startEditingBatch(reg)}
                        >
                          Lote {reg.batch || 1}{(reg.batch || 1) === 4 ? ' (Esp)' : ''}
                        </Badge>
                      )}
                      <Badge 
                        className={reg.paymentMethod === 'pix' ? 'bg-blue-600' : reg.paymentMethod === 'installments10' ? 'bg-purple-600' : 'bg-gray-600'}
                        data-testid={`badge-payment-${index}`}
                      >
                        {reg.paymentMethod === 'pix' 
                          ? `PIX R$ ${batchConfig.pixPrice.toLocaleString('pt-BR')}` 
                          : reg.paymentMethod === 'installments10'
                          ? `10x R$ ${(batchConfig.installment10Price || 1100).toLocaleString('pt-BR')}`
                          : `5x R$ ${batchConfig.installmentPrice.toLocaleString('pt-BR')}`}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPaymentInstructions(reg)}
                        data-testid={`button-copy-payment-${index}`}
                        className="text-blue-400 border-blue-500 hover:bg-blue-900/20"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Link de pagto
                      </Button>
                      {reg.paymentMethod === 'pix' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentModal(reg)}
                          data-testid={`button-payment-${index}`}
                          className={
                            reg.paymentStatus === 'pago' 
                              ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" 
                              : reg.paymentStatus === 'parcial'
                                ? "bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
                                : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          }
                        >
                          {reg.paymentStatus === 'pago' ? (
                            <><Check className="w-4 h-4 mr-1" />Pago</>
                          ) : reg.paymentStatus === 'parcial' ? (
                            <><DollarSign className="w-4 h-4 mr-1" />Parcial</>
                          ) : (
                            <><X className="w-4 h-4 mr-1" />Pendente</>
                          )}
                        </Button>
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
                            <><Check className="w-4 h-4 mr-1" />Pago</>
                          ) : (
                            <><X className="w-4 h-4 mr-1" />Pendente</>
                          )}
                        </Button>
                      )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/registrations/${reg.id}/contract-pdf`, '_blank')}
                        data-testid={`button-download-contract-${index}`}
                        className="text-blue-600 border-blue-500 hover:bg-blue-50"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Contrato
                      </Button>
                    </div>
                    
                    {/* Second Row: Email, Phone, Date */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pl-6">
                      <span>{reg.email}</span>
                      <span className="text-gray-600">|</span>
                      <span>{reg.phone}</span>
                      <span className="text-gray-600">|</span>
                      <span>
                        {new Date(reg.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* Third Row: Vendor, Commissions, Partial Payment Info */}
                    <div className="flex flex-wrap items-center gap-4 pl-6 border-t border-gray-800 pt-3">
                      {/* Vendor */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">Vendedor:</span>
                        {editingVendorId === reg.id ? (
                          <div className="flex items-center gap-1">
                            <Select
                              value={vendorValue}
                              onValueChange={(value) => setVendorValue(value)}
                            >
                              <SelectTrigger className="w-36 h-7 bg-white border-gray-300 text-sm" data-testid={`select-vendor-${index}`}>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Nenhum</SelectItem>
                                {vendors.filter(v => v.isActive).map(v => (
                                  <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleSaveVendor(reg.id)}
                              disabled={vendorMutation.isPending}
                              className="h-7 w-7"
                              data-testid={`button-save-vendor-${index}`}
                            >
                              <Save className="w-3 h-3 text-green-400" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingVendorId(null)}
                              className="h-7 w-7"
                            >
                              <X className="w-3 h-3 text-gray-400" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className={reg.vendor ? "text-yellow-400 text-sm" : "text-gray-500 text-sm"}>
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
                      </div>
                      
                      {/* Financial Breakdown */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-700 font-medium">Bruto: R$ {commissions.gross.toLocaleString('pt-BR')}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-red-500">Imp: R$ {commissions.taxes.toLocaleString('pt-BR')}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-orange-500">Taxa: R$ {commissions.cardFee.toLocaleString('pt-BR')}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-blue-600">MM: R$ {commissions.mmComm.toLocaleString('pt-BR')}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-purple-600">HF: R$ {commissions.hfComm.toLocaleString('pt-BR')}</span>
                        {commissions.vendorComm > 0 && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span className="text-yellow-600">Vend: R$ {commissions.vendorComm.toLocaleString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Net Value and Received Value */}
                      {(() => {
                        const statusNorm = (reg.paymentStatus || '').toLowerCase().trim();
                        const receivedValue = statusNorm === 'pago' 
                          ? commissions.netAfterTax 
                          : statusNorm === 'parcial'
                            ? (reg.paidAmount || 0) / 100
                            : 0;
                        return (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded">
                              Líquido: R$ {commissions.netAfterTax.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className={`font-medium px-2 py-0.5 rounded ${
                              statusNorm === 'pago' 
                                ? 'text-blue-700 bg-blue-50' 
                                : statusNorm === 'parcial'
                                  ? 'text-orange-700 bg-orange-50'
                                  : 'text-gray-500 bg-gray-100'
                            }`}>
                              Recebido: R$ {receivedValue.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        );
                      })()}
                      
                      {/* Partial Payment Info */}
                      {reg.paymentStatus === 'parcial' && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-400">Pago: R$ {((reg.paidAmount || 0) / 100).toLocaleString('pt-BR')}</span>
                          <span className="text-orange-400">Saldo: R$ {(batchConfig.pixPrice - ((reg.paidAmount || 0) / 100)).toLocaleString('pt-BR')}</span>
                          {reg.remainingPaymentDate && (
                            <span className="text-blue-400">
                              Prev: {new Date(reg.remainingPaymentDate).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Fourth Row: NF Control */}
                    <div className="flex flex-wrap items-center gap-4 pl-6 border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 text-xs">CPF/CNPJ:</span>
                        <span className="text-gray-700 text-sm">{reg.cpfCnpj || '-'}</span>
                        {reg.razaoSocial && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-600 text-sm">{reg.razaoSocial}</span>
                          </>
                        )}
                      </div>
                      {/* Unified Multi-NF Section */}
                      <div className="space-y-2">
                        {(() => {
                          const invoices = getInvoicesFromReg(reg);
                          const paidReais = (reg.paidAmount || 0) / 100;
                          const sumNonCancelled = invoices
                            .filter(inv => inv.status !== 'cancelled')
                            .reduce((sum, inv) => sum + (inv.amount || 0), 0);
                          const remaining = Math.max(0, paidReais - sumNonCancelled);

                          return (
                            <>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Receipt className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700 text-xs font-medium">
                                  📄 Notas Fiscais{invoices.length > 0 ? ` (${invoices.filter(i => i.status !== 'cancelled').length})` : ''} — R$ {paidReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pago
                                </span>
                              </div>
                              
                              {invoices.length > 0 && (
                                <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                                  {invoices.map((inv, idx) => {
                                    const isCancelled = inv.status === 'cancelled';
                                    const isAuthorized = inv.status === 'issued' || inv.status === 'authorized';
                                    const isPending = inv.status === 'pending' || inv.status === 'processing';
                                    const isManual = !inv.status || inv.status === 'manual';
                                    const isError = inv.status === 'error';

                                    return (
                                      <div key={idx} className={`flex items-center gap-2 flex-wrap text-xs ${isCancelled ? 'opacity-50 line-through' : ''}`}>
                                        <span className="text-gray-600 font-medium">{idx + 1}.</span>
                                        <span className="text-gray-800">R$ {(inv.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-500">{inv.date ? new Date(inv.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</span>
                                        <span className="text-gray-400">|</span>
                                        {isAuthorized && (
                                          <span className="text-green-600 font-medium">✅ Emitida{inv.number ? ` #${inv.number}` : ''}</span>
                                        )}
                                        {isPending && (
                                          <span className="text-yellow-600 font-medium">⏳ Pendente</span>
                                        )}
                                        {isCancelled && (
                                          <span className="text-gray-400 font-medium">❌ Cancelada</span>
                                        )}
                                        {isManual && (
                                          <span className="text-blue-600 font-medium">📋 Manual</span>
                                        )}
                                        {isError && (
                                          <span className="text-red-500 font-medium">⚠️ Erro</span>
                                        )}
                                        
                                        {/* Action buttons */}
                                        {!isCancelled && (
                                          <div className="flex items-center gap-1 ml-2">
                                            {inv.pdfUrl && (
                                              <a
                                                href={inv.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-xs underline hover:text-blue-800"
                                              >
                                                📄 PDF
                                              </a>
                                            )}
                                            {inv.pdfUrl && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => resendInvoiceMutation.mutate({ id: reg.id, invoiceIndex: idx })}
                                                disabled={resendInvoiceMutation.isPending}
                                                className="h-5 px-1 text-xs text-blue-600 hover:text-blue-800"
                                              >
                                                📧 Enviar
                                              </Button>
                                            )}
                                            {inv.id && (isPending || isError || isAuthorized) && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => refreshInvoiceMutation.mutate({ id: reg.id, invoiceIndex: idx })}
                                                disabled={refreshInvoiceMutation.isPending}
                                                className="h-5 px-1 text-xs text-gray-500 hover:text-gray-700"
                                              >
                                                🔄 Status
                                              </Button>
                                            )}
                                            {(isAuthorized || isPending || isManual) && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  const justificativa = window.prompt(
                                                    `Cancelar NF ${idx + 1} de ${reg.name}\n\nMotivo (mínimo 15 caracteres):`,
                                                    "Cancelamento solicitado pelo cliente"
                                                  );
                                                  if (justificativa === null) return;
                                                  if (inv.id && justificativa.length < 15) {
                                                    alert("O motivo deve ter pelo menos 15 caracteres.");
                                                    return;
                                                  }
                                                  cancelInvoiceMutation.mutate({ id: reg.id, invoiceIndex: idx, justificativa });
                                                }}
                                                disabled={cancelInvoiceMutation.isPending}
                                                className="h-5 px-1 text-xs text-red-500 hover:text-red-700"
                                              >
                                                ❌ Cancelar
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Actions row */}
                              <div className="flex items-center gap-2 ml-6">
                                {(reg.paymentStatus === 'pago' || reg.paymentStatus === 'parcial') && reg.cpfCnpj && remaining > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEmitNfModal(reg)}
                                    disabled={emitNfPartialMutation.isPending}
                                    className="h-6 text-xs border-blue-400 text-blue-600"
                                  >
                                    <Receipt className="w-3 h-3 mr-1" />
                                    + Emitir NF (R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                  </Button>
                                )}
                                {(reg.paymentStatus === 'pago' || reg.paymentStatus === 'parcial') && !reg.cpfCnpj && (
                                  <span className="text-xs text-gray-400">CPF/CNPJ necessário para emitir NF</span>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Fifth Row: Observations */}
                    <div className="pl-6 border-t border-gray-200 pt-3">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          {editingObsId === reg.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={obsValue}
                                onChange={(e) => setObsValue(e.target.value)}
                                placeholder="Observações sobre este fechamento..."
                                className="bg-white border-gray-300 text-sm min-h-[60px]"
                                data-testid={`input-observations-${index}`}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleSaveObservations(reg.id)}
                                  disabled={observationsMutation.isPending}
                                  className="h-7"
                                  data-testid={`button-save-observations-${index}`}
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Salvar
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingObsId(null)}
                                  className="h-7"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => startEditingObservations(reg)}
                              className="text-sm text-gray-500 cursor-pointer hover:bg-gray-100 rounded p-1 min-h-[24px]"
                              data-testid={`text-observations-${index}`}
                            >
                              {reg.observations || <span className="text-gray-600 italic">Clique para adicionar observações...</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Reference Table - Collapsible at the bottom */}
      <Collapsible open={commissionTableOpen} onOpenChange={setCommissionTableOpen}>
        <Card className="bg-white border-gray-200">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Tabela de Comissões por Lote
                </CardTitle>
                {commissionTableOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription className="text-gray-400">
                Taxa de cartão: parcelado apenas | Impostos: {(taxRate * 100).toFixed(2)}% | MM: 63,3% | HF: 31,7% | Comissão Vendedor: 5%
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
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
                      <TableHead className="text-gray-400">Impostos ({(taxRate * 100).toFixed(2)}%)</TableHead>
                      <TableHead className="text-gray-400">Líquido c/ Impostos</TableHead>
                      <TableHead className="text-blue-400">MM (63,3%)</TableHead>
                      <TableHead className="text-purple-400">HF (31,7%)</TableHead>
                      <TableHead className="text-yellow-400">Vendedor (5%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBatchConfig.map((batch) => (
                      <Fragment key={batch.batch}>
                        <TableRow className="border-gray-800">
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
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Gerenciar Pagamento PIX</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedRegistration?.name} - Lote {selectedRegistration?.batch || 1} - Total: R$ {getSelectedBatchConfig().pixPrice.toLocaleString('pt-BR')},00
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
                    <span className="text-white">R$ {getSelectedBatchConfig().pixPrice.toLocaleString('pt-BR')},00</span>
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

      {/* Vendor Payment Modal */}
      <Dialog open={vendorPaymentModalOpen} onOpenChange={setVendorPaymentModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento ao Vendedor</DialogTitle>
            <DialogDescription className="text-gray-600">
              Vendedor: {selectedVendor} - Saldo pendente: R$ {vendorMaxPayment.toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vendorPaymentAmount">Valor do Pagamento (R$)</Label>
              <Input
                id="vendorPaymentAmount"
                type="number"
                value={vendorPaymentAmount}
                onChange={(e) => setVendorPaymentAmount(e.target.value)}
                placeholder="Ex: 400"
                className="bg-white border-gray-300"
                max={vendorMaxPayment}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorPaymentDate">Data do Pagamento</Label>
              <Input
                id="vendorPaymentDate"
                type="date"
                value={vendorPaymentDate}
                onChange={(e) => setVendorPaymentDate(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleVendorPayment}
              disabled={vendorCommissionMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {vendorCommissionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Vendor Commission Edit Modal */}
      <Dialog open={vendorCommissionEditModalOpen} onOpenChange={setVendorCommissionEditModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Editar Comissão Paga</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingCommissionReg?.name} - Comissão total: R$ {editingCommissionMax.toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCommissionAmount">Valor Pago ao Vendedor (R$)</Label>
              <Input
                id="editCommissionAmount"
                type="number"
                value={editingCommissionAmount}
                onChange={(e) => setEditingCommissionAmount(e.target.value)}
                placeholder="Ex: 400"
                className="bg-white border-gray-300"
                min="0"
                data-testid="input-edit-commission-amount"
              />
              <p className="text-xs text-gray-500">
                Digite 0 para remover o pagamento ou ajuste o valor conforme necessário.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorCommissionEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveVendorCommissionEdit}
              disabled={vendorCommissionMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-save-commission-edit"
            >
              {vendorCommissionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedInvoiceReg?.name} - {selectedInvoiceReg?.cpfCnpj}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceAmount">Valor da NF (R$)</Label>
              <Input
                id="invoiceAmount"
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="Ex: 4000"
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Data de Emissão</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            {selectedInvoiceReg?.invoices && (
              <div className="p-3 bg-gray-100 rounded-lg space-y-2">
                <Label className="text-sm text-gray-600">NFs já emitidas:</Label>
                {JSON.parse(selectedInvoiceReg.invoices).map((inv: {amount: number, date: string}, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">NF {idx + 1}:</span>
                    <span className="text-gray-900">R$ {inv.amount.toLocaleString('pt-BR')} - {new Date(inv.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddInvoice}
              disabled={invoiceMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {invoiceMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Emitir NF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emit NF via Faturador Modal */}
      <Dialog open={emitNfModalOpen} onOpenChange={setEmitNfModalOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Emitir Nota Fiscal</DialogTitle>
            <DialogDescription>
              {emitNfReg?.name} — CPF/CNPJ: {emitNfReg?.cpfCnpj}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Valor da NF (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={emitNfAmount}
                onChange={(e) => setEmitNfAmount(e.target.value)}
                className="mt-1 bg-white border-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500">
              A NF será emitida via Faturador (Focus NFe) e enviada ao email do inscrito.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmitNfModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEmitNfPartial}
              disabled={emitNfPartialMutation.isPending || !emitNfAmount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {emitNfPartialMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Emitir NF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// CRM Section Component
function CRMSection() {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [editVendorName, setEditVendorName] = useState('');
  const [editVendorEmail, setEditVendorEmail] = useState('');
  const [vendorToDelete, setVendorToDelete] = useState<{ id: string; name: string } | null>(null);
  const [activityContent, setActivityContent] = useState('');
  const [activityType, setActivityType] = useState('note');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpDescription, setFollowUpDescription] = useState('');
  const [followUpType, setFollowUpType] = useState('call');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState<boolean>(false);
  const [contactFilter, setContactFilter] = useState<string>('all');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [currentVendorEmail, setCurrentVendorEmail] = useState<string | null>(() => {
    return localStorage.getItem('crm_vendor_email');
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const email = localStorage.getItem('crm_vendor_email');
    const token = localStorage.getItem('crm_auth_token');
    return !!(email && token);
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/crm/leads'],
  });

  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['/api/crm/vendors'],
  });

  const currentVendor = vendors.find(v => v.email?.toLowerCase() === currentVendorEmail?.toLowerCase()) || null;
  const ADMIN_EMAILS = ["contato@marcelomurilo.com.br", "marcelo@marcelomurilo.com.br", "hamilton@opes.com.br"];
  const isAdmin = currentVendorEmail ? ADMIN_EMAILS.includes(currentVendorEmail.toLowerCase()) : false;

  const handleLogin = async () => {
    if (!loginEmail.trim()) {
      toast({ title: 'Digite seu email', variant: 'destructive' });
      return;
    }
    
    const email = loginEmail.toLowerCase().trim();
    
    try {
      // Call backend to authenticate and get signed token
      const response = await fetch('/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast({ title: 'Erro no login', description: error.error || 'Email não autorizado', variant: 'destructive' });
        return;
      }
      
      const data = await response.json();
      
      // Store email and auth token in localStorage
      localStorage.setItem('crm_vendor_email', data.email);
      localStorage.setItem('crm_auth_token', data.authToken);
      
      setCurrentVendorEmail(data.email);
      setIsLoggedIn(true);
      toast({ title: `Bem-vindo, ${data.name}!` });
    } catch (error) {
      toast({ title: 'Erro no login', description: 'Erro de conexão', variant: 'destructive' });
    }
  };

  const handleLogout = async () => {
    // Logout from backend session too
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Ignore errors
    }
    localStorage.removeItem('crm_vendor_email');
    localStorage.removeItem('crm_auth_token');
    setCurrentVendorEmail(null);
    setIsLoggedIn(false);
  };

  const { data: activities = [] } = useQuery<LeadActivity[]>({
    queryKey: ['/api/crm/leads', selectedLead?.id, 'activities'],
    enabled: !!selectedLead,
  });

  const { data: followUps = [] } = useQuery<LeadFollowUp[]>({
    queryKey: ['/api/crm/leads', selectedLead?.id, 'followups'],
    enabled: !!selectedLead,
  });

  const { data: aiSuggestions } = useQuery<{ nextSteps: string[]; arguments: string[]; status: string }>({
    queryKey: ['/api/crm/leads', selectedLead?.id, 'ai-suggestions'],
    enabled: !!selectedLead,
  });

  // Pending follow-ups - admin sees all, vendors see only theirs
  const { data: pendingFollowUps = [] } = useQuery<(LeadFollowUp & { leadName?: string | null; leadEmail?: string | null })[]>({
    queryKey: ['/api/crm/followups/pending', isAdmin ? 'all' : currentVendor?.id],
    queryFn: async () => {
      const url = isAdmin ? '/api/crm/followups/pending' : `/api/crm/followups/pending?vendorId=${currentVendor?.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao buscar pendências');
      return res.json();
    },
    enabled: isAdmin || !!currentVendor?.id,
  });

  // Enrich follow-ups with lead names (fallback if not included from backend)
  const enrichedFollowUps = pendingFollowUps.map(fu => ({
    ...fu,
    leadName: fu.leadName || leads.find(l => l.id === fu.leadId)?.name || 'Lead desconhecido'
  }));

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/crm/leads/sync');
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({ title: 'Sincronização concluída', description: `${data.imported} novos, ${data.updated} atualizados, ${data.skipped} ignorados` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na sincronização', description: error.message, variant: 'destructive' });
    },
  });

  const importFileRef = useRef<HTMLInputElement>(null);
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/crm/leads/import', {
        method: 'POST',
        headers: {
          'x-admin-email': currentVendorEmail || '',
        },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(err.error || 'Erro ao importar');
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      const desc = `${data.imported} novos, ${data.updated} atualizados, ${data.skipped} ignorados${data.errors > 0 ? `, ${data.errors} com erro` : ''}`;
      toast({ title: `Importação concluída — ${data.total} linhas`, description: desc });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' });
    },
  });

  const syncRegistrationsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/crm/leads/sync-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentVendorEmail || '',
        },
      });
      if (!res.ok) throw new Error('Erro ao sincronizar');
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({ 
        title: 'Sincronização concluída', 
        description: `${data.converted} leads marcados como convertidos, ${data.alreadyConverted} já estavam convertidos` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao sincronizar', description: error.message, variant: 'destructive' });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/crm/leads/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentVendorEmail || '',
        },
      });
      if (!res.ok) throw new Error('Erro ao regenerar perfis');
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({ title: 'Perfis regenerados', description: `${data.regenerated} atualizados, ${data.skipped} ignorados` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao regenerar', description: error.message, variant: 'destructive' });
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => apiRequest('POST', '/api/crm/vendors', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/vendors'] });
      setVendorModalOpen(false);
      setNewVendorName('');
      setNewVendorEmail('');
      toast({ title: 'Vendedor cadastrado' });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async (data: { id: string; name?: string; email?: string; isActive?: boolean; hasCommission?: boolean }) => {
      const res = await fetch(`/api/crm/vendors/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentVendorEmail || '',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao atualizar vendedor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/vendors'] });
      toast({ title: 'Vendedor atualizado' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar vendedor', variant: 'destructive' });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/crm/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': currentVendorEmail || '',
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao excluir vendedor');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/vendors'] });
      toast({ title: 'Vendedor excluído' });
    },
    onError: () => {
      toast({ title: 'Erro ao excluir vendedor', variant: 'destructive' });
    },
  });

  const claimMutation = useMutation({
    mutationFn: ({ leadId, vendorId }: { leadId: string; vendorId: string }) => 
      apiRequest('POST', `/api/crm/leads/${leadId}/claim`, { vendorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/followups/pending'] });
      setSelectedVendorId('');
      toast({ title: 'Lead reservado com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest('POST', `/api/crm/leads/${leadId}/release`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      setSelectedVendorId('');
      toast({ title: 'Lead liberado' });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ leadId, phone, linkedin }: { leadId: string; phone?: string; linkedin?: string }) => 
      apiRequest('PATCH', `/api/crm/leads/${leadId}/contact`, { phone, linkedin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      toast({ title: 'Contato atualizado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar contato', description: error.message, variant: 'destructive' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) => 
      apiRequest('PATCH', `/api/crm/leads/${leadId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ['/api/crm/leads', selectedLead.id, 'activities'] });
      }
      toast({ title: 'Status atualizado' });
    },
  });

  const activityMutation = useMutation({
    mutationFn: (data: { leadId: string; type: string; content: string; vendorId?: string; scoreChange?: number }) => 
      apiRequest('POST', `/api/crm/leads/${data.leadId}/activities`, data),
    onSuccess: () => {
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ['/api/crm/leads', selectedLead.id, 'activities'] });
        queryClient.invalidateQueries({ queryKey: ['/api/crm/leads'] });
      }
      setActivityContent('');
      toast({ title: 'Atividade registrada' });
    },
  });

  const followUpMutation = useMutation({
    mutationFn: (data: { leadId: string; type: string; description: string; scheduledAt: string; vendorId?: string }) => 
      apiRequest('POST', `/api/crm/leads/${data.leadId}/followups`, data),
    onSuccess: () => {
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ['/api/crm/leads', selectedLead.id, 'followups'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/crm/followups/pending'] });
      setFollowUpDate('');
      setFollowUpDescription('');
      toast({ title: 'Follow-up agendado' });
    },
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: (id: string) => apiRequest('PATCH', `/api/crm/followups/${id}/complete`),
    onSuccess: () => {
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ['/api/crm/leads', selectedLead.id, 'followups'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/crm/followups/pending'] });
      toast({ title: 'Follow-up concluído' });
    },
  });

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case 'hot': return <Flame className="w-4 h-4 text-red-500" />;
      case 'warm': return <ThermometerSun className="w-4 h-4 text-orange-500" />;
      default: return <Snowflake className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTemperatureBg = (temp: string) => {
    switch (temp) {
      case 'hot': return 'bg-red-50 border-red-200';
      case 'warm': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      novo: 'bg-gray-100 text-gray-700',
      em_contato: 'bg-blue-100 text-blue-700',
      qualificado: 'bg-purple-100 text-purple-700',
      negociando: 'bg-yellow-100 text-yellow-700',
      convertido: 'bg-green-100 text-green-700',
      perdido: 'bg-red-100 text-red-700',
      mentorado: 'bg-emerald-100 text-emerald-700',
      nao_abordar: 'bg-slate-100 text-slate-700',
    };
    const labels: Record<string, string> = {
      novo: 'Novo',
      em_contato: 'Em Contato',
      qualificado: 'Qualificado',
      negociando: 'Negociando',
      convertido: 'Convertido',
      perdido: 'Perdido',
      mentorado: 'Mentorado',
      nao_abordar: 'Não Abordar',
    };
    return <Badge className={colors[status] || colors.novo}>{labels[status] || status}</Badge>;
  };

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (temperatureFilter !== 'all' && lead.temperature !== temperatureFilter) return false;
    if (contactFilter === 'whatsapp' && !lead.phone) return false;
    if (contactFilter === 'linkedin' && !lead.linkedin) return false;
    if (contactFilter === 'both' && (!lead.phone || !lead.linkedin)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = (lead.name ?? '').toLowerCase().includes(query);
      const emailMatch = (lead.email ?? '').toLowerCase().includes(query);
      const phoneMatch = (lead.phone ?? '').toLowerCase().includes(query);
      if (!nameMatch && !emailMatch && !phoneMatch) return false;
    }
    if (showMyLeadsOnly && currentVendor) {
      if (lead.vendorId !== currentVendor.id) return false;
    }
    return true;
  });

  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return null;
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.name || 'Desconhecido';
  };

  if (leadsLoading || vendorsLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!currentVendorEmail) {
    // Show initialization option if no vendors exist
    if (vendors.length === 0) {
      return (
        <Card className="bg-white border-gray-200 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração Inicial
            </CardTitle>
            <CardDescription className="text-gray-500">
              O sistema precisa ser inicializado. Clique abaixo para criar os vendedores padrão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/crm/init', { method: 'POST' });
                  const data = await res.json();
                  if (data.initialized) {
                    toast({ title: 'Sistema inicializado!', description: 'Vendedores criados com sucesso.' });
                    queryClient.invalidateQueries({ queryKey: ['/api/crm/vendors'] });
                  } else {
                    toast({ title: 'Aviso', description: data.message });
                  }
                } catch (error) {
                  toast({ title: 'Erro', description: 'Falha ao inicializar sistema', variant: 'destructive' });
                }
              }} 
              className="w-full" 
              data-testid="button-init-system"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Inicializar Sistema
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-white border-gray-200 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Identificação
          </CardTitle>
          <CardDescription className="text-gray-500">
            Informe seu email para acessar o CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-gray-700">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="seu@email.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="bg-white border-gray-300"
              data-testid="input-login-email"
            />
          </div>
          <Button onClick={handleLogin} className="w-full" data-testid="button-login">
            Entrar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Bar */}
      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">Logado como:</span>
          <span className="font-medium text-gray-900">{currentVendor?.name || currentVendorEmail}</span>
          {isAdmin && <Badge className="bg-purple-100 text-purple-700">Admin</Badge>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
          Sair
        </Button>
      </div>

      {/* Pending Follow-ups Section */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-amber-600" />
            {isAdmin ? 'Todos os Follow-ups Agendados' : 'Meus Follow-ups Agendados'} ({enrichedFollowUps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrichedFollowUps.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum follow-up agendado</p>
          ) : (
            <div className="space-y-2">
              {enrichedFollowUps.slice(0, 10).map(fu => {
                const vendorName = vendors.find(v => v.id === fu.vendorId)?.name;
                const isOverdue = fu.scheduledAt && new Date(fu.scheduledAt) < new Date();
                return (
                  <div 
                    key={fu.id} 
                    className={`flex items-center justify-between bg-white rounded-lg p-3 border cursor-pointer hover:bg-gray-50 ${isOverdue ? 'border-red-300' : ''}`}
                    onClick={() => {
                      const lead = leads.find(l => l.id === fu.leadId);
                      if (lead) setSelectedLead(lead);
                    }}
                    data-testid={`followup-item-${fu.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`text-xs ${isOverdue ? 'border-red-400 text-red-600' : ''}`}>
                        {fu.type === 'call' && 'Ligar'}
                        {fu.type === 'whatsapp' && 'WhatsApp'}
                        {fu.type === 'email' && 'Email'}
                        {fu.type === 'meeting' && 'Reunião'}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{fu.leadName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{fu.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {fu.scheduledAt && (
                        <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {new Date(fu.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          {isOverdue && ' (atrasado)'}
                        </p>
                      )}
                      {isAdmin && vendorName && (
                        <p className="text-xs text-gray-400">{vendorName}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {enrichedFollowUps.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{enrichedFollowUps.length - 10} pendências...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header Actions */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending} data-testid="button-sync-leads">
                {syncMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Sincronizar Planilha
              </Button>
              <Button variant="secondary" onClick={() => importFileRef.current?.click()} disabled={importMutation.isPending} data-testid="button-import-xlsx">
                {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Importar XLSX
              </Button>
              <input
                ref={importFileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                data-testid="input-import-file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importMutation.mutate(file);
                    e.target.value = '';
                  }
                }}
              />
              <Button variant="secondary" onClick={() => regenerateMutation.mutate()} disabled={regenerateMutation.isPending} data-testid="button-regenerate-leads">
                {regenerateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Regenerar Perfis
              </Button>
              <Button variant="secondary" onClick={() => syncRegistrationsMutation.mutate()} disabled={syncRegistrationsMutation.isPending} data-testid="button-sync-registrations">
                {syncRegistrationsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Sincronizar Convertidos
              </Button>
              <Button variant="outline" onClick={() => setVendorModalOpen(true)} data-testid="button-add-vendor">
                <UserPlus className="w-4 h-4 mr-2" />
                Gerenciar Vendedores
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white border-gray-300"
            data-testid="input-search-leads"
          />
          <Button 
            variant={showMyLeadsOnly ? "default" : "outline"} 
            onClick={() => setShowMyLeadsOnly(!showMyLeadsOnly)}
            data-testid="button-my-leads"
          >
            <User className="w-4 h-4 mr-2" />
            Meus Leads
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="qualificado">Qualificado</SelectItem>
              <SelectItem value="negociando">Negociando</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
              <SelectItem value="mentorado">Mentorado</SelectItem>
              <SelectItem value="nao_abordar">Não Abordar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Temp.</SelectItem>
              <SelectItem value="hot">Quente</SelectItem>
              <SelectItem value="warm">Morno</SelectItem>
              <SelectItem value="cold">Frio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={contactFilter} onValueChange={setContactFilter}>
            <SelectTrigger className="w-44 bg-white" data-testid="select-contact-filter">
              <SelectValue placeholder="Contato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Contatos</SelectItem>
              <SelectItem value="whatsapp">Com WhatsApp</SelectItem>
              <SelectItem value="linkedin">Com LinkedIn</SelectItem>
              <SelectItem value="both">Ambos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards - Clickable to filter */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card 
          className={`bg-white border-gray-200 cursor-pointer transition-all hover-elevate ${temperatureFilter === 'all' && statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => { setTemperatureFilter('all'); setStatusFilter('all'); }}
          data-testid="card-total-leads"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">Total Leads</CardDescription>
            <CardTitle className="text-2xl text-gray-900">{leads.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className={`bg-red-50 border-red-200 cursor-pointer transition-all hover-elevate ${temperatureFilter === 'hot' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => { setTemperatureFilter('hot'); setStatusFilter('all'); }}
          data-testid="card-hot-leads"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-red-600 flex items-center gap-1"><Flame className="w-3 h-3" /> Quentes</CardDescription>
            <CardTitle className="text-2xl text-red-700">{leads.filter(l => l.temperature === 'hot').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className={`bg-orange-50 border-orange-200 cursor-pointer transition-all hover-elevate ${temperatureFilter === 'warm' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => { setTemperatureFilter('warm'); setStatusFilter('all'); }}
          data-testid="card-warm-leads"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 flex items-center gap-1"><ThermometerSun className="w-3 h-3" /> Mornos</CardDescription>
            <CardTitle className="text-2xl text-orange-700">{leads.filter(l => l.temperature === 'warm').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className={`bg-blue-50 border-blue-200 cursor-pointer transition-all hover-elevate ${temperatureFilter === 'cold' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => { setTemperatureFilter('cold'); setStatusFilter('all'); }}
          data-testid="card-cold-leads"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 flex items-center gap-1"><Snowflake className="w-3 h-3" /> Frios</CardDescription>
            <CardTitle className="text-2xl text-blue-700">{leads.filter(l => l.temperature === 'cold').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card 
          className={`bg-green-50 border-green-200 cursor-pointer transition-all hover-elevate ${statusFilter === 'convertido' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => { setStatusFilter('convertido'); setTemperatureFilter('all'); }}
          data-testid="card-converted-leads"
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Convertidos</CardDescription>
            <CardTitle className="text-2xl text-green-700">{leads.filter(l => l.status === 'convertido').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Pipeline de Leads ({filteredLeads.length})
          </CardTitle>
          <CardDescription className="text-gray-500">
            Clique em um lead para ver detalhes e gerenciar interações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 w-12">Temp</TableHead>
                  <TableHead className="text-gray-600">Score</TableHead>
                  <TableHead className="text-gray-600">Nome</TableHead>
                  <TableHead className="text-gray-600">Status</TableHead>
                  <TableHead className="text-gray-600">Vendedor</TableHead>
                  <TableHead className="text-gray-600">Último Contato</TableHead>
                  <TableHead className="text-gray-600">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    className={`cursor-pointer hover:bg-gray-50 ${getTemperatureBg(lead.temperature)}`}
                    onClick={() => setSelectedLead(lead)}
                    data-testid={`row-lead-${lead.id}`}
                  >
                    <TableCell>{getTemperatureIcon(lead.temperature)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {lead.score}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {lead.name}
                        {lead.phone && (
                          <span title="WhatsApp disponível">
                            <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                          </span>
                        )}
                        {lead.linkedin && (
                          <span title="LinkedIn disponível">
                            <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      {lead.vendorId ? (
                        <Badge className="bg-purple-100 text-purple-700">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {getVendorName(lead.vendorId)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Livre</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {lead.lastContactAt 
                        ? new Date(lead.lastContactAt).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {lead.linkedin && (
                          <Button size="icon" variant="ghost" asChild>
                            <a href={lead.linkedin.startsWith('http') ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="w-4 h-4 text-blue-600" />
                            </a>
                          </Button>
                        )}
                        {lead.phone && (
                          <Button size="icon" variant="ghost" asChild>
                            <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                              <Phone className="w-4 h-4 text-green-600" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredLeads.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {leads.length === 0 
                ? 'Nenhum lead encontrado. Clique em "Sincronizar Planilha" para importar.'
                : 'Nenhum lead corresponde aos filtros selecionados.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => { if (!open) { setSelectedLead(null); setShowSurveyPopup(false); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getTemperatureIcon(selectedLead.temperature)}
                  <div>
                    <DialogTitle className="text-xl">{selectedLead.name}</DialogTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      Score: {selectedLead.score} • {getStatusBadge(selectedLead.status)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                {/* Left Column - Contact & Survey */}
                <div className="space-y-4">
                  {/* Contact Info */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span>{selectedLead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedLead.phone ? (
                          <>
                            <span>{selectedLead.phone}</span>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                WhatsApp
                              </a>
                            </Button>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Não informado</span>
                        )}
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              const phone = prompt('Digite o telefone (com DDD):', selectedLead.phone || '');
                              if (phone !== null) {
                                updateContactMutation.mutate({ leadId: selectedLead.id, phone });
                              }
                            }}
                            data-testid="button-edit-phone"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      {selectedLead.linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-gray-400" />
                          <Button size="sm" variant="outline" asChild>
                            <a href={selectedLead.linkedin.startsWith('http') ? selectedLead.linkedin : `https://${selectedLead.linkedin}`} target="_blank" rel="noopener noreferrer">
                              Abrir LinkedIn
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Vendor Assignment */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Atribuição</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedLead.vendorId ? (
                        <div className="flex items-center justify-between">
                          <Badge className="bg-purple-100 text-purple-700">
                            <UserCheck className="w-3 h-3 mr-1" />
                            {getVendorName(selectedLead.vendorId)}
                          </Badge>
                          {/* Only show release button if admin OR if current vendor owns this lead */}
                          {(isAdmin || selectedLead.vendorId === currentVendor?.id) && (
                            <Button size="sm" variant="outline" onClick={() => releaseMutation.mutate(selectedLead.id)} data-testid="button-release-lead">
                              Liberar
                            </Button>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Non-admin vendors see simple "Pegar para mim" button */}
                          {!isAdmin && currentVendor && (
                            <Button 
                              onClick={() => claimMutation.mutate({ leadId: selectedLead.id, vendorId: currentVendor.id })}
                              data-testid="button-claim-lead-self"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Pegar para mim
                            </Button>
                          )}
                          {/* Admin sees vendor selector */}
                          {isAdmin && (
                            <div className="flex gap-2">
                              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Selecionar vendedor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vendors.filter(v => v.isActive).map(vendor => (
                                    <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                size="sm" 
                                disabled={!selectedVendorId}
                                onClick={() => claimMutation.mutate({ leadId: selectedLead.id, vendorId: selectedVendorId })}
                                data-testid="button-assign-lead"
                              >
                                Atribuir
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={selectedLead.status} 
                        onValueChange={(status) => statusMutation.mutate({ leadId: selectedLead.id, status })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo</SelectItem>
                          <SelectItem value="em_contato">Em Contato</SelectItem>
                          <SelectItem value="qualificado">Qualificado</SelectItem>
                          <SelectItem value="negociando">Negociando</SelectItem>
                          <SelectItem value="convertido">Convertido</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                          <SelectItem value="mentorado">Mentorado</SelectItem>
                          <SelectItem value="nao_abordar">Não Abordar</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* AI Summary with Score Breakdown - Simplified */}
                  {(selectedLead.scoreBreakdown || selectedLead.aiSummary) && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Bot className="w-4 h-4 text-blue-600" />
                          Análise do Perfil (Score: {selectedLead.score})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {selectedLead.scoreBreakdown && Array.isArray(selectedLead.scoreBreakdown) && selectedLead.scoreBreakdown.length > 0 ? (
                          <div className="space-y-1.5">
                            {(selectedLead.scoreBreakdown as { category: string; points: number; reason: string }[]).map((item, i) => (
                              <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-blue-100">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">{item.category}</Badge>
                                  <span className="text-xs text-gray-600">{item.reason}</span>
                                </div>
                                <span className="text-sm font-bold text-blue-700">+{item.points}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-blue-800">{selectedLead.aiSummary}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Survey Button */}
                  {selectedLead.surveyResponses && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowSurveyPopup(true)}
                      data-testid="button-view-survey"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Questionário Completo
                    </Button>
                  )}
                </div>

                {/* Right Column - AI Suggestions, Activities & Follow-ups */}
                <div className="space-y-4">
                  {/* AI Suggestions */}
                  {aiSuggestions && (
                    <Card className={`${aiSuggestions.status === 'priority' ? 'bg-red-50 border-red-200' : aiSuggestions.status === 'follow' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          Sugestões da IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Próximos Passos:</p>
                          <ul className="text-sm space-y-1">
                            {aiSuggestions.nextSteps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Argumentos:</p>
                          <ul className="text-sm space-y-1">
                            {aiSuggestions.arguments.map((arg, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600">💡</span>
                                <span>{arg}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Add Activity */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Registrar Atividade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Select value={activityType} onValueChange={setActivityType}>
                          <SelectTrigger className="w-32 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="note">Nota</SelectItem>
                            <SelectItem value="call">Ligação</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Reunião</SelectItem>
                          </SelectContent>
                        </Select>
                        <Textarea 
                          value={activityContent}
                          onChange={(e) => setActivityContent(e.target.value)}
                          placeholder="O que aconteceu nessa interação?"
                          className="bg-white"
                          rows={2}
                        />
                      </div>
                      <Button 
                        size="sm" 
                        disabled={!activityContent.trim()}
                        onClick={() => activityMutation.mutate({ leadId: selectedLead.id, type: activityType, content: activityContent })}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Registrar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Schedule Follow-up */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Agendar Follow-up</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2">
                        <Select value={followUpType} onValueChange={setFollowUpType}>
                          <SelectTrigger className="w-32 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="call">Ligar</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="meeting">Reunião</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          type="datetime-local"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <Input 
                        value={followUpDescription}
                        onChange={(e) => setFollowUpDescription(e.target.value)}
                        placeholder="Descrição do follow-up"
                        className="bg-white"
                      />
                      <Button 
                        size="sm" 
                        disabled={!followUpDate || !followUpDescription.trim()}
                        onClick={() => followUpMutation.mutate({ 
                          leadId: selectedLead.id, 
                          type: followUpType, 
                          description: followUpDescription,
                          scheduledAt: followUpDate 
                        })}
                      >
                        <CalendarClock className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pending Follow-ups */}
                  {followUps.filter(f => !f.isCompleted).length > 0 && (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          Follow-ups Pendentes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {followUps.filter(f => !f.isCompleted).map(f => (
                            <div key={f.id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                              <div>
                                <span className="font-medium">{f.description}</span>
                                <span className="text-gray-500 ml-2">
                                  {new Date(f.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => completeFollowUpMutation.mutate(f.id)}>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Activity History */}
                  <Card className="bg-gray-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Histórico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <div className="space-y-3">
                          {activities.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">Nenhuma atividade registrada</p>
                          ) : (
                            activities.map(activity => (
                              <div key={activity.id} className="border-l-2 border-blue-200 pl-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                  <span className="capitalize">{activity.type}</span>
                                  <span>•</span>
                                  <span>{new Date(activity.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-gray-900">{activity.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Survey Popup */}
      <Dialog open={showSurveyPopup} onOpenChange={setShowSurveyPopup}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-survey">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Respostas do Questionário
            </DialogTitle>
            <DialogDescription data-testid="text-survey-lead-name">
              {selectedLead?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedLead?.surveyResponses && (
            <div className="space-y-3 text-sm" data-testid="container-survey-responses">
              {Object.entries(selectedLead.surveyResponses as Record<string, string>).map(([q, a], i) => (
                <div key={i} className="border-b pb-2 border-gray-200" data-testid={`row-survey-${i}`}>
                  <p className="font-medium text-gray-700 text-xs">{q}</p>
                  <p className="text-gray-900 mt-1">{a || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Management Modal */}
      <Dialog open={vendorModalOpen} onOpenChange={setVendorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Vendedores</DialogTitle>
            <DialogDescription>Cadastre vendedores que podem trabalhar os leads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Input 
                placeholder="Nome"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
              />
              <Input 
                placeholder="Email"
                type="email"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => createVendorMutation.mutate({ name: newVendorName, email: newVendorEmail })}
              disabled={!newVendorName.trim() || !newVendorEmail.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Vendedor
            </Button>

            {vendors.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-gray-500">Vendedores cadastrados:</Label>
                <div className="space-y-2 mt-2">
                  {vendors.map(vendor => (
                    <div key={vendor.id} className="bg-gray-50 p-3 rounded space-y-2">
                      {editingVendorId === vendor.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              value={editVendorName}
                              onChange={(e) => setEditVendorName(e.target.value)}
                              placeholder="Nome"
                              data-testid={`input-edit-vendor-name-${vendor.id}`}
                            />
                            <Input 
                              value={editVendorEmail}
                              onChange={(e) => setEditVendorEmail(e.target.value)}
                              placeholder="Email"
                              type="email"
                              data-testid={`input-edit-vendor-email-${vendor.id}`}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => {
                                updateVendorMutation.mutate({ 
                                  id: vendor.id, 
                                  name: editVendorName, 
                                  email: editVendorEmail 
                                });
                                setEditingVendorId(null);
                              }}
                              disabled={!editVendorName.trim() || !editVendorEmail.trim()}
                              data-testid={`button-save-vendor-${vendor.id}`}
                            >
                              Salvar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingVendorId(null)}
                              data-testid={`button-cancel-edit-${vendor.id}`}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{vendor.name}</span>
                              <span className="text-gray-500 text-sm ml-2">{vendor.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                                {vendor.isActive ? 'Ativo' : 'Inativo'}
                              </Badge>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingVendorId(vendor.id);
                                  setEditVendorName(vendor.name);
                                  setEditVendorEmail(vendor.email || '');
                                }}
                                data-testid={`button-edit-vendor-${vendor.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setVendorToDelete({ id: vendor.id, name: vendor.name })}
                                data-testid={`button-delete-vendor-${vendor.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Recebe comissão:</span>
                              <Switch 
                                checked={vendor.hasCommission ?? true}
                                onCheckedChange={(checked) => 
                                  updateVendorMutation.mutate({ id: vendor.id, hasCommission: checked })
                                }
                                data-testid={`switch-vendor-commission-${vendor.id}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Status:</span>
                              <Switch 
                                checked={vendor.isActive}
                                onCheckedChange={(checked) => 
                                  updateVendorMutation.mutate({ id: vendor.id, isActive: checked })
                                }
                                data-testid={`switch-vendor-active-${vendor.id}`}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Vendor Confirmation Dialog */}
      <AlertDialog open={!!vendorToDelete} onOpenChange={(open) => !open && setVendorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Vendedor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o vendedor <strong>{vendorToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita e removerá todos os registros associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-vendor">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (vendorToDelete) {
                  deleteVendorMutation.mutate(vendorToDelete.id);
                  setVendorToDelete(null);
                }
              }}
              data-testid="button-confirm-delete-vendor"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Vendor Activity Log Section Component
function VendorActivitySection() {
  interface VendorActivityLog {
    id: string;
    vendorId: string;
    vendorName: string;
    leadId: string | null;
    leadName: string | null;
    actionType: string;
    actionDescription: string;
    metadata: string | null;
    createdAt: string;
  }

  interface ActivityLogResponse {
    logs: VendorActivityLog[];
    total: number;
  }

  interface ActivitySummary {
    totalActions: number;
    byActionType: Record<string, number>;
    byVendor: Record<string, number>;
  }

  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['/api/crm/vendors'],
  });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));

  const { data: activityData, isLoading } = useQuery<ActivityLogResponse>({
    queryKey: ['/api/crm/vendor-activity', vendorFilter, actionTypeFilter, dateRange, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (vendorFilter !== 'all') params.set('vendorId', vendorFilter);
      if (actionTypeFilter !== 'all') params.set('actionType', actionTypeFilter);
      params.set('startDate', startDate.toISOString());
      params.set('limit', pageSize.toString());
      params.set('offset', (page * pageSize).toString());
      const res = await fetch(`/api/crm/vendor-activity?${params}`, {
        credentials: 'include',
      });
      return res.json();
    },
  });

  const { data: summary } = useQuery<ActivitySummary>({
    queryKey: ['/api/crm/vendor-activity/summary', vendorFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (vendorFilter !== 'all') params.set('vendorId', vendorFilter);
      params.set('days', dateRange);
      const res = await fetch(`/api/crm/vendor-activity/summary?${params}`, {
        credentials: 'include',
      });
      return res.json();
    },
  });

  const actionTypeLabels: Record<string, { label: string; color: string }> = {
    'claim_lead': { label: 'Reservar Lead', color: 'bg-blue-100 text-blue-700' },
    'release_lead': { label: 'Liberar Lead', color: 'bg-gray-100 text-gray-700' },
    'add_activity': { label: 'Registrar Atividade', color: 'bg-green-100 text-green-700' },
    'create_followup': { label: 'Criar Follow-up', color: 'bg-purple-100 text-purple-700' },
    'complete_followup': { label: 'Concluir Follow-up', color: 'bg-emerald-100 text-emerald-700' },
    'update_status': { label: 'Alterar Status', color: 'bg-orange-100 text-orange-700' },
    'view_lead': { label: 'Visualizar Lead', color: 'bg-slate-100 text-slate-700' },
  };

  const logs = activityData?.logs || [];
  const total = activityData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Log de Atividades dos Vendedores
          </CardTitle>
          <CardDescription>
            Acompanhe todas as ações realizadas pelos vendedores no CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Vendedor:</Label>
              <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); setPage(0); }}>
                <SelectTrigger className="w-48" data-testid="select-vendor-filter">
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Tipo de Ação:</Label>
              <Select value={actionTypeFilter} onValueChange={(v) => { setActionTypeFilter(v); setPage(0); }}>
                <SelectTrigger className="w-48" data-testid="select-action-filter">
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.entries(actionTypeLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Período:</Label>
              <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(0); }}>
                <SelectTrigger className="w-36" data-testid="select-period-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Últimas 24h</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-gray-900">{summary.totalActions}</div>
                  <div className="text-sm text-gray-500">Total de Ações</div>
                </CardContent>
              </Card>
              {Object.entries(summary.byActionType || {}).slice(0, 4).map(([type, count]) => (
                <Card key={type} className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{actionTypeLabels[type]?.label || type}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma atividade encontrada para os filtros selecionados.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-600">Data/Hora</TableHead>
                    <TableHead className="text-gray-600">Vendedor</TableHead>
                    <TableHead className="text-gray-600">Ação</TableHead>
                    <TableHead className="text-gray-600">Lead</TableHead>
                    <TableHead className="text-gray-600">Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-b border-gray-100">
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR')}{' '}
                        <span className="text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-white">
                          <User className="w-3 h-3 mr-1" />
                          {log.vendorName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionTypeLabels[log.actionType]?.color || 'bg-gray-100'}>
                          {actionTypeLabels[log.actionType]?.label || log.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.leadName ? (
                          <span className="text-gray-700">{log.leadName}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-md truncate">
                        {log.actionDescription}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {page * pageSize + 1} a {Math.min((page + 1) * pageSize, total)} de {total} registros
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      data-testid="btn-prev-page"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1}
                      data-testid="btn-next-page"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Section Component
function AnalyticsSection() {
  interface AnalyticsData {
    viewsByDay: { date: string; count: number }[];
    viewsByPath: { path: string; count: number }[];
    totalViews: number;
    uniqueVisitors: number;
    period: number;
  }

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/stats'],
  });

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const pageNameMap: Record<string, string> = {
    '/': 'Página do Evento',
    '/mentoria': 'Página da Mentoria',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">Total de Visitas</CardDescription>
            <CardTitle className="text-3xl text-gray-900" data-testid="text-total-views">
              {analytics?.totalViews?.toLocaleString('pt-BR') || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">Visitantes Únicos (30 dias)</CardDescription>
            <CardTitle className="text-3xl text-gray-900" data-testid="text-unique-visitors">
              {analytics?.uniqueVisitors?.toLocaleString('pt-BR') || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">Visitas Hoje</CardDescription>
            <CardTitle className="text-3xl text-gray-900" data-testid="text-visits-today">
              {(() => {
                const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
                return analytics?.viewsByDay?.find(d => d.date === today)?.count?.toLocaleString('pt-BR') || 0;
              })()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-500">Média Diária</CardDescription>
            <CardTitle className="text-3xl text-gray-900" data-testid="text-daily-avg">
              {analytics?.viewsByDay && analytics.viewsByDay.length > 0 
                ? Math.round(analytics.viewsByDay.reduce((sum, d) => sum + d.count, 0) / analytics.viewsByDay.length).toLocaleString('pt-BR')
                : 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pages Most Visited */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Páginas Mais Visitadas
          </CardTitle>
          <CardDescription className="text-gray-500">
            Ranking das páginas por número de visitas nos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.viewsByPath && analytics.viewsByPath.length > 0 ? (
            <div className="space-y-3">
              {analytics.viewsByPath.map((page, index) => {
                const maxCount = analytics.viewsByPath[0]?.count || 1;
                const percentage = maxCount > 0 ? (page.count / maxCount) * 100 : 0;
                return (
                  <div key={page.path} className="space-y-1" data-testid={`row-page-${index}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {pageNameMap[page.path] || page.path}
                        </span>
                        <span className="text-xs text-gray-500">({page.path})</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {page.count.toLocaleString('pt-BR')} visitas
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma visita registrada ainda. As estatísticas aparecerão aqui assim que os visitantes acessarem o site.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Visits Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Visitas por Dia
          </CardTitle>
          <CardDescription className="text-gray-500">
            Histórico de visitas dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.viewsByDay && analytics.viewsByDay.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600">Data</TableHead>
                  <TableHead className="text-gray-600">Dia da Semana</TableHead>
                  <TableHead className="text-right text-gray-600">Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.viewsByDay.map((day, index) => {
                  const date = new Date(day.date + 'T12:00:00');
                  const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' });
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  return (
                    <TableRow key={day.date} data-testid={`row-day-${index}`}>
                      <TableCell className="font-medium text-gray-900">{formattedDate}</TableCell>
                      <TableCell className="text-gray-600 capitalize">{dayOfWeek}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {day.count.toLocaleString('pt-BR')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma visita registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TurmaConfigsSection — full CRUD for per-turma financial config (flexible plans)
// ─────────────────────────────────────────────────────────────────────────────
function TurmaConfigsSection() {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TurmaConfig | null>(null);
  const [previewBatch, setPreviewBatch] = useState(3);

  // -- form types & state --
  type FPlan = { id: string; label: string; totalAmount: number; installments: number; feeRate: number; paymentLink: string; };
  type FBatch = { batch: number; label: string; deadline: string; plans: FPlan[]; };
  type FState = { turmaId: string; name: string; active: boolean; taxRate: number; vendorCommissionRate: number; mmRate: number; hfRate: number; batches: FBatch[]; };

  const mkDefaultPlans = (): FPlan[] => [
    { id: 'pix', label: 'PIX', totalAmount: 0, installments: 1, feeRate: 0, paymentLink: '' },
    { id: 'installments', label: '5x Cartão', totalAmount: 0, installments: 5, feeRate: 8.8, paymentLink: '' },
    { id: 'installments10', label: '10x Cartão', totalAmount: 0, installments: 10, feeRate: 15.06, paymentLink: '' },
  ];

  const emptyForm = (): FState => ({
    turmaId: '', name: '', active: true,
    taxRate: 11.75, vendorCommissionRate: 16.67, mmRate: 66.67, hfRate: 33.33,
    batches: [{ batch: 1, label: 'Lote 1', deadline: '', plans: mkDefaultPlans() }],
  });

  const [form, setForm] = useState<FState>(emptyForm());

  const { data: configs = [], isLoading } = useQuery<TurmaConfig[]>({ queryKey: ['/api/turma-configs'] });

  const saveMutation = useMutation({
    mutationFn: async (data: { id?: number; payload: object }) => {
      if (data.id) return apiRequest('PATCH', `/api/turma-configs/${data.id}`, data.payload);
      return apiRequest('POST', '/api/turma-configs', data.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/turma-configs'] });
      setEditDialogOpen(false); setNewDialogOpen(false);
      toast({ title: 'Configuração salva!', description: 'Turma atualizada com sucesso.' });
    },
    onError: () => toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' }),
  });

  // Convert DB batches (new plans format OR old pixPrice format) → FBatch[]
  const batchesToForm = (rawBatches: BatchPricingItem[], cfg: TurmaConfig): FBatch[] =>
    rawBatches.map(b => {
      const bp = b as any;
      const plans: FPlan[] = bp.plans
        ? bp.plans.map((p: any) => ({ ...p, feeRate: +(p.feeRate * 100).toFixed(4) }))
        : [
            { id: 'pix', label: 'PIX', totalAmount: bp.pixPrice ?? 0, installments: 1, feeRate: 0, paymentLink: '' },
            { id: 'installments', label: '5x Cartão', totalAmount: bp.card5Total ?? 0, installments: bp.card5Installments ?? 5, feeRate: +(cfg.card5FeeRate * 100).toFixed(2), paymentLink: cfg.card5PaymentLink ?? '' },
            { id: 'installments10', label: '10x Cartão', totalAmount: bp.card10Total ?? 0, installments: bp.card10Installments ?? 10, feeRate: +(cfg.card10FeeRate * 100).toFixed(2), paymentLink: cfg.card10PaymentLink ?? '' },
          ];
      return { batch: b.batch, label: b.label, deadline: b.deadline, plans };
    });

  const openEdit = (cfg: TurmaConfig) => {
    setEditing(cfg);
    setForm({
      turmaId: cfg.turmaId, name: cfg.name, active: cfg.active,
      taxRate: +(cfg.taxRate * 100).toFixed(4),
      vendorCommissionRate: +(cfg.vendorCommissionRate * 100).toFixed(4),
      mmRate: +(cfg.mmRate * 100).toFixed(4),
      hfRate: +(cfg.hfRate * 100).toFixed(4),
      batches: batchesToForm(cfg.batches as BatchPricingItem[], cfg),
    });
    const cfgBatches = cfg.batches as BatchPricingItem[];
    setPreviewBatch(cfgBatches[cfgBatches.length - 1]?.batch ?? cfgBatches[0]?.batch ?? 1);
    setEditDialogOpen(true);
  };

  const openNew = () => {
    const last = [...configs].sort((a, b) => b.id - a.id)[0];
    if (last) {
      setForm({
        turmaId: '', name: '', active: true,
        taxRate: +(last.taxRate * 100).toFixed(4),
        vendorCommissionRate: +(last.vendorCommissionRate * 100).toFixed(4),
        mmRate: +(last.mmRate * 100).toFixed(4),
        hfRate: +(last.hfRate * 100).toFixed(4),
        batches: batchesToForm(last.batches as BatchPricingItem[], last).map(b => ({
          ...b, plans: b.plans.map(p => ({ ...p, paymentLink: '' })),
        })),
      });
      const lastBatches = last.batches as BatchPricingItem[];
      setPreviewBatch(lastBatches[lastBatches.length - 1]?.batch ?? lastBatches[0]?.batch ?? 1);
    } else {
      setForm(emptyForm());
    }
    setEditing(null);
    setNewDialogOpen(true);
  };

  const buildPayload = () => {
    const lastPlans = form.batches[form.batches.length - 1]?.plans ?? [];
    const c5 = lastPlans.find(p => p.id === 'installments');
    const c10 = lastPlans.find(p => p.id === 'installments10');
    return {
      turmaId: form.turmaId.trim(), name: form.name.trim(), active: form.active,
      taxRate: form.taxRate / 100,
      card5FeeRate: (c5?.feeRate ?? 8.8) / 100,
      card10FeeRate: (c10?.feeRate ?? 15.06) / 100,
      vendorCommissionRate: form.vendorCommissionRate / 100,
      mmRate: form.mmRate / 100,
      hfRate: form.hfRate / 100,
      card5PaymentLink: c5?.paymentLink ?? '',
      card10PaymentLink: c10?.paymentLink ?? '',
      batches: form.batches.map(b => ({
        batch: b.batch, label: b.label, deadline: b.deadline,
        plans: b.plans.map(p => ({ ...p, feeRate: p.feeRate / 100 })),
      })),
    };
  };

  // Batch-level mutation helpers
  const updBatchField = (bIdx: number, field: keyof FBatch, val: any) =>
    setForm(f => ({ ...f, batches: f.batches.map((b, i) => i === bIdx ? { ...b, [field]: val } : b) }));

  const updPlan = (bIdx: number, pIdx: number, field: keyof FPlan, val: string) =>
    setForm(f => ({ ...f, batches: f.batches.map((b, i) => i !== bIdx ? b : {
      ...b, plans: b.plans.map((p, j) => j !== pIdx ? p : {
        ...p, [field]: ['totalAmount', 'installments', 'feeRate'].includes(field) ? (parseFloat(val) || 0) : val,
      }),
    }) }));

  const addPlan = (bIdx: number) =>
    setForm(f => ({ ...f, batches: f.batches.map((b, i) => i !== bIdx ? b : {
      ...b, plans: [...b.plans, { id: `plano_${b.plans.length + 1}`, label: `Plano ${b.plans.length + 1}`, totalAmount: 0, installments: 1, feeRate: 0, paymentLink: '' }],
    }) }));

  const removePlan = (bIdx: number, pIdx: number) =>
    setForm(f => ({ ...f, batches: f.batches.map((b, i) => i !== bIdx ? b : {
      ...b, plans: b.plans.filter((_, j) => j !== pIdx),
    }) }));

  const addBatch = () => {
    const last = form.batches[form.batches.length - 1];
    setForm(f => ({ ...f, batches: [...f.batches, {
      batch: (last?.batch ?? 0) + 1, label: `Lote ${(last?.batch ?? 0) + 1}`, deadline: '',
      plans: last?.plans.map(p => ({ ...p })) ?? mkDefaultPlans(),
    }] }));
  };

  const removeBatch = (idx: number) =>
    setForm(f => ({ ...f, batches: f.batches.filter((_, i) => i !== idx) }));

  // Waterfall calculation for preview — uses plans from the selected batch
  const calcWaterfall = (batch: FBatch) => {
    const tax = form.taxRate / 100;
    const vendorR = form.vendorCommissionRate / 100;
    const mmR = form.mmRate / 100;
    const hfR = form.hfRate / 100;
    return batch.plans.map(plan => {
      const feeRate = plan.feeRate / 100;
      const cardFee = plan.totalAmount * feeRate;
      const taxes = plan.totalAmount * tax;
      const net = plan.totalAmount - taxes - cardFee;
      const vendor = net * vendorR;
      const sobra = net - vendor;
      return { label: plan.label, gross: plan.totalAmount, feeRate: plan.feeRate, cardFee, taxes, net, vendor, sobra, mm: sobra * mmR, hf: sobra * hfR };
    });
  };

  const fmtR = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (v: number) => `${v.toFixed(2)}%`;

  const selectedFBatch = form.batches.find(b => b.batch === previewBatch) ?? form.batches[0];
  const waterfall = selectedFBatch ? calcWaterfall(selectedFBatch) : null;

  const configDialog = (
    <Dialog open={editDialogOpen || newDialogOpen} onOpenChange={v => { if (!v) { setEditDialogOpen(false); setNewDialogOpen(false); } }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{editing ? `Editar ${editing.name}` : 'Nova Turma'}</DialogTitle>
          <DialogDescription className="text-gray-500">Configure taxas, tarifas e preços por lote.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-700 text-sm">ID da Turma</Label>
              <Input value={form.turmaId} onChange={e => setForm(f => ({ ...f, turmaId: e.target.value }))}
                placeholder="ex: turma_5" className="bg-white border-gray-300 text-gray-900" disabled={!!editing} />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-700 text-sm">Nome</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: Turma 5 — Terças-feiras" className="bg-white border-gray-300 text-gray-900" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} id="active-sw" />
            <Label htmlFor="active-sw" className="text-gray-700 text-sm cursor-pointer">Turma ativa</Label>
          </div>

          {/* Financial rates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">Taxas e Distribuição</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Imposto (NF)', key: 'taxRate' as const },
                { label: 'Comissão Vendedor', key: 'vendorCommissionRate' as const },
                { label: 'Marcelo Murilo (MM)', key: 'mmRate' as const },
                { label: 'Hamilton Felix (HF)', key: 'hfRate' as const },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-gray-700 text-sm">{label}</Label>
                  <div className="relative">
                    <Input type="number" step="0.01" value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                      className="bg-white border-gray-300 text-gray-900 pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">MM% e HF% são aplicados sobre a sobra (líquido − comissão vendedor). Taxas gateway são configuradas por plano em cada lote.</p>
          </div>

          {/* Flexible batch + plans editor */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-1">
              <h3 className="text-sm font-semibold text-gray-800">Lotes e Planos de Pagamento</h3>
              <Button size="sm" variant="outline" onClick={addBatch} className="border-gray-300 text-gray-700">
                <Plus className="w-3 h-3 mr-1" /> Novo Lote
              </Button>
            </div>
            <div className="space-y-4">
              {form.batches.map((batch, bIdx) => (
                <div key={bIdx} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                  {/* Batch header */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Lote</span>
                      <Input type="number" value={batch.batch}
                        onChange={e => updBatchField(bIdx, 'batch', parseInt(e.target.value) || 0)}
                        className="w-14 h-7 text-xs bg-white border-gray-300" />
                    </div>
                    <Input value={batch.label} onChange={e => updBatchField(bIdx, 'label', e.target.value)}
                      placeholder="Label" className="h-7 text-xs bg-white border-gray-300 flex-1 min-w-24" />
                    <Input value={batch.deadline} onChange={e => updBatchField(bIdx, 'deadline', e.target.value)}
                      placeholder="Prazo (ex: 04/01/2026)" className="h-7 text-xs bg-white border-gray-300 w-40" />
                    <Button size="icon" variant="ghost" onClick={() => removeBatch(bIdx)} disabled={form.batches.length <= 1}
                      className="h-7 w-7 text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {/* Plans table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white border-b border-gray-200">
                          <th className="px-2 py-1 text-left text-gray-500 font-medium w-28">ID (método)</th>
                          <th className="px-2 py-1 text-left text-gray-500 font-medium w-28">Label</th>
                          <th className="px-2 py-1 text-right text-gray-500 font-medium w-28">Total (R$)</th>
                          <th className="px-2 py-1 text-right text-gray-500 font-medium w-16">Parcelas</th>
                          <th className="px-2 py-1 text-right text-gray-500 font-medium w-20">Taxa %</th>
                          <th className="px-2 py-1 text-left text-gray-500 font-medium">Link pagamento</th>
                          <th className="px-2 py-1 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.plans.map((plan, pIdx) => (
                          <tr key={pIdx} className="border-t border-gray-100">
                            <td className="px-2 py-1">
                              <Input value={plan.id} onChange={e => updPlan(bIdx, pIdx, 'id', e.target.value)}
                                className="h-7 text-xs bg-white border-gray-200 font-mono" />
                            </td>
                            <td className="px-2 py-1">
                              <Input value={plan.label} onChange={e => updPlan(bIdx, pIdx, 'label', e.target.value)}
                                className="h-7 text-xs bg-white border-gray-200" />
                            </td>
                            <td className="px-2 py-1">
                              <Input type="number" step="0.01" value={plan.totalAmount}
                                onChange={e => updPlan(bIdx, pIdx, 'totalAmount', e.target.value)}
                                className="h-7 text-xs text-right bg-white border-gray-200" />
                            </td>
                            <td className="px-2 py-1">
                              <Input type="number" value={plan.installments}
                                onChange={e => updPlan(bIdx, pIdx, 'installments', e.target.value)}
                                className="h-7 text-xs text-right bg-white border-gray-200" />
                            </td>
                            <td className="px-2 py-1">
                              <div className="relative">
                                <Input type="number" step="0.01" value={plan.feeRate}
                                  onChange={e => updPlan(bIdx, pIdx, 'feeRate', e.target.value)}
                                  className="h-7 text-xs text-right bg-white border-gray-200 pr-6" />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                              </div>
                            </td>
                            <td className="px-2 py-1">
                              <Input value={plan.paymentLink} onChange={e => updPlan(bIdx, pIdx, 'paymentLink', e.target.value)}
                                placeholder="https://..." className="h-7 text-xs bg-white border-gray-200" />
                            </td>
                            <td className="px-2 py-1">
                              <Button size="icon" variant="ghost" onClick={() => removePlan(bIdx, pIdx)}
                                disabled={batch.plans.length <= 1} className="h-7 w-7 text-red-400">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addPlan(bIdx)}
                    className="mt-2 text-blue-600 text-xs h-7">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar plano
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Waterfall preview */}
          {waterfall && (
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-1">
                <h3 className="text-sm font-semibold text-gray-800">Preview — Cascata Financeira</h3>
                <Select value={String(previewBatch)} onValueChange={v => setPreviewBatch(parseInt(v))}>
                  <SelectTrigger className="w-32 h-8 text-xs bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {form.batches.map(b => (
                      <SelectItem key={b.batch} value={String(b.batch)}>{b.label || `Lote ${b.batch}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 text-left text-gray-700 font-semibold w-44">Linha</th>
                      {waterfall.map(col => (
                        <th key={col.label} className="px-3 py-2 text-right text-gray-700 font-semibold">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'gross', label: 'Preço ofertado (bruto)', cls: 'font-semibold text-gray-900' },
                      { key: 'cardFee', label: '(-) Taxa gateway (por plano)', cls: 'text-orange-600' },
                      { key: 'taxes', label: `(-) Imposto ${fmtPct(form.taxRate)}`, cls: 'text-red-600' },
                      { key: 'net', label: 'Líquido pós-impostos', cls: 'font-semibold text-emerald-700 bg-emerald-50' },
                      { key: 'vendor', label: `(-) Comissão vendedor ${fmtPct(form.vendorCommissionRate)}`, cls: 'text-amber-700' },
                      { key: 'sobra', label: 'Sobra sócios', cls: 'font-semibold text-blue-700 bg-blue-50' },
                      { key: 'mm', label: `→ MM ${fmtPct(form.mmRate)} da sobra`, cls: 'text-indigo-700' },
                      { key: 'hf', label: `→ HF ${fmtPct(form.hfRate)} da sobra`, cls: 'text-violet-700' },
                    ].map(row => (
                      <tr key={row.key} className="border-t border-gray-100">
                        <td className={`px-3 py-2 text-gray-700 ${row.cls}`}>{row.label}</td>
                        {waterfall.map(col => (
                          <td key={col.label} className={`px-3 py-2 text-right ${row.cls}`}>
                            R$ {fmtR((col as Record<string, number>)[row.key] ?? 0)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setEditDialogOpen(false); setNewDialogOpen(false); }} className="border-gray-300 text-gray-700">
            Cancelar
          </Button>
          <Button onClick={() => saveMutation.mutate({ id: editing?.id, payload: buildPayload() })}
            disabled={saveMutation.isPending || !form.turmaId || !form.name}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuração de Turmas
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Taxas de imposto, tarifas do gateway e distribuição de receita por turma.
              </CardDescription>
            </div>
            <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-nova-turma">
              <Plus className="w-4 h-4 mr-2" /> Nova Turma
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma configuração encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {configs.map(cfg => {
                const batches = cfg.batches as BatchPricingItem[];
                return (
                  <div key={cfg.id} className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-3"
                    data-testid={`card-turma-${cfg.turmaId}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{cfg.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{cfg.turmaId}</p>
                      </div>
                      <Badge variant={cfg.active ? 'default' : 'secondary'}
                        className={cfg.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}>
                        {cfg.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>

                    {(() => {
                      const lastBatch = batches[batches.length - 1];
                      const lastPlans = (lastBatch as any)?.plans as any[] | undefined;
                      const pixPlan = lastPlans?.find((p: any) => p.id === 'pix' || p.installments === 1);
                      const c5Plan = lastPlans?.find((p: any) => p.id === 'installments');
                      const c10Plan = lastPlans?.find((p: any) => p.id === 'installments10');
                      return (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between text-gray-600">
                            <span>Imposto</span><span className="font-mono">{(cfg.taxRate * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Comissão vendedor</span><span className="font-mono text-amber-700">{(cfg.vendorCommissionRate * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>MM / HF</span>
                            <span className="font-mono text-indigo-700">{(cfg.mmRate * 100).toFixed(2)}% / {(cfg.hfRate * 100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Lotes</span><span>{batches.length}</span>
                          </div>
                          {lastBatch && (
                            <div className="pt-1 border-t border-gray-200 space-y-0.5">
                              <p className="text-gray-400">{lastBatch.label}:</p>
                              {pixPlan && <div className="flex justify-between"><span className="text-gray-500">PIX</span><span className="font-mono text-green-700">R$ {pixPlan.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                              {c5Plan && <div className="flex justify-between"><span className="text-gray-500">{c5Plan.installments}x cartão</span><span className="font-mono">R$ {c5Plan.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                              {c10Plan && <div className="flex justify-between"><span className="text-gray-500">{c10Plan.installments}x cartão</span><span className="font-mono">R$ {c10Plan.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                              {!lastPlans && (lastBatch as any).pixPrice != null && <div className="flex justify-between"><span className="text-gray-500">PIX</span><span className="font-mono text-green-700">R$ {(lastBatch as any).pixPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <Button variant="outline" size="sm" onClick={() => openEdit(cfg)}
                      className="w-full border-gray-300 text-gray-700" data-testid={`button-edit-turma-${cfg.turmaId}`}>
                      <Edit2 className="w-3 h-3 mr-1" /> Editar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {configDialog}
    </div>
  );
}

export default function AdminPage() {
  const { data: dbInfo } = useQuery<{ dbUrl: string }>({
    queryKey: ['/api/db-info'],
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Mentoria Marcelo Murilo & Hamilton Felix</p>
        </div>

        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="flex flex-wrap w-full max-w-3xl gap-1 bg-white border border-gray-200 h-auto p-1">
            <TabsTrigger value="crm" data-testid="tab-crm" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <Target className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="activity-log" data-testid="tab-activity-log" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Atividades</span>
            </TabsTrigger>
            <TabsTrigger value="mentorship" data-testid="tab-mentorship" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Inscrições</span>
            </TabsTrigger>
            <TabsTrigger value="event" data-testid="tab-event" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <Calendar className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Evento</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <TrendingUp className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="turmas" data-testid="tab-turmas" className="data-[state=active]:bg-gray-100 flex-1 min-w-[60px] px-2 py-1.5">
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Turmas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm">
            <CRMSection />
          </TabsContent>

          <TabsContent value="activity-log">
            <VendorActivitySection />
          </TabsContent>

          <TabsContent value="mentorship">
            <MentorshipRegistrationsSection />
          </TabsContent>

          <TabsContent value="event">
            <EventRegistrationsSection />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>

          <TabsContent value="turmas">
            <TurmaConfigsSection />
          </TabsContent>
        </Tabs>

        {/* Database Info Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 font-mono break-all" data-testid="db-url-footer">
            DB: {dbInfo?.dbUrl || 'Carregando...'}
          </p>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Build: {__COMMIT_HASH__}
          </p>
        </div>
      </div>
    </div>
  );
}
