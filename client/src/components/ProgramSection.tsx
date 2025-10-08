import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

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

const modules: Module[] = [
  {
    number: 1,
    title: "Transição para conselhos",
    instructor: "Marcelo Murilo",
    duration: "8H",
    sessions: [
      { number: 1, date: "13/out", startTime: "19:00", endTime: "20:00", topic: "Definindo seu nicho e propósito" },
      { number: 2, date: "20/out", startTime: "19:00", endTime: "20:00", topic: "Perfil de conselheiro que vende" },
      { number: 3, date: "27/out", startTime: "19:00", endTime: "20:00", topic: "Posts que geram oportunidades" },
      { number: 4, date: "03/nov", startTime: "19:00", endTime: "20:00", topic: "Interações que multiplicam alcance" },
      { number: 5, date: "10/nov", startTime: "19:00", endTime: "20:00", topic: "Conectando com quem importa" },
      { number: 6, date: "17/nov", startTime: "19:00", endTime: "20:00", topic: "Vendas e eventos estratégicos" },
      { number: 7, date: "24/nov", startTime: "19:00", endTime: "20:00", topic: "Aspectos práticos dos conselhos" },
      { number: 8, date: "01/dez", startTime: "19:00", endTime: "20:00", topic: "Integração e planejamento futuros" },
    ]
  },
  {
    number: 2,
    title: "Criando novos conselhos",
    instructor: "Hamilton Felix",
    duration: "4H",
    sessions: [
      { number: 1, date: "24/nov", startTime: "19:00", endTime: "20:00", topic: "Prospecção de empresas" },
      { number: 2, date: "24/nov", startTime: "20:00", endTime: "21:00", topic: "Fechamento de Projetos" },
      { number: 3, date: "01/dez", startTime: "19:00", endTime: "20:00", topic: "Implementando o Conselho" },
      { number: 4, date: "01/dez", startTime: "20:00", endTime: "21:00", topic: "Evoluindo o Conselho" },
    ]
  }
];

export default function ProgramSection() {
  return (
    <section className="py-20 md:py-24 bg-background" id="programa">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Programa da Mentoria
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dois módulos completos com especialistas renomados para transformar sua carreira
          </p>
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
                    className="flex items-start gap-4 p-4 rounded-md bg-muted/30 hover-elevate"
                    data-testid={`session-${module.number}-${session.number}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold font-mono">{session.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground mb-2">{session.topic}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-mono">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono">{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
