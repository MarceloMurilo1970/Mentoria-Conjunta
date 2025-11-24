import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, ChevronDown, ChevronUp, Linkedin } from "lucide-react";

interface TestimonialTileProps {
  name: string;
  role: string;
  text: string;
  photo?: string;
  linkedin?: string;
  highlightPhrase?: string;
}

export default function TestimonialTile({
  name,
  role,
  text,
  photo,
  linkedin,
  highlightPhrase,
}: TestimonialTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > 300;
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderText = () => {
    if (!isLongText) {
      return <p className="italic text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>;
    }

    if (isExpanded) {
      return <p className="italic text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>;
    }

    if (highlightPhrase) {
      return (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground italic">"{highlightPhrase}"</p>
          <p className="text-sm text-muted-foreground italic">
            {text.slice(0, 150)}...
          </p>
        </div>
      );
    }

    return (
      <p className="italic text-muted-foreground leading-relaxed">
        {text.slice(0, 250)}...
      </p>
    );
  };

  return (
    <Card className="border-card-border hover-elevate h-full flex flex-col" data-testid={`testimonial-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6 pb-6 flex flex-col flex-1">
        <Quote className="w-8 h-8 text-primary mb-4" />
        
        <div className="flex-1 mb-6">
          {renderText()}
        </div>

        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-4 w-full justify-center"
            data-testid={`button-expand-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ler depoimento completo
              </>
            )}
          </Button>
        )}

        <div className="border-t border-border pt-4 flex items-center gap-4">
          <Avatar className="w-12 h-12">
            {photo && <AvatarImage src={photo} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>

          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
              data-testid={`link-linkedin-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
