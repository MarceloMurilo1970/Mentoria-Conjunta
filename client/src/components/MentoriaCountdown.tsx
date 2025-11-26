import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles, CheckCircle, ArrowRight, Users, AlertTriangle } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface MentoriaCountdownProps {
  onCountdownEnd: () => void;
}

export default function MentoriaCountdown({ onCountdownEnd }: MentoriaCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const targetDate = new Date("2025-12-04T20:45:00-03:00");

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsEnded(true);
        onCountdownEnd();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [onCountdownEnd]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (isEnded) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Revelação Exclusiva na Live
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
          Quanto vale transformar sua carreira<br />
          <span className="text-primary">como Conselheiro?</span>
        </h2>
      </div>

      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-background via-card to-background border-primary/20">
        <CardContent className="p-8 md:p-12">
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Imagine ter clareza sobre seu propósito, um LinkedIn estratégico que atrai as empresas certas, 
                conteúdo que posiciona você como autoridade, conexões genuínas com decisores, 
                e a habilidade de avaliar cada proposta de conselho que surgir...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Definir seu propósito com o Framework PREP-MM</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">LinkedIn otimizado para atrair oportunidades</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Gerar conteúdo que fala com quem decide</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Networking estratégico com decisores</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Avaliar propostas com o Due Diligence correto</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Medir e demonstrar seu impacto no conselho</span>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-lg text-muted-foreground mb-2">
                E ainda: mapear empresas, fomentar a criação de conselhos e...
              </p>
              <p className="text-xl md:text-2xl font-semibold text-primary">
                criar uma vaga que ainda não existe!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-6">
        <p className="text-xl md:text-2xl text-foreground font-medium">
          Você já viu os depoimentos. Funciona. Todos estão satisfeitos.
        </p>
        <p className="text-2xl md:text-3xl font-bold text-primary">
          Mas quanto custa tudo isso?
        </p>
      </div>

      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-card to-yellow-500/10 border-primary/30">
        <CardContent className="p-8 md:p-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">O valor será revelado durante a live</span>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Dia 04/12 às 20:45 as inscrições serão liberadas
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
              <Users className="w-4 h-4" />
              Poucas vagas disponíveis
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Valor promocional só na live
            </div>
          </div>

          <div className="flex justify-center gap-4 md:gap-6 mb-8">
            <div className="text-center">
              <div className="bg-background border border-border rounded-lg px-4 py-3 md:px-6 md:py-4 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {formatNumber(timeLeft.days)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Dias</span>
            </div>
            <div className="text-center">
              <div className="bg-background border border-border rounded-lg px-4 py-3 md:px-6 md:py-4 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {formatNumber(timeLeft.hours)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Horas</span>
            </div>
            <div className="text-center">
              <div className="bg-background border border-border rounded-lg px-4 py-3 md:px-6 md:py-4 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {formatNumber(timeLeft.minutes)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Min</span>
            </div>
            <div className="text-center">
              <div className="bg-background border border-border rounded-lg px-4 py-3 md:px-6 md:py-4 mb-2">
                <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
                  {formatNumber(timeLeft.seconds)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wide">Seg</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Não perca a live para conhecer a condição especial de lançamento da Turma 2
          </p>

          <a href="/" className="inline-block">
            <Button size="lg" className="group">
              Garantir Minha Vaga na Live Gratuita
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
