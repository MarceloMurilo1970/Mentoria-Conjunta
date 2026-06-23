import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, ChevronDown, ChevronUp, Linkedin, Play } from "lucide-react";

interface TestimonialTileProps {
  name: string;
  role: string;
  text: string;
  photo?: string;
  linkedin?: string;
  highlightPhrase?: string;
  videoUrl?: string;
  videoThumbnail?: string;
}

export default function TestimonialTile({
  name,
  role,
  text,
  photo,
  linkedin,
  highlightPhrase,
  videoUrl,
  videoThumbnail,
}: TestimonialTileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = text.length > 500;
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderText = () => {
    if (isExpanded) {
      return <p className="italic text-muted-foreground leading-relaxed whitespace-pre-line text-xs">{text}</p>;
    }

    if (highlightPhrase && isLongText) {
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-primary italic">"{highlightPhrase}"</p>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed">
            {text.slice(0, 100)}...
          </p>
        </div>
      );
    }

    if (highlightPhrase && !isLongText) {
      return (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-primary italic">"{highlightPhrase}"</p>
          <p className="text-[11px] italic text-muted-foreground leading-relaxed whitespace-pre-line">
            {text}
          </p>
        </div>
      );
    }

    if (text.length > 500) {
      return (
        <p className="text-xs italic text-muted-foreground leading-relaxed">
          {text.slice(0, 150)}...
        </p>
      );
    }

    return <p className="text-xs italic text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>;
  };

  return (
    <Card className="border-card-border hover-elevate h-full flex flex-col" data-testid={`testimonial-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-3 pb-3 px-3 flex flex-col flex-1">
        <Quote className="w-4 h-4 text-primary mb-2" />
        
        {videoUrl && (
          <div className="mb-3">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group overflow-hidden rounded-lg"
              data-testid={`link-video-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">
                {videoThumbnail ? (
                  <img
                    src={videoThumbnail}
                    alt={`${name} - Vídeo Depoimento`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span className="absolute text-5xl font-bold text-white/20">{getInitials(name)}</span>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors border-2 border-white/30 shadow-lg">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
            </a>
          </div>
        )}

        {!videoUrl && photo && (
          <div className="mb-3">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img
                src={photo}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center 10%' }}
              />
            </div>
          </div>
        )}
        
        <div className="flex-1 mb-3" data-testid={`text-${name.toLowerCase().replace(/\s+/g, '-')}`}>
          {renderText()}
        </div>

        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mb-3 w-full justify-center text-xs"
            data-testid={`button-expand-${name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Ler depoimento completo
              </>
            )}
          </Button>
        )}

        <div className="border-t border-border pt-2 flex items-center gap-2">
          <Avatar className="w-8 h-8">
            {photo && <AvatarImage src={photo} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-xs leading-tight truncate">{name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{role}</p>
          </div>

          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 shrink-0"
              data-testid={`link-linkedin-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
