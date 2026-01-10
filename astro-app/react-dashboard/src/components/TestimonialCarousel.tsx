import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import chefMarie from "@/assets/chef-marie.jpg";
import chefJean from "@/assets/chef-jean.jpg";
import chefAntoine from "@/assets/chef-antoine.jpg";
import chefSophie from "@/assets/chef-sophie.jpg";

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      name: "Marie Dubois",
      restaurant: "Pizzeria Bella Vista",
      location: "Lyon",
      content: "ChatFood a transformé notre restaurant ! Nos commandes ont doublé en 2 mois. Plus jamais de téléphone qui sonne sans arrêt.",
      stars: 5,
      image: chefMarie,
      revenue: "+120% de CA"
    },
    {
      name: "Jean Martin", 
      restaurant: "Le Bistrot Moderne",
      location: "Paris",
      content: "Incroyable ! Fini les erreurs de commandes et les clients qui raccrochent. ChatFood comprend parfaitement ce que veulent nos clients.",
      stars: 5,
      image: chefJean,
      revenue: "+85% de commandes"
    },
    {
      name: "Antoine Rousseau",
      restaurant: "Chez Antoine",
      location: "Marseille",
      content: "Le meilleur investissement de ma carrière ! ChatFood gère tout automatiquement. Je peux enfin me concentrer sur ma cuisine.",
      stars: 5,
      image: chefAntoine,
      revenue: "+95% satisfaction client"
    },
    {
      name: "Sophie Chen",
      restaurant: "Sushi Zen",
      location: "Nice",
      content: "ChatFood a révolutionné notre service. Nos clients adorent commander via WhatsApp. L'IA comprend même les demandes spéciales !",
      stars: 5,
      image: chefSophie,
      revenue: "+150% commandes en ligne"
    }
  ];

  useEffect(() => {
    if (!isPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ils ont choisi ChatFood
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoplay}
            className="hover:scale-105 transition-transform duration-200"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={prevTestimonial}
            className="hover:scale-105 transition-transform duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextTestimonial}
            className="hover:scale-105 transition-transform duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Card className="bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-500 border-primary/10">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{testimonial.name}</h3>
                      <p className="text-primary font-semibold">{testimonial.restaurant}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      <div className="flex items-center mt-2">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                        {testimonial.revenue}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-lg italic text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;