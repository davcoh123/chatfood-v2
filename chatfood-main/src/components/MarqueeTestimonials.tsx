import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { Star } from "lucide-react";
import chefMarie from "@/assets/chef-marie.jpg";
import chefJean from "@/assets/chef-jean.jpg";
import chefAntoine from "@/assets/chef-antoine.jpg";
import chefSophie from "@/assets/chef-sophie.jpg";
import chefPierre from "@/assets/chef-pierre.jpg";
import chefCamille from "@/assets/chef-camille.jpg";
import chefLaurent from "@/assets/chef-laurent.jpg";
import chefIsabelle from "@/assets/chef-isabelle.jpg";
import chefNicolas from "@/assets/chef-nicolas.jpg";
import chefAurelie from "@/assets/chef-aurelie.jpg";
import pizzaNova from "@/assets/restaurant-pizzanova.jpg";
import artDuBurger from "@/assets/restaurant-artduburger.jpg";
const reviews = [{
  restaurant: "Pizzeria Bella Vista",
  location: "Lyon",
  body: "ChatFood a transformé notre restaurant ! Nos commandes ont doublé en 2 mois. Plus jamais de téléphone qui sonne sans arrêt.",
  img: chefMarie,
  revenue: "+120% de CA",
  stars: 5
}, {
  restaurant: "Pizza Nova",
  location: "Reims",
  body: "Très satisfait dans l'ensemble. L'IA comprend bien les commandes et est très réactive. Elle nous permet de gagner un temps précieux lors des heures de pointe.",
  img: pizzaNova,
  revenue: "",
  stars: 5
}, {
  restaurant: "Brasserie du Centre",
  location: "Lille",
  body: "Révolutionnaire ! Mes clients adorent commander via WhatsApp. Fini les malentendus au téléphone. Je recommande vivement.",
  img: chefCamille,
  revenue: "+78% satisfaction",
  stars: 5
}, {
  restaurant: "L'Art Du Burger",
  location: "Clamart",
  body: "ChatFood nous a permis de retrouver les dizaines de commandes qu'on perdait toutes les semaines pendant les heures de rush !",
  img: artDuBurger,
  revenue: "+7% de commandes",
  stars: 5
}, {
  restaurant: "Le Jardin Gourmand",
  location: "Strasbourg",
  body: "Fantastique ! ChatFood a libéré mon équipe des appels incessants. On peut enfin se concentrer sur notre passion : la cuisine.",
  img: chefIsabelle,
  revenue: "+95% productivité",
  stars: 5
}, {
  restaurant: "Pizzeria Napoli",
  location: "Nice",
  body: "Bonne solution mais il faut du temps pour bien paramétrer le menu. L'IA fait encore quelques erreurs sur les pizzas spéciales.",
  img: chefNicolas,
  revenue: "+28% ventes",
  stars: 4
}, {
  restaurant: "Le Bistrot Moderne",
  location: "Paris",
  body: "Incroyable ! Fini les erreurs de commandes et les clients qui raccrochent. ChatFood comprend parfaitement ce que veulent nos clients.",
  img: chefJean,
  revenue: "+85% commandes",
  stars: 5
}, {
  restaurant: "La Table d'Aurélie",
  location: "Bordeaux",
  body: "Pratique mais pas parfait. Certains clients préfèrent encore appeler. Il faut s'habituer à ce nouveau mode de commande.",
  img: chefAurelie,
  revenue: "+22% digital",
  stars: 3
}, {
  restaurant: "Chez Antoine",
  location: "Marseille",
  body: "Le meilleur investissement de ma carrière ! ChatFood gère tout automatiquement. Je peux enfin me concentrer sur la cuisine.",
  img: chefAntoine,
  revenue: "+95% satisfaction",
  stars: 5
}, {
  restaurant: "Crêperie Bretonne",
  location: "Rennes",
  body: "Super outil ! Mes clients commandent maintenant en 2 minutes au lieu de 10 au téléphone. Plus de stress pendant les rush.",
  img: chefSophie,
  revenue: "+67% rapidité",
  stars: 4
}];
const firstRow = reviews.slice(0, 5);
const secondRow = reviews.slice(5, 10);
const ReviewCard = ({
  img,
  restaurant,
  location,
  body,
  revenue,
  stars
}: {
  img: string;
  restaurant: string;
  location: string;
  body: string;
  revenue: string;
  stars: number;
}) => {
  return <figure className={cn("relative h-full w-64 sm:w-80 cursor-pointer overflow-hidden rounded-xl border p-4 sm:p-6", "border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 hover:shadow-lg", "transition-all duration-500 hover:scale-105")}>
      <div className="flex flex-row items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <img className="rounded-full ring-2 ring-primary/20" width="40" height="40" alt={restaurant} src={img} loading="lazy" />
        <div className="flex flex-col flex-1 min-w-0">
          <figcaption className="text-base sm:text-lg font-bold text-foreground truncate">
            {restaurant}
          </figcaption>
          <p className="text-xs text-muted-foreground truncate">{location}</p>
        </div>
        <div className="flex items-center flex-shrink-0">
          {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", i < stars ? "text-yellow-500 fill-current" : "text-gray-300")} />)}
        </div>
      </div>
      
      <blockquote className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 line-clamp-3">
        "{body}"
      </blockquote>
      
      {revenue && (
        <div className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs font-semibold w-fit">
          {revenue}
        </div>
      )}
    </figure>;
};
export function MarqueeTestimonials() {
  return <div className="py-20">
      <div className="text-center mb-16 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ils ont choisi <span className="text-primary">ChatFood</span>
        </h2>
        <p className="text-lg text-muted-foreground">Découvrez pourquoi plus de 5 restaurants nous font confiance</p>
      </div>
      
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee repeat={12} className="[--duration:100s] [--gap:1rem]">
          {firstRow.map((review, index) => <ReviewCard key={`first-${review.restaurant}-${index}`} {...review} />)}
        </Marquee>
        <Marquee reverse repeat={12} className="[--duration:100s] [--gap:1rem]">
          {secondRow.map((review, index) => <ReviewCard key={`second-${review.restaurant}-${index}`} {...review} />)}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </div>;
}