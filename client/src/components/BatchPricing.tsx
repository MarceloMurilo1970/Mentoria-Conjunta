import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, CheckCircle, Sparkles, CalendarClock } from "lucide-react";

interface PriceInfo {
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
  installment10Price: number;
  installment10Total: number;
  paymentLink: string;
  paymentLink10: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CURRENT_PRICE: PriceInfo = {
  pixPrice: 9400,
  installmentPrice: 2085,
  installmentTotal: 10425,
  installment10Price: 1100,
  installment10Total: 11000,
  paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-6oGomxwm8d-10425,00",
  paymentLink10: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLUEtSQ-Ibhdhr95b-11000,00",
};

const REGISTRATION_START = new Date("2026-04-14T00:00:00-03:00");
const REGISTRATION_END = new Date("2026-05-22T23:59:59-03:00");
const MENTORIA_START = new Date("2026-05-25T19:00:00-03:00");

export function isBatchesOpen(currentDate: Date = new Date()): boolean {
  return currentDate >= REGISTRATION_START && currentDate <= REGISTRATION_END;
}

export function isBatchesComingSoon(currentDate: Date = new Date()): boolean {
  return currentDate < REGISTRATION_START;
}

export function getBatchPrices(currentDate: Date = new Date()) {
  return {
    pixPrice: CURRENT_PRICE.pixPrice,
    installmentPrice: CURRENT_PRICE.installmentPrice,
    installmentTotal: CURRENT_PRICE.installmentTotal,
    installment10Price: CURRENT_PRICE.installment10Price,
    installment10Total: CURRENT_PRICE.installment10Total,
    batchName: "Inscrição",
    paymentLink: CURRENT_PRICE.paymentLink,
    paymentLink10: CURRENT_PRICE.paymentLink10,
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
  const isOpen = isBatchesOpen(currentDate);
  const comingSoon = isBatchesComingSoon(currentDate);

  if (comingSoon) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-10 text-center">
          <CalendarClock className="w-10 h-10 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground mb-1">Inscrições em breve!</p>
          <p className="text-sm text-muted-foreground mb-6">
            A Turma 3 começa em 25 de Maio de 2026. As inscrições abrem em breve.
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
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          Turma 3 - Maio a Julho 2026
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Investimento na Sua Carreira
        </h3>
        <p className="text-muted-foreground">
          Garanta sua vaga na mentoria que transforma executivos em conselheiros
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

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  PIX
                </Badge>
                <span className="text-sm text-muted-foreground">à vista</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                R$ {formatPrice(CURRENT_PRICE.pixPrice)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  CARTÃO
                </Badge>
                <span className="text-sm text-muted-foreground">5x sem juros</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                5x R$ {formatPrice(CURRENT_PRICE.installmentPrice)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(CURRENT_PRICE.installmentTotal)}
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
                <p className="text-sm text-muted-foreground">25 de Maio de 2026 às 19h</p>
              </div>
            </div>
            <CountdownDisplay targetDate={MENTORIA_START} label="Começa em:" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
