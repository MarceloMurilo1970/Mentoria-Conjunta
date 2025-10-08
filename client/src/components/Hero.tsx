import { Button } from "@/components/ui/button";
import heroImage from "@assets/image_1759890107941.png";

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Como criar <span className="text-blue-400">autoridade</span>,<br />
          construir <span className="text-blue-400">oportunidades</span><br />
          e conquistar <span className="text-blue-400">conselhos</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-200 mb-8 font-medium">
          COM MARCELO MURILO E HAMILTON FELIX
        </p>
        
        <Button 
          size="lg"
          onClick={onRegisterClick}
          className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
          data-testid="button-register-hero"
        >
          Inscreva-se agora
        </Button>
      </div>
    </section>
  );
}
