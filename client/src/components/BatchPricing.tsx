import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, CheckCircle, CalendarClock } from "lucide-react";

export interface PriceInfo {
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
  installment10Price: number;
  installment10Total: number;
  batchName: string;
  paymentLink: string;
  paymentLink10: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FALLBACK_PRICES: PriceInfo = {
  pixPrice: 10756.65,
  installmentPrice: 2390,
  installmentTotal: 11950,
  installment10Price: 1297,
  installment10Total: 12970,
  batchName: "Inscrição",
  paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
  paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
};

const REGISTRATION_START = new Date("2026-06-02T00:00:00-03:00");
const REGISTRATION_END = new Date("2026-08-07T23:59:59-03:00");
const MENTORIA_START = new Date("2026-08-10T19:00:00-03:00");

export function isBatchesOpen(currentDate: Date = new Date()): boolean {
  return currentDate >= REGISTRATION_START && currentDate <= REGISTRATION_END;
}

export function isBatchesComingSoon(currentDate: Date = new Date()): boolean {
  return currentDate < REGISTRATION_START;
}

export function useBatchPrices(turmaId = "turma_3"): PriceInfo {
  const { data: configs = [] } = useQuery<any[]>({ queryKey: ["/api/turma-configs"] });

  const config = configs.find((c: any) => c.turmaId === turmaId);
  if (!config) return FALLBACK_PRICES;

  const batches = config.batches as any[];
  if (!batches || batches.length === 0) return FALLBACK_PRICES;

  const lastBatch = batches[batches.length - 1];
  const plans: any[] = lastBatch?.plans ?? [];

  const pixPlan = plans.find((p: any) => p.id === "pix" || p.installments === 1);
  const c5Plan = plans.find((p: any) => p.id === "installments") ?? plans.find((p: any) => p.installments === 5);
  const c10Plan = plans.find((p: any) => p.id === "installments10") ?? plans.find((p: any) => p.installments === 10);

  return {
    pixPrice: pixPlan?.totalAmount ?? FALLBACK_PRICES.pixPrice,
    installmentPrice: c5Plan ? Math.round(c5Plan.totalAmount / c5Plan.installments) : FALLBACK_PRICES.installmentPrice,
    installmentTotal: c5Plan?.totalAmount ?? FALLBACK_PRICES.installmentTotal,
    installment10Price: c10Plan ? Math.round(c10Plan.totalAmount / c10Plan.installments) : FALLBACK_PRICES.installment10Price,
    installment10Total: c10Plan?.totalAmount ?? FALLBACK_PRICES.installment10Total,
    batchName: lastBatch?.label ?? "Inscrição",
    paymentLink: c5Plan?.paymentLink || FALLBACK_PRICES.paymentLink,
    paymentLink10: c10Plan?.paymentLink || FALLBACK_PRICES.paymentLink10,
  };
}

export function getBatchPrices(currentDate: Date = new Date()): PriceInfo {
  return FALLBACK_PRICES;
}

function formatNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  turmaId?: string;
}

export default function BatchPricing({ currentDate = new Date(), turmaId = "turma_3" }: BatchPricingProps) {
  const prices = useBatchPrices(turmaId);
  const isOpen = isBatchesOpen(currentDate);
  const comingSoon = isBatchesComingSoon(currentDate);

  if (comingSoon) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-10 text-center">
          <CalendarClock className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">Inscrições em breve!</p>
          <p className="text-sm text-muted-foreground mb-6">
            As Turmas 3 e 4 começam em 10 de Agosto de 2026. As inscrições abrem em breve.
          </p>
          <CountdownDisplay targetDate={REGISTRATION_START} label="Inscrições abrem em:" />
        </CardContent>
      </Card>
    );
  }

  if (!isOpen) {
    return (
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-8 text-center">
          <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-semibold text-foreground">Inscrições encerradas</p>
          <p className="text-sm text-muted-foreground mt-2">
            As inscrições para a Turma 3 foram encerradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Investimento na Sua Carreira
        </h3>
        <p className="text-muted-foreground">
          Turma 3 esgotada! Restam poucas vagas na Turma 4 — garanta a sua agora
        </p>
      </div>

      <Card className="relative overflow-hidden border-primary border-2 shadow-lg shadow-primary/20 max-w-md mx-auto">
        <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-xs font-semibold">
          <Zap className="w-3 h-3 inline mr-1" />
          INSCRIÇÕES ABERTAS
        </div>

        <CardContent className="pt-12 pb-6 px-6">
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-primary">
              Mentoria Completa
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              12 sessões ao vivo + materiais exclusivos
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {/* PIX */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">PIX</Badge>
                  <span className="text-sm text-muted-foreground">à vista • melhor preço</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">
                R$ {formatPrice(prices.pixPrice)}
              </p>
            </div>

            {/* 5x cartão */}
            <div className="p-4 rounded-lg bg-primary/5 border border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">CARTÃO</Badge>
                  <span className="text-sm text-muted-foreground">5x</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                5x R$ {formatPrice(prices.installmentPrice)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(prices.installmentTotal)}
              </p>
            </div>

            {/* 10x cartão */}
            <div className="p-4 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">CARTÃO</Badge>
                <span className="text-sm text-muted-foreground">10x</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                10x R$ {formatPrice(prices.installment10Price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(prices.installment10Total)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <CountdownDisplay
              targetDate={REGISTRATION_END}
              label="Inscrições encerram em:"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Início da Mentoria</p>
                <p className="text-sm text-muted-foreground">10 de Agosto de 2026 às 19h</p>
              </div>
            </div>
            <CountdownDisplay targetDate={MENTORIA_START} label="Começa em:" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
