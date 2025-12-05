import { useState, useEffect, useRef } from "react";
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
  Target,
  Zap,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Lightbulb,
  Link as LinkIcon
} from "lucide-react";
import promoImage from "@assets/IMG_7577_1763994066837.jpeg";
import BatchPricing, { getBatchPrices, isBatchesOpen } from "@/components/BatchPricing";
import RegistrationForm from "@/components/RegistrationForm";
import TestimonialTile from "@/components/TestimonialTile";
import ProgramSection from "@/components/ProgramSection";

import rodrigoPadovezPhoto from "@assets/IMG_7578_1763994202676.jpeg";
import marceloMartinPhoto from "@assets/image_1764036231605.png";
import isabellaSaltonPhoto from "@assets/image_1764036258435.png";
import luizBuenoPhoto from "@assets/image_1764117861153.png";
import elizaCoralPhoto from "@assets/image_1764192966736.png";
import ronaldoCarneiroPhoto from "@assets/image_1764434298472.png";

const RECORDING_URL = "https://drive.google.com/file/d/1I5nCVGC15zKOvN1WRoP8vEjbcH5xI7Tm/view?usp=sharing";
const SUMMARY_URL = "https://docs.google.com/document/d/1PUWN0b9HszMkY45ES-uW4wLgt9P7r3s7oAu33MCdPqc/edit?usp=sharing";
const PRESENTATION_URL = "https://marcelomurilo-my.sharepoint.com/:b:/g/personal/contato_marcelomurilo_com_br/IQDclKCA-eajQ7V9_tANX-c5AWGdxvs1P8KWSUQW_zw3H6g?e=pmJcnp";

const testimonials = [
  {
    name: "Eliza Coral",
    role: "Conselheira",
    linkedin: "https://www.linkedin.com/in/elizacoral/",
    photo: elizaCoralPhoto,
    videoThumbnail: elizaCoralPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQBJLpH2UKSkTZlSmulTOJZEASSapXm0obuhEB8eOdsGqOo?e=B0gPA9",
    text: "A Mentoria do Marcelo Murilo e do Hamilton Felix superou as minhas expectativas. Com ferramentas avançadas e relatórios personalizados, em pouco tempo já tenho resultados positivos. A troca de experiências com os outros participantes também é muito rica.\n\nO que mais gostei na Mentoria foi a clareza do caminho que preciso percorrer ainda. Além disso aprendi a usar ferramentas que aceleram os resultados. Hoje sei que quanto mais cedo iniciarmos a preparação para atuação em conselhos maiores são as chances de termos sucesso como conselheiros de alto impacto. Muitas dicas valiosas, muita prática, muita troca. Vale a pena e eu recomendo.",
    highlightPhrase: "A Mentoria do Marcelo Murilo e do Hamilton Felix superou as minhas expectativas. Vale a pena e eu recomendo.",
  },
  {
    name: "Isabella Salton",
    role: "Conselheira",
    linkedin: "https://www.linkedin.com/in/isabellasalton/",
    photo: isabellaSaltonPhoto,
    videoThumbnail: isabellaSaltonPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCojSNYaH_PQbbjXCLB5Fl5AQHpESo2vdDzg7IYo4s5xCE?e=fNFfzh",
    text: "Sou Isabella Salton, conselheira e mentora especializada em apoiar empresas familiares e de médio porte a profissionalizarem sua governança e integrarem ESG como estratégia real de crescimento — sem perder a essência que as trouxe até aqui.\n\nParticipar da primeira turma de Mentoria Coletiva do Marcelo Murilo tem sido uma experiência extremamente rica.\n\nAlém de ter um formato muito dinâmico, algo que realmente me motiva — encontrei aqui um espaço seguro para aprofundar meu propósito, testar novas abordagens, aprender sobre novas ferramentas e usar tudo na prática!\n\nO trabalho é muito personalizado e com entregas de alto valor. A metodologia tem muita clareza, precisão dos conteúdos e com uma condução impecável por parte do Marcelo Murilo.\n\nIsso torna o processo leve, consistente e transformador.\n\nEsse programa me ajudou a estruturar ainda mais meu posicionamento e minha atuação como conselheira.\n\nRecomendo com entusiasmo para quem deseja evoluir de verdade, com profundidade, propósito e método.",
    highlightPhrase: "O trabalho é muito personalizado e com entregas de alto valor.",
  },
  {
    name: "Luiz Fernando Bueno",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/luiz-fernando-araújo-bueno-7300439/",
    photo: luizBuenoPhoto,
    videoThumbnail: luizBuenoPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCLXRKz11CXT4GMkGo4HcdvAXEmPYcFAuHFPGLym-rVNNU?e=GfK2JW",
    text: "Gostaria de deixar aqui o meu depoimento sobre a mentoria que estou fazendo com Hamilton Félix e Marcelo Murilo.\n\nSe você quer um caminho para vencer como conselheiro e um jeito de falar com mais gente sobre a sua trajetória, não perca a oportunidade de estar com essa dupla.\n\nSerão 10 encontros com muita teoria, mas muita prática também.\n\nMentoria coletiva, mas com foco individual através de relatórios encaminhados.\n\nHamilton e Marcelo além de muito conhecimento tem uma network invejável.\n\nLuiz Fernando de Araújo Bueno",
    highlightPhrase: "Se você quer um caminho para vencer como conselheiro e um jeito de falar com mais gente sobre a sua trajetória, não perca a oportunidade de estar com essa dupla.",
  },
  {
    name: "Marcelo Martin",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/marcelomartin-advisor/",
    photo: marceloMartinPhoto,
    videoThumbnail: marceloMartinPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQBwRkpxyyLVTb1b94nLjC-FAeraco6gQb08BILxxHxTfVw?e=amCZ7Z",
    text: "A mentoria do Marcelo Murilo traz toda sua experiência e conhecimento na trilha para orientar futuros membros de conselho a desempenhar a função de forma profissional e assertiva, com técnica e domínio dos fatores de sucesso, em complemento às suas expertises. Realmente uma oportunidade fantástica!",
    highlightPhrase: "Realmente uma oportunidade fantástica!",
  },
  {
    name: "Rodrigo Padovez",
    role: "Especialista em Healthtech",
    linkedin: "https://www.linkedin.com/in/rodrigopadovez/",
    photo: rodrigoPadovezPhoto,
    videoThumbnail: rodrigoPadovezPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQAVO4vgVbeiQqpL9H1hg2UXATnb2c7NmjoRWL6f9f3dWrQ?e=hh8RlZ",
    text: "Quando comecei a mentoria com o Marcelo, eu já tinha 25 anos de experiência em healthtech. Mas faltava transformar tudo isso em posicionamento claro.\n\nO que mais me surpreendeu foi a precisão. Nada genérico, nada teórico. Em poucas sessões ele me ajudou a enxergar onde eu realmente gero valor e como comunicar isso sem ruído.\n\nEu cheguei achando que precisava apenas organizar meu LinkedIn. Saí com algo muito maior: clareza de nicho, propósito lapidado, narrativa estruturada e um método para gerar conteúdo que conversa exatamente com fundadores e CEOs de healthtech.\n\nFoi um processo direto, prático e orientado à execução. Implementação imediata. E isso fez toda diferença.\n\nHoje meu posicionamento está muito mais estratégico. Meu conteúdo gera conexão real com quem eu quero apoiar. E o melhor: com autenticidade.\n\nSe você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
    highlightPhrase: "Se você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
  },
  {
    name: "Ronaldo Carneiro",
    role: "Conselheiro",
    linkedin: "https://www.linkedin.com/in/ronaldocarneirobr/",
    photo: ronaldoCarneiroPhoto,
    videoThumbnail: ronaldoCarneiroPhoto,
    videoUrl: "https://marcelomurilo-my.sharepoint.com/:v:/g/personal/contato_marcelomurilo_com_br/IQCIaHgiaB8YQ5zEAsGeu8LzAd-qj36gJXa9RYbXzp2hVsI?e=hxUtdy",
    text: "Por atuar em Consultoria com empresas familiares, em 2025 fui estudar governança corporativa.\n\nConheci o Marcelo Murilo, acompanhei seus posts no LinkedIn, gostei da forma que ele ensina.\n\nAlém de empresário, Marcelo atua como Conselheiro em várias empresas. Ele tem autoridade e maestria para orientar a transição para Conselhos.\n\nFiz Mentoria em grupo com MM, aprendi muito, principalmente para identificar meu propósito profissional.\n\nCada encontro, um relatório claro, objetivo e personalizado, direcionando a pessoa a se conhecer, como também compartilhar conhecimentos de forma estruturada para alcançar seu público alvo.\n\nDefinição de propósito, clareza sobre meu posicionamento, além de entender cada passo da transição de forma estruturada e prompts de IA personalizados que me ajudam muito no dia a dia, foram apenas alguns dos ganhos que obtive na Mentoria com MM.\n\nValeu muito o investimento!",
    highlightPhrase: "Valeu muito o investimento!",
  },
];

export default function EventPage() {
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const registrationRef = useRef<HTMLDivElement>(null);
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

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

          {/* CTA to continue */}
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto group" 
            onClick={scrollToRegistration}
            data-testid="button-scroll-to-mentorship"
          >
            Quero me inscrever na Mentoria
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Você se identifica com isso?
            </h2>
            <p className="text-xl text-gray-400">
              Desafios comuns de profissionais experientes na transição para conselhos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Experiência sem posicionamento</h3>
                    <p className="text-gray-400">Você tem décadas de experiência executiva, mas não sabe como transformar isso em um posicionamento claro que atraia oportunidades em conselhos.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Invisibilidade estratégica</h3>
                    <p className="text-gray-400">Seu LinkedIn parece um currículo, não uma vitrine de autoridade. CEOs e fundadores não percebem o valor que você pode agregar.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Falta de clareza de nicho</h3>
                    <p className="text-gray-400">Você atua em várias áreas, mas não consegue definir onde realmente gera valor diferenciado para empresas que buscam conselheiros.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Conteúdo sem conexão</h3>
                    <p className="text-gray-400">Você até tenta postar no LinkedIn, mas o conteúdo não gera engajamento nem atrai as pessoas certas para conversas estratégicas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Networking sem direção</h3>
                    <p className="text-gray-400">Você conhece muita gente, mas não sabe como transformar essas conexões em oportunidades reais de atuação em conselhos.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-950/20 border-red-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Não sabe por onde começar</h3>
                    <p className="text-gray-400">A transição para conselhos parece um caminho nebuloso. Você não tem um método estruturado para dar os próximos passos com confiança.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Solution Teaser */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <CheckCircle className="w-4 h-4" />
              A boa notícia
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Existe um método comprovado para resolver tudo isso
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              A Mentoria de Marcelo Murilo e Hamilton Felix já ajudou dezenas de profissionais a construírem autoridade e conquistarem posições em conselhos estratégicos.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              Resultados Reais
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O que dizem os participantes
            </h2>
            <p className="text-xl text-gray-400">
              Profissionais que já passaram pela mentoria compartilham suas experiências
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialTile
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                linkedin={testimonial.linkedin}
                photo={testimonial.photo}
                videoThumbnail={testimonial.videoThumbnail}
                videoUrl={testimonial.videoUrl}
                text={testimonial.text}
                highlightPhrase={testimonial.highlightPhrase}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Program Section */}
      <ProgramSection />

      {/* Registration Section - Prices */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-950 to-black" id="inscricao" ref={registrationRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Inscrições Abertas
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Inscreva-se na Mentoria
            </h2>
            <p className="text-xl text-gray-400">
              Janeiro a Março de 2026 - 12 sessões ao vivo com Marcelo Murilo e Hamilton Felix
            </p>
          </div>

          {/* Batch Pricing */}
          {batchesOpen && (
            <div className="mb-12">
              <BatchPricing currentDate={new Date()} />
            </div>
          )}

          {/* Registration Form */}
          {batchesOpen ? (
            <RegistrationForm priceInfo={priceInfo} />
          ) : (
            <Card className="max-w-2xl mx-auto border-gray-700 bg-gray-900/50">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Inscrições Encerradas
                </h3>
                <p className="text-gray-400">
                  O período de inscrições foi encerrado.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-black border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Mentoria Marcelo Murilo & Hamilton Felix - Todos os direitos reservados
          </p>
        </div>
      </footer>

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
            <Button 
              size="sm" 
              variant="secondary" 
              className="whitespace-nowrap group bg-white text-primary hover:bg-gray-100"
              onClick={scrollToRegistration}
              data-testid="button-sticky-inscricao"
            >
              Inscrever-se
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
