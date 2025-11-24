import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import promoImage from "@assets/IMG_7577_1763994066837.jpeg";

const eventFormSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  phone: z.string().min(10, "Telefone/WhatsApp é obrigatório"),
  linkedin: z.string().url("URL do LinkedIn é obrigatória"),
  hasCertification: z.enum(["sim", "nao"]),
  boardCount: z.string().min(1, "Informe quantos conselhos participa"),
  interests: z.string().min(10, "Compartilhe o que gostaria de ouvir"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

export default function EventPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      linkedin: "https://linkedin.com/in/",
      hasCertification: "nao",
      boardCount: "",
      interests: "",
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      const response = await fetch("/api/event-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao processar inscrição");
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erro ao processar inscrição",
        description: error.message || "Ocorreu um erro ao registrar sua inscrição. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl mx-auto border-card-border" data-testid="card-success">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Inscrição Confirmada!
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Você está confirmado para o evento dia <span className="font-bold text-foreground">04/12 às 20h</span>
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
              <p className="text-foreground font-semibold mb-4">
                Entre no grupo de WhatsApp para receber o link da live:
              </p>
              <Button
                onClick={() => window.open("https://chat.whatsapp.com/FytYBXUIDbDAFzcQDCQfSO?mode=hqrt3", "_blank", "noopener,noreferrer")}
                size="lg"
                data-testid="button-whatsapp"
                className="w-full sm:w-auto"
              >
                <Users className="w-5 h-5 mr-2" />
                Entrar no Grupo do WhatsApp
              </Button>
            </div>

            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground mb-4">
                Interessado na mentoria completa?
              </p>
              <Link href="/mentoria">
                <Button variant="outline" size="lg" data-testid="button-mentorship">
                  Conhecer a Mentoria
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Promo Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={promoImage}
            alt="Marcelo Murilo e Hamilton Felix"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-white/80 text-sm md:text-base tracking-widest uppercase mb-8">
            Encontro On-line
          </p>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Marcelo Murilo e Hamilton Felix vão contar sobre
          </h1>

          <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">Como criar </span>
            <span className="text-yellow-400">AUTORIDADE</span>
            <span className="text-white"> como </span>
            <span className="text-yellow-400">CONSELHEIRO</span>
          </h2>

          <p className="text-white/90 text-xl md:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            E depois construir oportunidades em empresas para conquistar sua posição em conselhos estratégicos
          </p>

          {/* Date Box - Modern Style */}
          <div className="inline-block bg-primary/90 backdrop-blur-sm rounded-xl p-8 mb-12 border border-primary/30">
            <p className="text-white text-4xl md:text-5xl font-bold mb-2" data-testid="event-date">
              04.12.2025
            </p>
            <p className="text-white/90 text-xl md:text-2xl" data-testid="event-time">
              Início às 20:00hs
            </p>
          </div>

          <p className="text-white/70 text-sm md:text-base mb-12">
            Inscreva-se no link para convite de cortesia individual
          </p>

          {/* CTA Button */}
          <a href="#inscricao">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" data-testid="button-scroll-to-form">
              Garantir Minha Vaga Gratuita
            </Button>
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-gray-950 to-black" id="inscricao">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Inscreva-se Gratuitamente
          </h2>
          <p className="text-gray-400 text-center mb-12">
            Preencha o formulário abaixo para garantir sua vaga no evento
          </p>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm" data-testid="card-registration-form">
            <CardContent className="pt-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Nome e Sobrenome *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Seu nome completo"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Celular (WhatsApp) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="(11) 98765-4321"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">LinkedIn *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://linkedin.com/in/seu-perfil"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            data-testid="input-linkedin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasCertification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Possui formação de Conselheiro? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                            data-testid="radio-certification"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="sim" className="border-gray-600 text-primary" />
                              <label htmlFor="sim" className="cursor-pointer text-gray-200">
                                Sim
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="nao" className="border-gray-600 text-primary" />
                              <label htmlFor="nao" className="cursor-pointer text-gray-200">
                                Não
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="boardCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Quantos Conselhos remunerados participa atualmente? (ex: 0, 1, 2) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0"
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            data-testid="input-board-count"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          O que desejaria ouvir neste bate-papo onde compartilharemos nossa experiência de como Criar Autoridade, Criar Oportunidades e Conquistar Conselhos? *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Compartilhe suas expectativas e interesses..."
                            className="min-h-24 resize-none bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            data-testid="textarea-interests"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-submit"
                  >
                    {form.formState.isSubmitting ? "Enviando..." : "Confirmar Inscrição Gratuita"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Seus dados serão tratados para inscrição, confirmação e comunicações sobre este evento. 
                    Você pode exercer seus direitos (acesso, correção, exclusão etc.) no e-mail hamilton@felixempresarial.com.br
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section - Mentoria */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Quer ir além?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Conheça nossa mentoria completa para Conselheiros que desejam construir autoridade e conquistar oportunidades no mercado.
          </p>
          <Link href="/mentoria">
            <Button size="lg" variant="default" className="text-lg px-8" data-testid="button-learn-more">
              Conhecer a Mentoria Completa
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
