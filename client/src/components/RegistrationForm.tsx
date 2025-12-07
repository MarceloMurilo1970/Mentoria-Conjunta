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
  batchName: string;
  paymentLink: string;
}

interface RegistrationFormProps {
  onSuccess?: () => void;
  priceInfo?: PriceInfo;
}

const DEFAULT_PRICES: PriceInfo = {
  pixPrice: 8000,
  installmentPrice: 1775,
  installmentTotal: 8875,
  batchName: "Lote 1",
  paymentLink: "https://link.infinitepay.io/mentoriamarcelomurilo/VC1DLTUtSQ-6oGnMgu7Ax-8875,00",
};

function formatPrice(price: number): string {
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 0 });
}

export default function RegistrationForm({ onSuccess, priceInfo = DEFAULT_PRICES }: RegistrationFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "installments" | null>(null);
  const [emailError, setEmailError] = useState(false);
  const { toast } = useToast();
  
  const { pixPrice, installmentPrice, installmentTotal, batchName, paymentLink } = priceInfo;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InsertRegistration>({
    resolver: zodResolver(insertRegistrationSchema),
  });

  const selectedPayment = watch("paymentMethod");

  const registrationMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      const result = await apiRequest("POST", "/api/registrations", data);
      return result.json();
    },
    onSuccess: (data, variables) => {
      setPaymentMethod(variables.paymentMethod as "pix" | "installments");
      setIsSubmitted(true);
      onSuccess?.();
    },
    onError: (error: any, variables) => {
      const errorMessage = error.message || "Erro ao processar inscrição";
      
      if (errorMessage.startsWith("502:")) {
        setEmailError(true);
        setPaymentMethod(variables.paymentMethod as "pix" | "installments");
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
    registrationMutation.mutate(data);
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
                    <span className="font-mono text-base">17.840.516/0001-47</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Beneficiário:</span><br />
                    Opes Informática Ltda
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
          ) : (
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
                    <span className="font-mono text-base">17.840.516/0001-47</span>
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">Beneficiário:</span><br />
                    Opes Informática Ltda
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
          ) : (
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
            <Label htmlFor="cpfCnpj">CPF ou CNPJ * <span className="text-xs text-muted-foreground">(para emissão da NF)</span></Label>
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

          <div className="space-y-4">
            <Label>Forma de Pagamento * <span className="text-primary font-semibold">({batchName})</span></Label>
            
            <RadioGroup
              onValueChange={(value) => setValue("paymentMethod", value as "pix" | "installments")}
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
                      <div className="font-semibold text-foreground">Cartão de Crédito</div>
                      <div className="text-2xl font-bold text-primary mt-1">5x R$ {formatPrice(installmentPrice)},00</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total: R$ {formatPrice(installmentTotal)},00 (sem juros)
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
