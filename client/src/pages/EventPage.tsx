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
import { Calendar, Clock, Users, CheckCircle, Quote, Linkedin, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const eventFormSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  phone: z.string().min(10, "Telefone/WhatsApp é obrigatório"),
  linkedin: z.string().url("URL do LinkedIn é obrigatória"),
  hasCertification: z.enum(["sim", "nao"]),
  boardCount: z.string().min(1, "Informe quantos conselhos participa"),
  interests: z.string().min(10, "Compartilhe o que gostaria de ouvir"),
});

type EventFormData = z.infer<typeof eventFormSchema>;

const testimonials = [
  {
    name: "Rodrigo Padovez",
    role: "Especialista em Healthtech",
    linkedin: "#",
    text: "Quando comecei a mentoria com o Marcelo, eu já tinha 25 anos de experiência em healthtech. Mas faltava transformar tudo isso em posicionamento claro.\n\nO que mais me surpreendeu foi a precisão. Nada genérico, nada teórico. Em poucas sessões ele me ajudou a enxergar onde eu realmente gero valor e como comunicar isso sem ruído.\n\nEu cheguei achando que precisava apenas organizar meu LinkedIn. Saí com algo muito maior: clareza de nicho, propósito lapidado, narrativa estruturada e um método para gerar conteúdo que conversa exatamente com fundadores e CEOs de healthtech.\n\nFoi um processo direto, prático e orientado à execução. Implementação imediata. E isso fez toda diferença.\n\nHoje meu posicionamento está muito mais estratégico. Meu conteúdo gera conexão real com quem eu quero apoiar. E o melhor: com autenticidade.\n\nSe você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
  },
  {
    name: "Maria Silva",
    role: "Conselheira Estratégica",
    linkedin: "#",
    text: "A mentoria me ajudou a estruturar minha comunicação e posicionamento no mercado. Em poucos meses consegui conquistar meu primeiro conselho remunerado.",
  },
  {
    name: "Carlos Eduardo",
    role: "CEO & Conselheiro",
    linkedin: "#",
    text: "Transformei minha experiência executiva em autoridade reconhecida. A metodologia é prática e os resultados aparecem rapidamente.",
  },
];

export default function EventPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      linkedin: "",
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
              <Link href="/">
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
    <div className="min-h-screen bg-background">
      <section className="relative py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Criar Autoridade, Construir Oportunidades e Conquistar Conselhos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Bate-papo online com <span className="text-primary font-semibold">Hamilton Felix</span> e <span className="text-primary font-semibold">Marcelo Murilo</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <div className="flex items-center gap-3 text-foreground" data-testid="event-date">
              <Calendar className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">04 de Dezembro de 2025</span>
            </div>
            <div className="flex items-center gap-3 text-foreground" data-testid="event-time">
              <Clock className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">20:00h (horário de Brasília)</span>
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Evento gratuito para Conselheiros (atuantes ou em transição) que buscam conhecer mais sobre como criar autoridade e conquistar oportunidades no mercado de conselhos.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Depoimentos de Mentorados
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-card-border hover-elevate" data-testid={`card-testimonial-${index}`}>
                <CardContent className="pt-6 pb-6">
                  <Quote className="w-8 h-8 text-primary mb-4" />
                  <p className="text-muted-foreground mb-6 whitespace-pre-line text-sm leading-relaxed">
                    {testimonial.text}
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                    <a
                      href={testimonial.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                    >
                      <Linkedin className="w-4 h-4" />
                      Ver perfil
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6" id="inscricao">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Inscreva-se Gratuitamente
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Preencha o formulário abaixo para garantir sua vaga no evento
          </p>

          <Card className="border-card-border" data-testid="card-registration-form">
            <CardContent className="pt-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome e Sobrenome *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Seu nome completo"
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
                        <FormLabel>Celular (WhatsApp) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="(11) 98765-4321"
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
                        <FormLabel>LinkedIn *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://linkedin.com/in/seu-perfil"
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
                        <FormLabel>Possui formação de Conselheiro? *</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                            data-testid="radio-certification"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sim" id="sim" />
                              <label htmlFor="sim" className="cursor-pointer">
                                Sim
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="nao" id="nao" />
                              <label htmlFor="nao" className="cursor-pointer">
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
                        <FormLabel>
                          Quantos Conselhos remunerados participa atualmente? (ex: 0, 1, 2) *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0"
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
                        <FormLabel>
                          O que desejaria ouvir neste bate-papo onde compartilharemos nossa experiência de como Criar Autoridade, Criar Oportunidades e Conquistar Conselhos? *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Compartilhe suas expectativas e interesses..."
                            className="min-h-24 resize-none"
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
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-submit"
                  >
                    {form.formState.isSubmitting ? "Enviando..." : "Confirmar Inscrição Gratuita"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Seus dados serão tratados para inscrição, confirmação e comunicações sobre este evento. 
                    Você pode exercer seus direitos (acesso, correção, exclusão etc.) no e-mail hamilton@felixempresarial.com.br
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-6 bg-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Quer ir além?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Conheça nossa mentoria completa para Conselheiros que desejam construir autoridade e conquistar oportunidades no mercado.
          </p>
          <Link href="/">
            <Button size="lg" variant="default" data-testid="button-learn-more">
              Conhecer a Mentoria Completa
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
