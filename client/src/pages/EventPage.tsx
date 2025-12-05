import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PlayCircle, 
  FileText, 
  Presentation, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Calendar,
  Clock,
  Users,
  Target,
  Zap,
  Award
} from "lucide-react";
import { Link } from "wouter";
import promoImage from "@assets/IMG_7577_1763994066837.jpeg";
import BatchPricing, { getBatchPrices, isBatchesOpen } from "@/components/BatchPricing";

const RECORDING_URL = "https://drive.google.com/file/d/1I5nCVGC15zKOvN1WRoP8vEjbcH5xI7Tm/view?usp=sharing";
const SUMMARY_URL = "https://docs.google.com/document/d/1PUWN0b9HszMkY45ES-uW4wLgt9P7r3s7oAu33MCdPqc/edit?usp=sharing";
const PRESENTATION_URL = "https://marcelomurilo-my.sharepoint.com/:b:/g/personal/contato_marcelomurilo_com_br/IQDclKCA-eajQ7V9_tANX-c5AWGdxvs1P8KWSUQW_zw3H6g?e=pmJcnp";

export default function EventPage() {
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const priceInfo = getBatchPrices(new Date());
  const batchesOpen = isBatchesOpen(new Date());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight * 0.5;
      setShowStickyBanner(scrollPosition > heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Live Already Happened */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={promoImage}
            alt="Marcelo Murilo e Hamilton Felix"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
          {/* Badge - Live Already Happened */}
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-green-500/30">
            <CheckCircle className="w-4 h-4" />
            Live Realizada em 04/12/2025
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Marcelo Murilo e Hamilton Felix revelaram
          </h1>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            <span className="text-white">Como criar </span>
            <span className="text-yellow-400">AUTORIDADE</span>
            <span className="text-white"> como </span>
            <span className="text-yellow-400">CONSELHEIRO</span>
          </h2>

          <p className="text-white/90 text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed">
            E como construir oportunidades em empresas para conquistar sua posição em conselhos estratégicos
          </p>

          {/* Missed the Live? Section */}
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-gray-700 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">
              Perdeu a Live?
            </h3>
            <p className="text-gray-300 mb-6">
              Não se preocupe! Você ainda pode assistir a gravação e aprender tudo sobre a transição para conselhos.
            </p>

            {/* Resource Links */}
            <div className="grid sm:grid-cols-3 gap-4">
              <a 
                href={RECORDING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="link-recording"
              >
                <Card className="bg-primary/10 border-primary/30 hover:bg-primary/20 transition-colors h-full">
                  <CardContent className="p-5 text-center">
                    <PlayCircle className="w-10 h-10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-white font-semibold mb-1">Assistir Gravação</h4>
                    <p className="text-gray-400 text-sm">Live completa</p>
                  </CardContent>
                </Card>
              </a>

              <a 
                href={SUMMARY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="link-summary"
              >
                <Card className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 transition-colors h-full">
                  <CardContent className="p-5 text-center">
                    <FileText className="w-10 h-10 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-white font-semibold mb-1">Resumo por IA</h4>
                    <p className="text-gray-400 text-sm">Pontos principais</p>
                  </CardContent>
                </Card>
              </a>

              <a 
                href={PRESENTATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                data-testid="link-presentation"
              >
                <Card className="bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 transition-colors h-full">
                  <CardContent className="p-5 text-center">
                    <Presentation className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-white font-semibold mb-1">Apresentação</h4>
                    <p className="text-gray-400 text-sm">Slides da live</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>

          {/* CTA to Mentorship */}
          <a href="#inscricao">
            <Button size="lg" className="text-lg px-8 py-6 h-auto group" data-testid="button-scroll-to-mentorship">
              Quero me inscrever na Mentoria
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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

      {/* Mentorship Opportunity Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-primary/10 to-black" id="inscricao">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Ainda dá tempo!
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Inscreva-se na Turma 2 da Mentoria
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A mentoria que vai transformar sua carreira como Conselheiro começa em <span className="text-primary font-semibold">Janeiro de 2026</span>
            </p>
          </div>

          {/* Batch Pricing with Countdown */}
          {batchesOpen && (
            <div className="mb-16">
              <BatchPricing currentDate={new Date()} />
            </div>
          )}

          {/* Program Overview */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
              Programa Completo da Mentoria
            </h3>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Module 1 */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Módulo 1</h4>
                      <p className="text-primary text-sm">Marcelo Murilo - 8 sessões</p>
                    </div>
                  </div>
                  <h5 className="text-lg font-semibold text-white mb-4">Transição para Conselhos</h5>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>19/jan:</strong> Definindo seu nicho e propósito</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>26/jan:</strong> Perfil de conselheiro que vende</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>02/fev:</strong> Posts que geram oportunidades</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>09/fev:</strong> Interações que multiplicam alcance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>23/fev:</strong> Conectando com quem importa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>02/mar:</strong> Vendas e eventos estratégicos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>09/mar:</strong> Aspectos práticos dos conselhos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span><strong>16/mar:</strong> Integração e planejamento futuros</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Module 2 */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Módulo 2</h4>
                      <p className="text-yellow-400 text-sm">Hamilton Felix - 4 sessões</p>
                    </div>
                  </div>
                  <h5 className="text-lg font-semibold text-white mb-4">Criando Novos Conselhos</h5>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                      <span><strong>09/mar (19h):</strong> Prospecção de empresas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                      <span><strong>09/mar (20h):</strong> Fechamento de Projetos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                      <span><strong>16/mar (19h):</strong> Implementando o Conselho</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400 mt-1 flex-shrink-0" />
                      <span><strong>16/mar (20h):</strong> Evoluindo o Conselho</span>
                    </li>
                  </ul>

                  {/* Benefits */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h6 className="text-white font-semibold mb-3">O que você vai receber:</h6>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Relatórios personalizados por sessão</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Prompts de IA customizados para seu perfil</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Acesso ao grupo exclusivo de WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Gravações de todas as sessões</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/mentoria">
              <Button size="lg" className="text-lg px-10 py-7 h-auto group" data-testid="button-go-to-mentorship">
                Ver Detalhes Completos e Inscrever-se
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">
              Turma 2: Janeiro a Março de 2026
            </p>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-16 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Seus Mentores
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Marcelo Murilo</h4>
                <p className="text-primary text-sm mb-3">Especialista em Posicionamento para Conselheiros</p>
                <p className="text-gray-400 text-sm">
                  Conselheiro com experiência em múltiplas empresas, especialista em construção de autoridade e posicionamento estratégico no LinkedIn.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-yellow-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Hamilton Felix</h4>
                <p className="text-yellow-400 text-sm mb-3">Especialista em Implementação de Conselhos</p>
                <p className="text-gray-400 text-sm">
                  Expert em criar e estruturar conselhos em empresas, com vasta experiência em prospecção e fechamento de projetos de governança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-gradient-to-t from-primary/20 to-black">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Pronto para transformar sua carreira como Conselheiro?
          </h3>
          <p className="text-gray-300 mb-8">
            Junte-se à Turma 2 da mentoria e aprenda com quem já trilhou esse caminho.
          </p>
          <Link href="/mentoria">
            <Button size="lg" className="text-lg px-10 py-7 h-auto group" data-testid="button-final-cta">
              Inscrever-se Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Sticky Banner */}
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
                <span className="hidden sm:inline">Inscrições abertas! </span>
                {priceInfo.batchName} - {priceInfo.batchName === "Lote 1" ? "Melhor preço!" : "Garanta sua vaga!"}
              </span>
            </div>
            <Link href="/mentoria">
              <Button 
                size="sm" 
                variant="secondary" 
                className="whitespace-nowrap group bg-white text-primary hover:bg-gray-100"
                data-testid="button-sticky-mentoria"
              >
                Inscrever-se
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
