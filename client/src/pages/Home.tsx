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
    highlightPhrase: "O que mais me surpreendeu foi a precisão. Nada genérico, nada teórico.",
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
