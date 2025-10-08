import { useRef } from "react";
import Hero from "@/components/Hero";
import ProgramSection from "@/components/ProgramSection";
import RegistrationForm from "@/components/RegistrationForm";

export default function Home() {
  const registrationRef = useRef<HTMLDivElement>(null);

  const scrollToRegistration = () => {
    registrationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Hero onRegisterClick={scrollToRegistration} />
      <ProgramSection />
      
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
