import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

interface RegistrationFormProps {
  onSuccess?: () => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsertRegistration>({
    resolver: zodResolver(insertRegistrationSchema),
  });

  const onSubmit = async (data: InsertRegistration) => {
    setIsLoading(true);
    console.log("Form submitted:", data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
    onSuccess?.();
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto border-card-border" data-testid="card-success">
        <CardContent className="pt-12 pb-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Inscrição Recebida!
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Enviamos um email com o link de pagamento e instruções. 
            Sua inscrição será confirmada e a nota fiscal enviada em até 5 dias após a confirmação do pagamento.
          </p>
          <Button
            onClick={() => window.location.href = "https://mpago.li/2e8FvqE"}
            size="lg"
            data-testid="button-payment"
          >
            Realizar Pagamento
          </Button>
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
            <Label htmlFor="company">Empresa (opcional)</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="Nome da empresa"
              data-testid="input-company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo (opcional)</Label>
            <Input
              id="position"
              {...register("position")}
              placeholder="Seu cargo atual"
              data-testid="input-position"
            />
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
            Ao se inscrever, você receberá um email com o link de pagamento
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
