import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Hero from "@/components/Hero";
import ProgramSection from "@/components/ProgramSection";
import RegistrationForm from "@/components/RegistrationForm";
import TestimonialTile from "@/components/TestimonialTile";
import rodrigoPadovezPhoto from "@assets/IMG_7578_1763994202676.jpeg";

const testimonials = [
  {
    name: "Rodrigo Padovez",
    role: "Especialista em Healthtech",
    linkedin: "https://www.linkedin.com/in/rodrigopadovez/",
    photo: rodrigoPadovezPhoto,
    text: "Quando comecei a mentoria com o Marcelo, eu já tinha 25 anos de experiência em healthtech. Mas faltava transformar tudo isso em posicionamento claro.\n\nO que mais me surpreendeu foi a precisão. Nada genérico, nada teórico. Em poucas sessões ele me ajudou a enxergar onde eu realmente gero valor e como comunicar isso sem ruído.\n\nEu cheguei achando que precisava apenas organizar meu LinkedIn. Saí com algo muito maior: clareza de nicho, propósito lapidado, narrativa estruturada e um método para gerar conteúdo que conversa exatamente com fundadores e CEOs de healthtech.\n\nFoi um processo direto, prático e orientado à execução. Implementação imediata. E isso fez toda diferença.\n\nHoje meu posicionamento está muito mais estratégico. Meu conteúdo gera conexão real com quem eu quero apoiar. E o melhor: com autenticidade.\n\nSe você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
    highlightPhrase: "Se você quer construir autoridade de um jeito sério, sem atalhos e sem fórmulas vazias, a mentoria do Marcelo entrega exatamente isso. Para mim fez toda a diferença.",
  },
  {
    name: "Maria Silva",
    role: "Conselheira Estratégica",
    text: "A mentoria me ajudou a estruturar minha comunicação e posicionamento no mercado. Em poucos meses consegui conquistar meu primeiro conselho remunerado.",
  },
  {
    name: "Carlos Eduardo",
    role: "CEO & Conselheiro",
    text: "Transformei minha experiência executiva em autoridade reconhecida. A metodologia é prática e os resultados aparecem rapidamente.",
  },
];

export default function Home() {
  const registrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <Button variant="ghost" size="sm" asChild data-testid="button-back">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Live
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero */}
      <Hero onRegisterClick={scrollToRegistration} />

      {/* About Section - A QUEM SE DESTINA */}
      <section className="py-20 md:py-24 bg-background" id="sobre">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-6">
            Para Quem é Esta Mentoria
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Esta mentoria é exclusiva para <strong className="text-foreground">Conselheiros certificados ou profissionais em transição</strong> que desejam construir autoridade genuína no mercado de governança corporativa.
            </p>
            <p>
              Se você já possui experiência executiva sólida, mas sente que falta transformar esse conhecimento em <strong className="text-foreground">posicionamento claro</strong>, <strong className="text-foreground">visibilidade estratégica</strong> e <strong className="text-foreground">oportunidades concretas</strong> em conselhos, esta mentoria foi desenhada para você.
            </p>
            
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">O que você vai conquistar:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Clareza de nicho</strong> – Identificar onde você realmente gera valor e como comunicar isso sem ruído</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Posicionamento estratégico</strong> – Construir uma narrativa autêntica que conversa com quem você quer apoiar</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Método de geração de conteúdo</strong> – Sistema prático para criar autoridade consistente no LinkedIn</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✓</span>
                  <span><strong className="text-foreground">Conexões reais</strong> – Atrair oportunidades qualificadas em conselhos de forma orgânica</span>
                </li>
              </ul>
            </div>

            <p className="pt-6">
              A metodologia é <strong className="text-foreground">100% orientada à execução</strong>. Nada de teoria genérica ou fórmulas vazias. Cada sessão entrega clareza imediata e ações práticas que você implementa durante o programa.
            </p>
            
            <div className="bg-card border border-border p-6 rounded-lg mt-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">Mentoria coletiva com acompanhamento personalizado</h4>
              <p className="text-muted-foreground">
                Embora seja uma mentoria em grupo, <strong className="text-foreground">você receberá relatórios e prompts completamente personalizados</strong> para usar no seu processo individual. Cada participante tem sua própria jornada mapeada e acompanhada de forma única.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section - O QUE VOCÊ VAI APRENDER */}
      <section className="py-20 md:py-24 bg-card" id="metodologia">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            A Jornada Completa da Mentoria
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-3xl mx-auto text-lg">
            Sete sessões estruturadas com frameworks comprovados para transformar experiência executiva em autoridade reconhecida no mercado de conselhos
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Framework PREP */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Framework PREP</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Estruturação do posicionamento estratégico através de quatro pilares fundamentais:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Propósito:</strong> Clareza individual, valor diferenciado e comunicação impactante</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Reputação:</strong> As 4 dimensões que constroem sua moeda no mercado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Experiência:</strong> Transformar trajetória executiva em sabedoria aplicável a conselhos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Presença:</strong> Influenciar sem autoridade formal</span>
                </li>
              </ul>
            </div>

            {/* LinkedIn Estratégico */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">LinkedIn Estratégico</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Transformar seu perfil em plataforma de autoridade reconhecida:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Headline que vende:</strong> Sua frase de posicionamento em 220 caracteres</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Sobre estratégico:</strong> Estrutura Problema → Solução → Prova → Convite</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Experiências em CAI:</strong> Contexto → Ação → Impacto (não tarefas)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Curadoria de competências:</strong> Skills que comunicam especialização, não generalismo</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Insight: 80% das oportunidades de conselho começam digitalmente
              </p>
            </div>

            {/* Autoridade por Conteúdo */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Autoridade por Conteúdo</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Sistema de geração de conteúdo que constrói reputação consistente:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Arquitetura do post:</strong> Hook → Contexto → Desenvolvimento → CTA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Brevidade inteligente:</strong> Densidade útil sem floreios</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Golden Hour:</strong> Maximizar engajamento nos primeiros 90 minutos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Algoritmo 2025:</strong> Comentários longos e dwell time {'>'}  curtidas e volume</span>
                </li>
              </ul>
            </div>

            {/* Comentários Estratégicos */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Interações que Constroem Autoridade</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                O poder invisível dos comentários estratégicos:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">4 camadas de profundidade:</strong> Do elogio vazio à provocação elegante</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Visibilidade orgânica:</strong> Aparecer onde o público certo já está</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Reconhecimento indireto:</strong> Líderes notam quem contribui, não quem se autopromove</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Newsletters do LinkedIn:</strong> Canal direto com 100% de entrega</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                "Comentar gera mais autoridade que postar"
              </p>
            </div>

            {/* Networking com Propósito */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">5</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Networking com Propósito</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Construir rede de influência real, não lista de contatos:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Critérios de curadoria:</strong> Alinhamento de valores e proximidade temática</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Automação ética:</strong> Consistência sem perder humanidade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Interações intencionais:</strong> Cada conexão fortalece sua narrativa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Follow-up inteligente:</strong> Transformar interações em relacionamentos</span>
                </li>
              </ul>
            </div>

            {/* Framework 5C */}
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">6</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Framework 5C</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                As cinco competências que definem seu valor para CEOs e fundadores:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Competência:</strong> Densidade técnica como base da autoridade</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Caráter:</strong> Confiança que antecede a técnica</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Contexto:</strong> Interpretar antes de decidir</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Contribuição:</strong> O que te torna indispensável na mesa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span><strong className="text-foreground">Credibilidade:</strong> Sua moeda definitiva no mercado</span>
                </li>
              </ul>
            </div>
          </div>

          {/* O que CEOs compram */}
          <div className="bg-primary/5 border-l-4 border-primary p-8 rounded-r-lg">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              O Que CEOs e Fundadores Realmente Compram
            </h3>
            <p className="text-muted-foreground mb-6">
              Decisores não contratam conselheiros por currículo. Eles compram <strong className="text-foreground">efeitos</strong>:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Redução de Risco</h4>
                <p className="text-sm text-muted-foreground">
                  Evitar prejuízos futuros vale mais que qualquer promessa
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Clareza Mental</h4>
                <p className="text-sm text-muted-foreground">
                  Organizar pensamentos e cenários complexos
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Velocidade Estratégica</h4>
                <p className="text-sm text-muted-foreground">
                  A presença certa acelera execução
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Visão Externa Qualificada</h4>
                <p className="text-sm text-muted-foreground">
                  Enxergar o que a operação não consegue ver
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Confiança Operacional</h4>
                <p className="text-sm text-muted-foreground">
                  Alguém com quem dividir conversas sensíveis
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Elevator Pitch Afiado</h4>
                <p className="text-sm text-muted-foreground">
                  30 segundos que abrem portas e 2 minutos que criam desejo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 md:py-24 bg-card" id="depoimentos">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Depoimentos de Mentorados
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Veja o que nossos mentorados têm a dizer sobre a experiência
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialTile
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                text={testimonial.text}
                photo={testimonial.photo}
                linkedin={testimonial.linkedin}
                highlightPhrase={testimonial.highlightPhrase}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Program Section */}
      <ProgramSection />
      
      {/* Registration Section */}
      <section className="py-20 md:py-24 bg-card" id="inscricao" ref={registrationRef}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <RegistrationForm />
        </div>
      </section>

      <footer className="bg-background border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Mentoria Marcelo Murilo & Hamilton Felix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
