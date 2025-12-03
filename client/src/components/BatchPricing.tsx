import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, CheckCircle, Sparkles } from "lucide-react";

interface BatchInfo {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const BATCHES: BatchInfo[] = [
  {
    id: 1,
    name: "Lote 1",
    startDate: new Date("2025-12-04T20:45:00-03:00"),
    endDate: new Date("2025-12-07T23:59:59-03:00"),
    pixPrice: 8000,
    installmentPrice: 1775,
    installmentTotal: 8875,
  },
  {
    id: 2,
    name: "Lote 2",
    startDate: new Date("2025-12-08T00:00:00-03:00"),
    endDate: new Date("2025-12-31T23:59:59-03:00"),
    pixPrice: 8750,
    installmentPrice: 1930,
    installmentTotal: 9650,
  },
  {
    id: 3,
    name: "Lote 3",
    startDate: new Date("2026-01-01T00:00:00-03:00"),
    endDate: new Date("2026-01-19T19:00:00-03:00"),
    pixPrice: 9400,
    installmentPrice: 2085,
    installmentTotal: 10425,
  },
];

export function getCurrentBatch(currentDate: Date = new Date()): BatchInfo | null {
  for (const batch of BATCHES) {
    if (currentDate >= batch.startDate && currentDate <= batch.endDate) {
      return batch;
    }
  }
  return null;
}

export function isBatchesOpen(currentDate: Date = new Date()): boolean {
  const firstBatchStart = BATCHES[0].startDate;
  const lastBatchEnd = BATCHES[BATCHES.length - 1].endDate;
  return currentDate >= firstBatchStart && currentDate <= lastBatchEnd;
}

export function getBatchPrices(currentDate: Date = new Date()) {
  const batch = getCurrentBatch(currentDate);
  if (!batch) {
    return {
      pixPrice: BATCHES[BATCHES.length - 1].pixPrice,
      installmentPrice: BATCHES[BATCHES.length - 1].installmentPrice,
      installmentTotal: BATCHES[BATCHES.length - 1].installmentTotal,
      batchName: "Lote 3",
    };
  }
  return {
    pixPrice: batch.pixPrice,
    installmentPrice: batch.installmentPrice,
    installmentTotal: batch.installmentTotal,
    batchName: batch.name,
  };
}

function formatNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

function CountdownDisplay({ targetDate, label }: { targetDate: Date; label: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
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
  }, [targetDate]);

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <div className="flex justify-center gap-1">
        <div className="bg-background border border-border rounded px-2 py-1">
          <span className="text-sm font-bold text-primary font-mono">{formatNumber(timeLeft.days)}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">d</span>
        </div>
        <div className="bg-background border border-border rounded px-2 py-1">
          <span className="text-sm font-bold text-primary font-mono">{formatNumber(timeLeft.hours)}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">h</span>
        </div>
        <div className="bg-background border border-border rounded px-2 py-1">
          <span className="text-sm font-bold text-primary font-mono">{formatNumber(timeLeft.minutes)}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">m</span>
        </div>
        <div className="bg-background border border-border rounded px-2 py-1">
          <span className="text-sm font-bold text-primary font-mono">{formatNumber(timeLeft.seconds)}</span>
          <span className="text-[10px] text-muted-foreground ml-0.5">s</span>
        </div>
      </div>
    </div>
  );
}

interface BatchPricingProps {
  currentDate?: Date;
}

export default function BatchPricing({ currentDate = new Date() }: BatchPricingProps) {
  const activeBatch = getCurrentBatch(currentDate);
  const mentoriaStart = new Date("2026-01-19T19:00:00-03:00");

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Turma 2 - Janeiro a Março 2026
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Escolha o Melhor Momento para Investir
        </h3>
        <p className="text-muted-foreground">
          Quanto antes você se inscrever, menor o investimento
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {BATCHES.map((batch) => {
          const isActive = activeBatch?.id === batch.id;
          const isPast = currentDate > batch.endDate;
          const isFuture = currentDate < batch.startDate;

          return (
            <Card
              key={batch.id}
              className={`relative overflow-hidden transition-all ${
                isActive
                  ? "border-primary border-2 shadow-lg shadow-primary/20"
                  : isPast
                  ? "opacity-50 border-muted"
                  : "border-border"
              }`}
              data-testid={`batch-card-${batch.id}`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-xs font-semibold">
                  <Zap className="w-3 h-3 inline mr-1" />
                  LOTE ATIVO
                </div>
              )}
              {isPast && (
                <div className="absolute top-0 left-0 right-0 bg-muted text-muted-foreground text-center py-1 text-xs font-semibold">
                  ENCERRADO
                </div>
              )}
              {isFuture && (
                <div className="absolute top-0 left-0 right-0 bg-muted/50 text-muted-foreground text-center py-1 text-xs font-semibold">
                  EM BREVE
                </div>
              )}

              <CardContent className={`pt-10 pb-6 px-4 ${isActive ? "pt-12" : ""}`}>
                <div className="text-center mb-4">
                  <h4 className={`text-xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {batch.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {batch.startDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} até{" "}
                    {batch.endDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className={`p-3 rounded-lg ${isActive ? "bg-primary/10 border border-primary/30" : "bg-muted/30"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                        PIX
                      </Badge>
                      <span className="text-xs text-muted-foreground">à vista</span>
                    </div>
                    <p className={`text-2xl font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                      R$ {formatPrice(batch.pixPrice)}
                    </p>
                  </div>

                  <div className={`p-3 rounded-lg ${isActive ? "bg-primary/5" : "bg-muted/20"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        CARTÃO
                      </Badge>
                      <span className="text-xs text-muted-foreground">5x sem juros</span>
                    </div>
                    <p className={`text-xl font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      5x R$ {formatPrice(batch.installmentPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: R$ {formatPrice(batch.installmentTotal)}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <CountdownDisplay
                      targetDate={batch.endDate}
                      label="Este lote encerra em:"
                    />
                  </div>
                )}

                {isFuture && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <CountdownDisplay
                      targetDate={batch.startDate}
                      label="Abre em:"
                    />
                  </div>
                )}

                {isPast && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <CheckCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Lote encerrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Início da Mentoria</p>
                <p className="text-sm text-muted-foreground">19 de Janeiro de 2026 às 19h</p>
              </div>
            </div>
            <CountdownDisplay targetDate={mentoriaStart} label="Começa em:" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
