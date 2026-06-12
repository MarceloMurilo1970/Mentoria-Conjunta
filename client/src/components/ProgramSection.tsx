import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, Info, FileText, X } from "lucide-react";

interface SessionDetail {
  title: string;
  description: string;
  topics: { title: string; description: string }[];
  insight?: string;
  deliverables: {
    intro: string;
    items: string[];
  };
}

interface Session {
  number: number;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
}

interface Module {
  number: number;
  title: string;
  instructor: string;
  duration: string;
  sessions: Session[];
}

const modulesByTurma: Record<"segundas" | "quartas", Module[]> = {
  segundas: [
    {
      number: 1,
      title: "Transição para conselhos",
      instructor: "Marcelo Murilo",
      duration: "8H",
      sessions: [
        { number: 1, date: "10/ago", startTime: "19:00", endTime: "20:00", topic: "Definindo seu nicho e propósito" },
        { number: 2, date: "17/ago", startTime: "19:00", endTime: "20:00", topic: "Perfil de conselheiro que vende" },
        { number: 3, date: "24/ago", startTime: "19:00", endTime: "20:00", topic: "Posts que geram oportunidades" },
        { number: 4, date: "31/ago", startTime: "19:00", endTime: "20:00", topic: "Interações que multiplicam alcance" },
        { number: 5, date: "07/set", startTime: "19:00", endTime: "20:00", topic: "Conectando com quem importa" },
        { number: 6, date: "14/set", startTime: "19:00", endTime: "20:00", topic: "Vendas e eventos estratégicos" },
        { number: 7, date: "21/set", startTime: "19:00", endTime: "20:00", topic: "Aspectos práticos dos conselhos" },
        { number: 8, date: "28/set", startTime: "19:00", endTime: "20:00", topic: "Integração e planejamento futuros" },
      ]
    },
    {
      number: 2,
      title: "Criando novos conselhos",
      instructor: "Hamilton Felix",
      duration: "4H",
      sessions: [
        { number: 1, date: "05/out", startTime: "19:00", endTime: "20:00", topic: "Prospecção de empresas" },
        { number: 2, date: "05/out", startTime: "20:00", endTime: "21:00", topic: "Fechamento de Projetos" },
        { number: 3, date: "12/out", startTime: "19:00", endTime: "20:00", topic: "Implementando o Conselho" },
        { number: 4, date: "12/out", startTime: "20:00", endTime: "21:00", topic: "Evoluindo o Conselho" },
      ]
    }
  ],
  quartas: [
    {
      number: 1,
      title: "Transição para conselhos",
      instructor: "Marcelo Murilo",
      duration: "8H",
      sessions: [
        { number: 1, date: "12/ago", startTime: "19:00", endTime: "20:00", topic: "Definindo seu nicho e propósito" },
        { number: 2, date: "19/ago", startTime: "19:00", endTime: "20:00", topic: "Perfil de conselheiro que vende" },
        { number: 3, date: "26/ago", startTime: "19:00", endTime: "20:00", topic: "Posts que geram oportunidades" },
        { number: 4, date: "02/set", startTime: "19:00", endTime: "20:00", topic: "Interações que multiplicam alcance" },
        { number: 5, date: "09/set", startTime: "19:00", endTime: "20:00", topic: "Conectando com quem importa" },
        { number: 6, date: "16/set", startTime: "19:00", endTime: "20:00", topic: "Vendas e eventos estratégicos" },
        { number: 7, date: "23/set", startTime: "19:00", endTime: "20:00", topic: "Aspectos práticos dos conselhos" },
        { number: 8, date: "30/set", startTime: "19:00", endTime: "20:00", topic: "Integração e planejamento futuros" },
      ]
    },
    {
      number: 2,
      title: "Criando novos conselhos",
      instructor: "Hamilton Felix",
      duration: "4H",
      sessions: [
        { number: 1, date: "07/out", startTime: "19:00", endTime: "20:00", topic: "Prospecção de empresas" },
        { number: 2, date: "07/out", startTime: "20:00", endTime: "21:00", topic: "Fechamento de Projetos" },
        { number: 3, date: "14/out", startTime: "19:00", endTime: "20:00", topic: "Implementando o Conselho" },
        { number: 4, date: "14/out", startTime: "20:00", endTime: "21:00", topic: "Evoluindo o Conselho" },
      ]
    }
  ]
};

const sessionDetails: Record<string, SessionDetail> = {
  "1-1": {
    title: "Framework PREP-MM",
    description: "O primeiro passo: definir seu nicho, propósito, personas e dores. Estruturação do posicionamento estratégico através de quatro pilares fundamentais:",
    topics: [
      { title: "Definição estratégica", description: "Nicho, propósito, personas e suas dores específicas" },
      { title: "Propósito", description: "Clareza individual, valor diferenciado e comunicação impactante" },
      { title: "Reputação", description: "As 4 dimensões que constroem sua moeda no mercado" },
      { title: "Experiência", description: "Transformar trajetória executiva em sabedoria aplicável a conselhos" },
      { title: "Presença", description: "Influenciar sem autoridade formal" },
    ],
    deliverables: {
      intro: "Após esta sessão, você terá acesso à plataforma da mentoria, onde encontrará sempre todos os seus materiais, gravações e relatórios personalizados:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Análise completa da sua avaliação PREP-MM e do seu LinkedIn atual, com sugestões de tipos de empresas para focar, seu propósito sugerido, personas prioritárias e suas prováveis dores"
      ]
    }
  },
  "1-2": {
    title: "LinkedIn Estratégico",
    description: "Transformar seu perfil em plataforma de autoridade reconhecida:",
    topics: [
      { title: "Headline que vende", description: "Sua frase de posicionamento em 220 caracteres" },
      { title: "Sobre estratégico", description: "Estrutura Problema → Solução → Prova → Convite" },
      { title: "Experiências em CAI", description: "Contexto → Ação → Impacto (não tarefas)" },
      { title: "Curadoria de competências", description: "Skills que comunicam especialização, não generalismo" },
    ],
    insight: "80% das oportunidades de conselho começam digitalmente",
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Análise profunda do seu perfil do LinkedIn com sugestões personalizadas: sua Headline ideal, seção \"Sobre\" pronta para copiar e colar, e descrição otimizada de cada experiência, tudo alinhado ao seu propósito definido na sessão anterior"
      ]
    }
  },
  "1-3": {
    title: "Autoridade por Conteúdo",
    description: "Sistema de geração de conteúdo que constrói reputação consistente:",
    topics: [
      { title: "Arquitetura do post", description: "Hook → Contexto → Desenvolvimento → CTA" },
      { title: "Brevidade inteligente", description: "Densidade útil sem floreios" },
      { title: "Golden Hour", description: "Maximizar engajamento nos primeiros 90 minutos" },
      { title: "Algoritmo 2025", description: "Comentários longos e dwell time > curtidas e volume" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Seus prompts personalizados para gerar insights, posts e imagens para publicar, tudo alinhado ao seu propósito, personas e dores. Inclui instruções para criar sua IA personalizada usando os prompts enviados"
      ]
    }
  },
  "1-4": {
    title: "Interações que Constroem Autoridade",
    description: "O poder invisível dos comentários estratégicos:",
    topics: [
      { title: "4 camadas de profundidade", description: "Do elogio vazio à provocação elegante" },
      { title: "Visibilidade orgânica", description: "Aparecer onde o público certo já está" },
      { title: "Reconhecimento indireto", description: "Líderes notam quem contribui, não quem se autopromove" },
      { title: "Newsletters do LinkedIn", description: "Canal direto com 100% de entrega" },
    ],
    insight: "Comentar gera mais autoridade que postar",
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Seus prompts personalizados para gerar comentários em posts de terceiros, respostas aos comentários em seus posts, e insights e artigos para sua newsletter. Inclui instruções para criar sua IA personalizada"
      ]
    }
  },
  "1-5": {
    title: "Networking com Propósito",
    description: "Construir rede de influência real, não lista de contatos:",
    topics: [
      { title: "Critérios de curadoria", description: "Alinhamento de valores e proximidade temática" },
      { title: "Automação ética", description: "Consistência sem perder humanidade" },
      { title: "Interações intencionais", description: "Cada conexão fortalece sua narrativa" },
      { title: "Follow-up inteligente", description: "Transformar interações em relacionamentos" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Instruções detalhadas de como usar ferramentas para automatizar sua conexão com as personas certas e iniciar conversas estratégicas que geram oportunidades de negócio"
      ]
    }
  },
  "1-6": {
    title: "Framework 5C",
    description: "As cinco competências que definem seu valor para CEOs e fundadores:",
    topics: [
      { title: "Competência", description: "Densidade técnica como base da autoridade" },
      { title: "Caráter", description: "Confiança que antecede a técnica" },
      { title: "Contexto", description: "Interpretar antes de decidir" },
      { title: "Contribuição", description: "O que te torna indispensável na mesa" },
      { title: "Credibilidade", description: "Sua moeda definitiva no mercado" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Acesso à sua Avaliação 5C personalizada que mede suas competências atuais e estabelece um plano de trabalho completo para maximizar seus resultados como conselheiro"
      ]
    }
  },
  "1-7": {
    title: "Due Diligence e Entrada Estratégica",
    description: "A etapa crítica antes de aceitar qualquer posição em conselho:",
    topics: [
      { title: "Perguntas reveladoras", description: "As 5 perguntas para sócios e CEO que expõem maturidade real" },
      { title: "Documentação obrigatória", description: "Demonstrações financeiras, atas, mapa de riscos e plano estratégico" },
      { title: "Red flags decisivos", description: "Sinais de alerta que inviabilizam seu impacto e protegem sua reputação" },
      { title: "Blindagem contratual", description: "Cláusulas de proteção, limitação de responsabilidade e indenização" },
    ],
    insight: "Entrar no conselho errado destrói reputação, energia e credibilidade",
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Acesso à sua Avaliação de Impacto personalizada que permite medir e demonstrar aos seus contratantes como você gera valor e resultados concretos no conselho"
      ]
    }
  },
  "1-8": {
    title: "Revisão Completa do Módulo 1",
    description: "Sessão de consolidação e esclarecimento de todas as dúvidas:",
    topics: [
      { title: "Revisão completa", description: "Percorremos todo o conteúdo do Módulo 1" },
      { title: "Esclarecimento de dúvidas", description: "Espaço aberto para sanar todas as questões pendentes" },
      { title: "Ajustes finais", description: "Refinamento do seu posicionamento e materiais" },
      { title: "Preparação para o Módulo 2", description: "Transição para a fase de conquista de conselhos" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Consolidação de todos os materiais do Módulo 1 e checklist de preparação para o Módulo 2"
      ]
    }
  },
  "2-1": {
    title: "Prospecção de Empresas",
    description: "Identificar e abordar empresas com potencial real para sua atuação como conselheiro:",
    topics: [
      { title: "Mapeamento estratégico", description: "Identificar empresas alinhadas ao seu perfil e expertise" },
      { title: "Sinais de maturidade", description: "Reconhecer empresas prontas para governança estruturada" },
      { title: "Abordagem inicial", description: "Como estabelecer contato de forma profissional e assertiva" },
      { title: "Construção de pipeline", description: "Gestão sistemática de oportunidades em potencial" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Templates e frameworks para prospecção estruturada de empresas"
      ]
    }
  },
  "2-2": {
    title: "Fechamento de Projetos",
    description: "Converter oportunidades em posições concretas de conselho:",
    topics: [
      { title: "Proposta de valor", description: "Articular claramente o que você entrega como conselheiro" },
      { title: "Negociação de termos", description: "Remuneração, escopo, dedicação e expectativas mútuas" },
      { title: "Formalização", description: "Contratos, cláusulas de proteção e acordos de confidencialidade" },
      { title: "Onboarding estruturado", description: "Primeiros 90 dias para consolidar sua presença" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Modelos de proposta comercial e contratos de conselheiro"
      ]
    }
  },
  "2-3": {
    title: "Implementando o Conselho",
    description: "Estruturar e operacionalizar conselhos que geram valor real:",
    topics: [
      { title: "Estrutura de governança", description: "Regimento, rituais e documentação essencial" },
      { title: "Dinâmica de reuniões", description: "Pauta, preparação e condução de sessões produtivas" },
      { title: "Relacionamento com gestão", description: "Equilibrar governança e operação sem conflitos" },
      { title: "Geração de valor", description: "Contribuições tangíveis que justificam sua presença" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Templates de regimento interno e estrutura de reuniões de conselho"
      ]
    }
  },
  "2-4": {
    title: "Evoluindo o Conselho",
    description: "Elevar a maturidade do conselho e consolidar sua prática como conselheiro:",
    topics: [
      { title: "Avaliação de desempenho", description: "Métricas e indicadores de efetividade do conselho" },
      { title: "Evolução da governança", description: "De consultivo para deliberativo, quando e como" },
      { title: "Portfólio de conselhos", description: "Construir prática diversificada e sustentável" },
      { title: "Legado e sucessão", description: "Deixar marcas positivas e preparar transições" },
    ],
    deliverables: {
      intro: "Após esta sessão, você encontrará na plataforma:",
      items: [
        "Resumo completo da sessão, gravação e plano de ação semanal",
        "Framework de avaliação de desempenho e planejamento de portfólio de conselhos"
      ]
    }
  }
};

export default function ProgramSection() {
  const [selectedSession, setSelectedSession] = useState<{ moduleNumber: number; sessionNumber: number } | null>(null);
  const [turma, setTurma] = useState<"segundas" | "quartas">("segundas");

  const modules = modulesByTurma[turma];

  const getSessionDetail = (moduleNumber: number, sessionNumber: number): SessionDetail | null => {
    const key = `${moduleNumber}-${sessionNumber}`;
    return sessionDetails[key] || null;
  };

  const currentDetail = selectedSession ? getSessionDetail(selectedSession.moduleNumber, selectedSession.sessionNumber) : null;

  return (
    <section className="py-20 md:py-24 bg-background" id="programa">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Programa da Mentoria
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Dois módulos completos com especialistas renomados para transformar sua carreira
          </p>
          {/* Turma selector */}
          <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setTurma("segundas")}
              data-testid="button-turma-segundas"
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                turma === "segundas"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Turma 3 — Segundas-feiras
            </button>
            <button
              onClick={() => setTurma("quartas")}
              data-testid="button-turma-quartas"
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                turma === "quartas"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Turma 4 — Quartas-feiras
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {modules.map((module) => (
            <Card key={module.number} className="border-card-border" data-testid={`card-module-${module.number}`}>
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground font-mono mb-1">
                      Módulo {module.number}
                    </div>
                    <CardTitle className="text-2xl mb-2">{module.title}</CardTitle>
                    <p className="text-base text-muted-foreground">
                      {module.instructor} • {module.duration}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {module.sessions.map((session) => (
                  <div 
                    key={session.number} 
                    className="flex items-start gap-4 p-4 rounded-md bg-muted/30"
                    data-testid={`session-${module.number}-${session.number}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold font-mono">{session.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-2">{session.topic}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-mono">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono">{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedSession({ moduleNumber: module.number, sessionNumber: session.number })}
                        data-testid={`button-details-${module.number}-${session.number}`}
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Ver detalhes e entregas
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Details Modal */}
      <Dialog open={selectedSession !== null} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {currentDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{selectedSession?.sessionNumber}</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Módulo {selectedSession?.moduleNumber} • Sessão {selectedSession?.sessionNumber}
                    </div>
                    <DialogTitle className="text-xl">{currentDetail.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-base text-muted-foreground">
                  {currentDetail.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Topics */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">O que você vai aprender:</h4>
                  <ul className="space-y-3">
                    {currentDetail.topics.map((topic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <div>
                          <strong className="text-foreground">{topic.title}:</strong>{" "}
                          <span className="text-muted-foreground">{topic.description}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Insight */}
                {currentDetail.insight && (
                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                    <p className="text-sm text-muted-foreground italic">
                      "{currentDetail.insight}"
                    </p>
                  </div>
                )}

                {/* Deliverables */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">Entregas desta sessão</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{currentDetail.deliverables.intro}</p>
                  <ul className="space-y-2">
                    {currentDetail.deliverables.items.map((item, index) => (
                      <li key={index} className={`text-sm ${index === currentDetail.deliverables.items.length - 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
