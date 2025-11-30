import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, Check, X, Users, Calendar, Award, MessageSquare, ExternalLink, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

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

function analyzeTopics(registrations: EventRegistration[]): TopicSuggestion[] {
  const topicPatterns: { topic: string; keywords: string[] }[] = [
    { 
      topic: "Como conseguir a primeira posição em conselho", 
      keywords: ["primeiro conselho", "primeira posição", "primeiro", "primeira", "começar", "iniciar", "entrada em conselho", "entrar em conselho"]
    },
    { 
      topic: "Construção de autoridade e posicionamento no LinkedIn", 
      keywords: ["linkedin", "autoridade", "posicionamento", "visibilidade", "marca pessoal", "personal branding", "conteúdo", "posts", "publicar", "perfil"]
    },
    { 
      topic: "Networking estratégico para conselhos", 
      keywords: ["networking", "rede de contatos", "contatos", "conexões", "relacionamento", "network"]
    },
    { 
      topic: "Transição de carreira executiva para conselheiro", 
      keywords: ["transição", "carreira", "executivo", "c-level", "ceo", "diretor", "mudança de carreira", "migrar"]
    },
    { 
      topic: "Certificações e qualificações para conselhos", 
      keywords: ["certificação", "certificado", "curso", "formação", "ibgc", "qualificação", "preparação", "capacitação"]
    },
    { 
      topic: "Remuneração e precificação de conselheiros", 
      keywords: ["remuneração", "salário", "valor", "preço", "quanto ganha", "pagamento", "honorários", "ganhar", "cobrar"]
    },
    { 
      topic: "Governança corporativa na prática", 
      keywords: ["governança", "corporativa", "compliance", "boas práticas", "gestão"]
    },
    { 
      topic: "Empresas familiares e conselhos consultivos", 
      keywords: ["familiar", "família", "consultivo", "advisory", "pme", "pequena empresa", "média empresa"]
    },
    { 
      topic: "Due diligence e avaliação de empresas", 
      keywords: ["due diligence", "avaliar empresa", "avaliação", "análise de empresa", "riscos"]
    },
    { 
      topic: "Desenvolvimento de competências de conselheiro", 
      keywords: ["competência", "habilidade", "skill", "desenvolver", "capacidade", "aprender", "soft skills"]
    },
    { 
      topic: "Uso de IA e tecnologia para conselheiros", 
      keywords: ["inteligência artificial", "tecnologia", "digital", "inovação", "prompt", "chatgpt", "automação", "gpt", "openai"]
    },
    { 
      topic: "Cases práticos e experiências reais", 
      keywords: ["case", "exemplo", "prático", "experiência real", "história", "resultado", "depoimento"]
    },
    { 
      topic: "Como criar oportunidades em conselhos", 
      keywords: ["criar oportunidade", "oportunidade", "conquistar conselho", "conseguir conselho", "acesso", "porta de entrada"]
    },
    { 
      topic: "Estratégias de prospecção e abordagem", 
      keywords: ["prospecção", "prospectar", "abordar", "abordagem", "contato inicial", "pitch", "apresentação"]
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
        if (matchingComments.length < 3) {
          matchingComments.push(`${reg.name}: "${reg.interests.substring(0, 150)}${reg.interests.length > 150 ? '...' : ''}"`);
        }
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-event-total">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Com Certificação</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-with-cert">{withCertification}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? `${Math.round((withCertification / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Sem Certificação</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-without-cert">{withoutCertification}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? `${Math.round((withoutCertification / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Posições em Conselhos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {Object.entries(boardCounts).slice(0, 4).map(([count, qty]) => (
                <div key={count} className="flex justify-between">
                  <span className="text-muted-foreground">{count}:</span>
                  <span className="font-medium">{qty}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Topic Suggestions */}
      {topicSuggestions.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Sugestões Consolidadas para a Live
            </CardTitle>
            <CardDescription>
              Temas identificados a partir dos interesses dos participantes, ordenados por relevância
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topicSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover-elevate"
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-semibold">{suggestion.topic}</h4>
                    </div>
                    <Badge className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {suggestion.count} {suggestion.count === 1 ? 'menção' : 'menções'}
                    </Badge>
                  </div>
                  
                  {suggestion.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {suggestion.keywords.slice(0, 5).map((keyword, kIndex) => (
                        <Badge key={kIndex} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {suggestion.relevantComments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Comentários relacionados:</p>
                      {suggestion.relevantComments.map((comment, cIndex) => (
                        <p key={cIndex} className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                          {comment}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Topics List */}
      {allInterests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Tópicos Individuais dos Participantes
            </CardTitle>
            <CardDescription>
              Todos os comentários dos inscritos sobre o que gostariam de ver no evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {registrations?.map((reg, index) => (
                <div key={index} className="border-l-2 border-primary pl-3 py-1">
                  <p className="font-medium text-sm">{reg.name}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reg.interests}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inscritos no Evento</CardTitle>
          <CardDescription>
            Inscrições para o evento ao vivo de 04/12/2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>Certificação</TableHead>
                    <TableHead>Conselhos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => (
                    <TableRow key={index} data-testid={`row-event-${index}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="text-sm">{reg.timestamp}</TableCell>
                      <TableCell>{reg.name}</TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell>
                        {reg.linkedin && (
                          <a 
                            href={reg.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            Perfil <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reg.hasCertification === 'Sim' ? 'default' : 'secondary'}>
                          {reg.hasCertification}
                        </Badge>
                      </TableCell>
                      <TableCell>{reg.boardCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MentorshipRegistrationsSection() {
  const { toast } = useToast();

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

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a inscrição de "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePayment = (id: string, currentStatus: boolean) => {
    paymentMutation.mutate({ id, received: !currentStatus });
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Total de Inscritos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mentorship-total">{totalCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Pagamentos Confirmados</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-paid">{paidCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? `${Math.round((paidCount / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Aguardando Pagamento</CardTitle>
            <X className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending">{totalCount - paidCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0 ? `${Math.round(((totalCount - paidCount) / totalCount) * 100)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">Formas de Pagamento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PIX:</span>
                <span className="font-medium">{pixCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parcelado:</span>
                <span className="font-medium">{installmentsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inscrições da Mentoria - Turma 2</CardTitle>
          <CardDescription>
            Janeiro a Março 2026 - Marcelo Murilo & Hamilton Felix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>Data de Inscrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, index) => (
                    <TableRow key={reg.id} data-testid={`row-registration-${index}`}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{reg.name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={reg.paymentMethod === 'pix' ? 'default' : 'secondary'}
                          data-testid={`badge-payment-${index}`}
                        >
                          {reg.paymentMethod === 'pix' 
                            ? 'PIX (R$ 8.000)' 
                            : '5x R$ 1.750 (Cartão)'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={reg.paymentReceived ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePayment(reg.id, reg.paymentReceived)}
                          disabled={paymentMutation.isPending}
                          data-testid={`button-payment-${index}`}
                          className={reg.paymentReceived 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
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
                      </TableCell>
                      <TableCell>
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
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma inscrição registrada ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Mentoria Marcelo Murilo & Hamilton Felix</p>
      </div>

      <Tabs defaultValue="event" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="event" data-testid="tab-event">
            <Calendar className="w-4 h-4 mr-2" />
            Evento ao Vivo
          </TabsTrigger>
          <TabsTrigger value="mentorship" data-testid="tab-mentorship">
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
  );
}
