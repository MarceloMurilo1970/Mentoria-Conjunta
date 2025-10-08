import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "installments" | null>(null);

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

  const onSubmit = async (data: InsertRegistration) => {
    setIsLoading(true);
    console.log("Form submitted:", data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPaymentMethod(data.paymentMethod as "pix" | "installments");
    setIsLoading(false);
    setIsSubmitted(true);
    onSuccess?.();
  };

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
                Sua inscrição será confirmada após o pagamento via PIX.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg space-y-3">
                <p className="font-semibold text-foreground">Dados para pagamento PIX:</p>
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
                    <span className="font-bold text-lg text-primary">R$ 6.975,00</span>
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
                Clique no botão abaixo para realizar o pagamento parcelado no cartão.
              </p>
              <Button
                onClick={() => window.location.href = "https://mpago.li/2e8FvqE"}
                size="lg"
                data-testid="button-payment"
              >
                Pagar 5x R$ 1.250,00
              </Button>
              <p className="text-sm text-muted-foreground">
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

          <div className="space-y-4">
            <Label>Forma de Pagamento *</Label>
            <div className="bg-muted/20 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                <span className="line-through">Valor normal: R$ 9.400,00</span>
              </p>
              <p className="text-sm font-semibold text-primary">
                Promoção válida até 09/10/2025
              </p>
            </div>
            
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
                      <div className="text-2xl font-bold text-primary mt-1">R$ 6.975,00</div>
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
                      <div className="text-2xl font-bold text-primary mt-1">5x R$ 1.250,00</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total: R$ 6.250,00 (sem juros)
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
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Inscrição"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Ao se inscrever, você receberá as instruções de pagamento
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
