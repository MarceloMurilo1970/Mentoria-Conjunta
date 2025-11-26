import { useState, useEffect } from "react";
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
import { Users, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import promoImage from "@assets/IMG_7577_1763994066837.jpeg";
import CountdownTimer from "@/components/CountdownTimer";

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
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const { toast } = useToast();

  // Show sticky banner when user scrolls past the hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.5; // 50% of viewport height
      setShowStickyBanner(scrollPosition > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className="min-h-screen bg-black">
        {/* Success Section */}
        <div className="flex items-center justify-center p-6 py-16">
          <Card className="max-w-2xl mx-auto bg-gray-900/50 border-gray-800" data-testid="card-success">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Inscrição Confirmada!
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Você está confirmado para o evento dia <span className="font-bold text-yellow-400">04/12 às 20h</span>
              </p>
              
              {/* WhatsApp Group - Primary CTA */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                <p className="text-white font-semibold mb-2 text-lg">
                  Próximo passo importante:
                </p>
                <p className="text-gray-300 mb-4">
                  Entre no grupo de WhatsApp para receber o link da live e participar das discussões:
                </p>
                <Button
                  onClick={() => window.open("https://chat.whatsapp.com/FytYBXUIDbDAFzcQDCQfSO?mode=hqrt3", "_blank", "noopener,noreferrer")}
                  size="lg"
                  data-testid="button-whatsapp"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Entrar no Grupo do WhatsApp
                </Button>
                <p className="text-gray-400 text-sm mt-3">
                  Link do grupo: <span className="text-green-400">chat.whatsapp.com/FytYBXUIDbDAFzcQDCQfSO</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mentoria CTA Section - High Visibility */}
        <div className="bg-gradient-to-b from-primary/20 via-primary/10 to-black py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Oportunidade Exclusiva
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quer acelerar sua jornada como Conselheiro?
            </h2>
            
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Enquanto aguarda a live, conheça nossa <span className="text-yellow-400 font-semibold">Mentoria Completa</span> para Conselheiros que desejam construir autoridade e conquistar posições em conselhos estratégicos.
            </p>

            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8 max-w-xl mx-auto">
              <h3 className="text-white font-semibold mb-3">O que você vai descobrir:</h3>
              <ul className="text-gray-300 text-left space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Metodologia completa para criar autoridade no LinkedIn</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Framework PREP-MM para posicionamento estratégico</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Estratégias de prospecção e fechamento de conselhos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Depoimentos de conselheiros que já passaram pela mentoria</span>
                </li>
              </ul>
            </div>
            
            <Link href="/mentoria">
              <Button size="lg" className="text-lg px-8 py-6 h-auto group" data-testid="button-mentorship">
                Conhecer a Mentoria Completa
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <p className="text-gray-500 text-sm mt-4">
              Turma 2: Janeiro a Março de 2026
            </p>
          </div>
        </div>
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
          <div className="inline-block bg-primary/90 backdrop-blur-sm rounded-xl p-8 mb-6 border border-primary/30">
            <p className="text-white text-4xl md:text-5xl font-bold mb-2" data-testid="event-date">
              04.12.2025
            </p>
            <p className="text-white/90 text-xl md:text-2xl" data-testid="event-time">
              Início às 20:00hs
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="mb-12">
            <CountdownTimer />
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

      {/* Sticky Banner - Always visible when scrolling */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showStickyBanner ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-gradient-to-r from-primary via-primary to-yellow-500 py-3 px-4 shadow-lg shadow-black/50">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base font-medium text-center sm:text-left">
                <span className="hidden sm:inline">Quer ir além da live? </span>
                Conheça a Mentoria Completa para Conselheiros
              </span>
            </div>
            <Link href="/mentoria">
              <Button 
                size="sm" 
                variant="secondary" 
                className="whitespace-nowrap group bg-white text-primary hover:bg-gray-100"
                data-testid="button-sticky-mentoria"
              >
                Conhecer Mentoria
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
