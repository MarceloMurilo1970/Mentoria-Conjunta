import { useRef } from "react";
import Hero from "@/components/Hero";
import ProgramSection from "@/components/ProgramSection";
import RegistrationForm from "@/components/RegistrationForm";
import TestimonialTile from "@/components/TestimonialTile";
import rodrigoPadovezPhoto from "@assets/IMG_7578_1763994202676.jpeg";

const testimonials = [
  {
    name: "Rodrigo Padovez",
    role: "Especialista em Healthtech",
    linkedin: "https://www.linkedin.com/in/rodrigo-padovez/",
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

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Hero onRegisterClick={scrollToRegistration} />
      <ProgramSection />
      
      {/* Testimonials Section */}
      <section className="py-20 md:py-24 bg-background" id="depoimentos">
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
