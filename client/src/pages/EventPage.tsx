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
  Link as LinkIcon,
  Clock
} from "lucide-react";
import promoImage from "@assets/IMG_7577_1763994066837.jpeg";
import marceloMuriloPhoto from "@assets/image_1781300100610.png";
import BatchPricing, { getBatchPrices, isBatchesOpen, isBatchesComingSoon } from "@/components/BatchPricing";
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
const PRESENTATION_URL = "https://marcelomurilo-my.sharepoint.com/:b:/g/personal/contato_marcelomurilo_com_br/IQDcqbnY9qMFQYsj_w8k5aw3ASA4EDU0IwZoAwnYItG38SM?e=4md0fE";

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
  const comingSoon = isBatchesComingSoon(new Date());

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
      {/* Hero Section - Mentoria */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={promoImage}
            alt="Marcelo Murilo e Hamilton Felix"
            className="w-full h-full object-cover object-top"
            style={{ objectPosition: "50% 15%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/80 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
          {/* Badge - Mentoria */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-yellow-400/30">
            <Sparkles className="w-4 h-4" />
            Mentoria — Turmas 3 e 4
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
            Mentoria
          </h1>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="text-white">Como criar </span>
            <span className="text-yellow-400">autoridade</span>
            <span className="text-white">, construir </span>
            <span className="text-yellow-400">oportunidades</span>
            <span className="text-white"> e conquistar </span>
            <span className="text-yellow-400">conselhos</span>
          </h2>

          <p className="text-white/80 text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
            Com Marcelo Murilo e Hamilton Felix
          </p>

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

      {/* Mentors Section */}
      <section className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Seus Mentores
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quem está por trás desta mentoria
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Uma parceria entre dois especialistas com trajetórias complementares em autoridade, governança e criação de conselhos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Marcelo Murilo */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <div className="relative h-72 overflow-hidden">
                <img
                  src={marceloMuriloPhoto}
                  alt="Marcelo Murilo"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold text-white">Marcelo Murilo</h3>
                  <p className="text-yellow-400 text-sm font-medium">VP de Inovação, Tecnologia & M&A · Conselheiro · Mentor</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-gray-300 leading-relaxed">
                  Empresário com 38 anos de carreira empreendedora, Marcelo Murilo cofundou a <strong className="text-white">Benner</strong> em 1997 — empresa com cerca de 2.000 colaboradores e atuação em software vertical para saúde, ERP, jurídico, logística e turismo. Lidera frentes de inovação, tecnologia e M&A há mais de duas décadas.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Atua como conselheiro em múltiplas organizações, apoiando sócios e executivos na estruturação de governança, estratégia e qualidade das decisões. Criador do <strong className="text-white">Framework PREP-MM</strong>, desenvolvido especificamente para transformar trajetória executiva em autoridade reconhecida no mercado de conselhos.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">TOP 3</div>
                    <div className="text-xs text-gray-400 mt-1">Conselheiro do Ano<br/>Board Academy 2023, 2024 e 2025</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">38 anos</div>
                    <div className="text-xs text-gray-400 mt-1">de carreira<br/>empreendedora</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">CCA/IBGC Certificado</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">Cambridge Judge Business School</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">Expert GLG</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">~35K seguidores LinkedIn</span>
                </div>
                <a
                  href="https://www.linkedin.com/in/marcelomurilo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  data-testid="link-marcelo-linkedin"
                >
                  <LinkIcon className="w-4 h-4" />
                  Ver perfil no LinkedIn
                </a>
              </div>
            </div>

            {/* Hamilton Felix */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary/20 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-36 h-36 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl font-bold text-primary">HF</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-bold text-white">Hamilton Felix</h3>
                  <p className="text-yellow-400 text-sm font-medium">CEO · Conselheiro · Investidor · Mentor · Palestrante</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <p className="text-gray-300 leading-relaxed">
                  Especialista em criação e estruturação de conselhos empresariais, Hamilton Felix atua como conselheiro em múltiplas organizações — entre elas Lyncros, Inesfly Brasil, SManager, SOS Docs e Qos Tecnologia — trazendo expertise em governança aplicada a PMEs e empresas em crescimento.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Membro associado da <strong className="text-white">Board Academy BR</strong> e do <strong className="text-white">IBGC</strong>, seu trabalho diferencia estratégia de tática: identifica pontos fortes, oportunidades e ajuda executivos a conquistar posições concretas em conselhos com método e consistência.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">6+</div>
                    <div className="text-xs text-gray-400 mt-1">mandatos ativos<br/>como conselheiro</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">PMEs</div>
                    <div className="text-xs text-gray-400 mt-1">foco em governança<br/>empresarial prática</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">IBGC Associado</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">Board Academy BR</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">MBA Ibmec</span>
                  <span className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full">Felix Empresarial</span>
                </div>
                <a
                  href="https://www.linkedin.com/in/hamiltonfelix2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  data-testid="link-hamilton-linkedin"
                >
                  <LinkIcon className="w-4 h-4" />
                  Ver perfil no LinkedIn
                </a>
              </div>
            </div>
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

      {/* Launch Video Section */}
      <section className="py-20 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <PlayCircle className="w-4 h-4" />
            Vídeo de Lançamento
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Assista ao vídeo completo da mentoria
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Marcelo Murilo e Hamilton Felix explicam em detalhes todo o conteúdo, a metodologia e o funcionamento da mentoria — antes de você decidir.
          </p>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PlayCircle className="w-10 h-10 text-primary" />
            </div>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Veja como a mentoria já transformou a trajetória de dezenas de conselheiros — e entenda exatamente o que você vai receber ao participar.
            </p>
            <a
              href={RECORDING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              data-testid="link-launch-video"
            >
              <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Assistir vídeo de lançamento
            </a>
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
              {batchesOpen ? 'Inscrições Abertas' : comingSoon ? 'Inscrições em Breve' : 'Inscrições Encerradas'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mentoria Turmas 4 e 5
            </h2>
            <p className="text-xl text-gray-400">
              Agosto a Outubro de 2026 — 12 sessões ao vivo com Marcelo Murilo e Hamilton Felix
            </p>
          </div>

          {/* Batch Pricing / Coming Soon */}
          <div className="mb-12">
            <BatchPricing currentDate={new Date()} />
          </div>

          {/* Registration Form */}
          {batchesOpen ? (
            <RegistrationForm priceInfo={priceInfo} />
          ) : (
            <Card className="max-w-2xl mx-auto border-gray-700 bg-gray-900/50">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {comingSoon ? 'Inscrições em breve!' : 'Inscrições Encerradas'}
                </h3>
                <p className="text-gray-400">
                  {comingSoon
                    ? 'As Turmas 4 e 5 começam em 10 de Agosto de 2026. Fique atento — as inscrições abrem em breve!'
                    : 'O período de inscrições foi encerrado.'}
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
        {batchesOpen ? (
          <div className="bg-gradient-to-r from-primary via-primary to-yellow-500 py-3 px-4 shadow-lg shadow-black/50">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium text-center sm:text-left">
                  <span className="hidden sm:inline">Inscrições abertas! </span>
                  Garanta sua vaga nas Turmas 4 e 5!
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
        ) : (
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 py-3 px-4 shadow-lg shadow-black/50">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-white">
                <Clock className="w-5 h-5 flex-shrink-0 text-yellow-400" />
                <span className="text-sm sm:text-base font-medium text-center sm:text-left">
                  {comingSoon ? 'Turmas 4 e 5 em breve — início 10/08/2026' : 'Inscrições encerradas — aguarde a próxima turma!'}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="whitespace-nowrap bg-white/10 text-white border border-white/20 hover:bg-white/20"
                onClick={scrollToRegistration}
                data-testid="button-sticky-inscricao"
              >
                Saiba mais
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
