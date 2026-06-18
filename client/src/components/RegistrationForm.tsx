import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, CreditCard, Banknote, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PriceInfo {
  pixPrice: number;
  installmentPrice: number;
  installmentTotal: number;
  installment10Price: number;
  installment10Total: number;
  batchName: string;
  paymentLink: string;
  paymentLink10: string;
}

interface RegistrationFormProps {
  onSuccess?: () => void;
  priceInfo?: PriceInfo;
  defaultTurma?: "turma_3" | "turma_4";
  onTurmaChange?: (turma: "turma_3" | "turma_4") => void;
}

const DEFAULT_PRICES: PriceInfo = {
  pixPrice: 9400,
  installmentPrice: 2085,
  installmentTotal: 10425,
  installment10Price: 1100,
  installment10Total: 11000,
  batchName: "Lote 3",
  paymentLink: "https://link.infinitepay.io/mentoria-mm/VC1DLTUtSQ-WOHFgM1mHD-11950,00",
  paymentLink10: "https://link.infinitepay.io/mentoria-mm/VC1DLUEtSQ-Z62S8A2tl5-12970,00",
};

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export default function RegistrationForm({ onSuccess, priceInfo = DEFAULT_PRICES, defaultTurma, onTurmaChange }: RegistrationFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "installments" | "installments10" | null>(null);
  const [emailError, setEmailError] = useState(false);
  const { toast } = useToast();
  
  const { pixPrice, installmentPrice, installmentTotal, installment10Price, installment10Total, batchName, paymentLink, paymentLink10 } = priceInfo;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InsertRegistration>({
    resolver: zodResolver(insertRegistrationSchema),
    defaultValues: defaultTurma ? { turma: defaultTurma } : undefined,
  });

  const selectedPayment = watch("paymentMethod");
  const cpfCnpjValue = watch("cpfCnpj");
  
  // Check if it's a CNPJ (14+ digits after removing formatting)
  const isCnpj = (cpfCnpjValue?.replace(/\D/g, '') || '').length >= 14;

  const registrationMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      const result = await apiRequest("POST", "/api/registrations", data);
      return result.json();
    },
    onSuccess: (data, variables) => {
      setPaymentMethod(variables.paymentMethod as "pix" | "installments" | "installments10");
      setIsSubmitted(true);
      onSuccess?.();
    },
    onError: (error: any, variables) => {
      const errorMessage = error.message || "Erro ao processar inscrição";
      
      if (errorMessage.startsWith("502:")) {
        setEmailError(true);
        setPaymentMethod(variables.paymentMethod as "pix" | "installments" | "installments10");
        setIsSubmitted(true);
      } else {
        toast({
          title: "Erro ao processar inscrição",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: InsertRegistration) => {
    // Always set batch to 3 (current batch)
    registrationMutation.mutate({ ...data, batch: 3 });
  };

  if (isSubmitted && emailError && paymentMethod) {
    return (
      <Card className="max-w-2xl mx-auto border-card-border" data-testid="card-email-error">
        <CardContent className="pt-12 pb-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
            Inscrição Registrada
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-center">
            Sua inscrição foi registrada com sucesso! O email de confirmação pode ter falhado, mas aqui estão suas instruções de pagamento:
          </p>
          
          {paymentMethod === "pix" ? (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="bg-muted/30 p-6 rounded-lg space-y-3">
                <p className="font-semibold text-foreground">Dados para pagamento PIX ({batchName}):</p>
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Chave PIX (CNPJ):</span><br />
                    <span className="font-mono text-base">66.142.918/0001-83</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Beneficiário:</span><br />
                    Mentoria MM Treinamentos Ltda
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Valor:</span><br />
                    <span className="font-bold text-lg text-primary">R$ {formatPrice(pixPrice)},00</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                A nota fiscal será enviada em até 5 dias após a confirmação do pagamento.
              </p>
            </div>
          ) : paymentMethod === "installments" ? (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <Button
                onClick={() => window.open(paymentLink, "_blank", "noopener,noreferrer")}
                size="lg"
                data-testid="button-payment"
              >
                Pagar 5x R$ {formatPrice(installmentPrice)},00
              </Button>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(installmentTotal)},00<br />
                Sua inscrição será confirmada após a aprovação do pagamento.<br />
                A nota fiscal será enviada em até 5 dias após a confirmação.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <Button
                onClick={() => window.open(paymentLink10, "_blank", "noopener,noreferrer")}
                size="lg"
                data-testid="button-payment-10x"
              >
                Pagar 10x R$ {formatPrice(installment10Price)},00
              </Button>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(installment10Total)},00<br />
                Sua inscrição será confirmada após a aprovação do pagamento.<br />
                A nota fiscal será enviada em até 5 dias após a confirmação.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isSubmitted && paymentMethod) {
    return (
      <Card className="max-w-2xl mx-auto border-card-border" data-testid="card-success">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Inscrição Recebida!
          </h3>
          
          {paymentMethod === "pix" ? (
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-muted-foreground">
                Enviamos um email com as instruções de pagamento via PIX.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg space-y-3">
                <p className="font-semibold text-foreground">Dados para pagamento PIX ({batchName}):</p>
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Chave PIX (CNPJ):</span><br />
                    <span className="font-mono text-base">66.142.918/0001-83</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Beneficiário:</span><br />
                    Mentoria MM Treinamentos Ltda
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Valor:</span><br />
                    <span className="font-bold text-lg text-primary">R$ {formatPrice(pixPrice)},00</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                A nota fiscal será enviada em até 5 dias após a confirmação do pagamento.
              </p>
            </div>
          ) : paymentMethod === "installments" ? (
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-muted-foreground mb-6">
                Enviamos um email com o link de pagamento. Clique no botão abaixo para pagar parcelado no cartão.
              </p>
              <Button
                onClick={() => window.open(paymentLink, "_blank", "noopener,noreferrer")}
                size="lg"
                data-testid="button-payment"
              >
                Pagar 5x R$ {formatPrice(installmentPrice)},00
              </Button>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(installmentTotal)},00<br />
                Sua inscrição será confirmada após a aprovação do pagamento.<br />
                A nota fiscal será enviada em até 5 dias após a confirmação.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto">
              <p className="text-muted-foreground mb-6">
                Enviamos um email com o link de pagamento. Clique no botão abaixo para pagar parcelado no cartão.
              </p>
              <Button
                onClick={() => window.open(paymentLink10, "_blank", "noopener,noreferrer")}
                size="lg"
                data-testid="button-payment-10x"
              >
                Pagar 10x R$ {formatPrice(installment10Price)},00
              </Button>
              <p className="text-sm text-muted-foreground">
                Total: R$ {formatPrice(installment10Total)},00<br />
                Sua inscrição será confirmada após a aprovação do pagamento.<br />
                A nota fiscal será enviada em até 5 dias após a confirmação.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-card-border" data-testid="card-registration-form">
      <CardHeader>
        <CardTitle className="text-2xl">Formulário de Inscrição</CardTitle>
        <CardDescription>
          Preencha seus dados para garantir sua vaga na mentoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Seu nome completo"
              data-testid="input-name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="seu@email.com"
              data-testid="input-email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(11) 99999-9999"
              data-testid="input-phone"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
            <Input
              id="cpfCnpj"
              {...register("cpfCnpj")}
              placeholder="000.000.000-00 ou 00.000.000/0001-00"
              data-testid="input-cpf-cnpj"
              className={errors.cpfCnpj ? "border-destructive" : ""}
            />
            {errors.cpfCnpj && (
              <p className="text-sm text-destructive">{errors.cpfCnpj.message}</p>
            )}
          </div>

          {isCnpj && (
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social *</Label>
              <Input
                id="razaoSocial"
                {...register("razaoSocial")}
                placeholder="Nome da empresa"
                data-testid="input-razao-social"
                className={errors.razaoSocial ? "border-destructive" : ""}
              />
              {errors.razaoSocial && (
                <p className="text-sm text-destructive">{errors.razaoSocial.message}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Label>Turma *</Label>
            <RadioGroup
              defaultValue={defaultTurma}
              onValueChange={(value) => {
                setValue("turma", value as "turma_3" | "turma_4");
                onTurmaChange?.(value as "turma_3" | "turma_4");
              }}
              className="space-y-3"
            >
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${watch("turma") === "turma_3" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}>
                <RadioGroupItem value="turma_3" id="turma_3" data-testid="radio-turma3" />
                <Label htmlFor="turma_3" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-foreground">Turma 3 — Segundas-feiras</div>
                  <div className="text-sm text-muted-foreground mt-1">Início: 11 de Agosto de 2026 • 19h</div>
                </Label>
              </div>
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${watch("turma") === "turma_4" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}>
                <RadioGroupItem value="turma_4" id="turma_4" data-testid="radio-turma4" />
                <Label htmlFor="turma_4" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-foreground">Turma 4 — Quartas-feiras</div>
                  <div className="text-sm text-muted-foreground mt-1">Início: 13 de Agosto de 2026 • 19h</div>
                </Label>
              </div>
            </RadioGroup>
            {errors.turma && (
              <p className="text-sm text-destructive">{errors.turma.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Forma de Pagamento * <span className="text-primary font-semibold">({batchName})</span></Label>
            
            <RadioGroup
              onValueChange={(value) => setValue("paymentMethod", value as "pix" | "installments" | "installments10")}
              className="space-y-3"
            >
              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${selectedPayment === "pix" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}>
                <RadioGroupItem value="pix" id="pix" data-testid="radio-pix" />
                <Label htmlFor="pix" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Banknote className="w-5 h-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">PIX à vista</div>
                      <div className="text-2xl font-bold text-primary mt-1">R$ {formatPrice(pixPrice)},00</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Pagamento instantâneo via PIX
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${selectedPayment === "installments" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}>
                <RadioGroupItem value="installments" id="installments" data-testid="radio-installments" />
                <Label htmlFor="installments" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Cartão 5x</div>
                      <div className="text-2xl font-bold text-primary mt-1">5x R$ {formatPrice(installmentPrice)},00</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total: R$ {formatPrice(installmentTotal)},00 (sem juros)
                      </div>
                    </div>
                  </div>
                </Label>
              </div>

              <div className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${selectedPayment === "installments10" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}>
                <RadioGroupItem value="installments10" id="installments10" data-testid="radio-installments10" />
                <Label htmlFor="installments10" className="flex-1 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Cartão 10x</div>
                      <div className="text-2xl font-bold text-primary mt-1">10x R$ {formatPrice(installment10Price)},00</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total: R$ {formatPrice(installment10Total)},00 (sem juros)
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={registrationMutation.isPending}
            data-testid="button-submit"
          >
            {registrationMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Inscrição"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Ao se inscrever, você receberá as instruções de pagamento por email
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
