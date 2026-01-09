import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

// Lazy load below-the-fold components for better Speed Index
const MarqueeTestimonials = lazy(() =>
  import("@/components/MarqueeTestimonials").then((m) => ({ default: m.MarqueeTestimonials })),
);
import PlasmaButton from "@/components/PlasmaButton";
import PlasmaButtonAdvanced from "@/components/PlasmaButtonAdvanced";
import { AvatarCircles } from "@/components/magicui/avatar-circles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Smartphone, TrendingUp, ArrowRight, Star, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-whatsapp-restaurant.jpg";
const Index = () => {
  const benefits = [
    {
      icon: MessageCircle,
      title: "IA conversationnelle",
      description: "ChatFood comprend et répond naturellement comme un vrai serveur",
    },
    {
      icon: Clock,
      title: "Disponible 24/7",
      description: "Vos clients commandent à toute heure, même la nuit",
    },
    {
      icon: Smartphone,
      title: "Configuration express",
      description: "Opérationnel en 30 minutes, formation incluse",
    },
    {
      icon: TrendingUp,
      title: "Croissance garantie",
      description: "Augmentez vos commandes de 150% en moyenne",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-6 text-sm animate-bounce pulse-glow">🤖 IA Nouvelle Génération</Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                  ChatFood
                </span>{" "}
                révolutionne vos commandes WhatsApp
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in animation-delay-200">
                Notre assistant IA conversationnel gère intelligemment toutes vos commandes. Il comprend, conseille et
                prend les commandes comme votre meilleur serveur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in animation-delay-400">
                <Link to="/offres">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto cta-magnetic animate-glow-pulse">
                    Découvrir ChatFood
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/demo#chatfood-assistant">
                  <PlasmaButtonAdvanced className="w-full sm:w-auto h-11 px-8 hover-lift">
                    <MessageCircle className="h-4 w-4" />
                    Voir la démo
                  </PlasmaButtonAdvanced>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <AvatarCircles
                    numPeople={5}
                    avatarUrls={[
                      {
                        imageUrl:
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
                      },
                      {
                        imageUrl:
                          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
                      },
                      {
                        imageUrl:
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
                      },
                      {
                        imageUrl:
                          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face",
                      },
                    ]}
                  />
                  <span>restaurants</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                  <span>4.9/5 étoiles</span>
                </div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-3xl transform rotate-6"></div>
              <img
                src={heroImage}
                alt="WhatsApp bot pour restaurant"
                width="512"
                height="288"
                fetchPriority="high"
                className="relative z-10 rounded-2xl shadow-2xl w-full max-w-lg mx-auto hover-lift"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="text-primary">ChatFood</span> ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              L'assistant IA le plus avancé du marché, pensé par et pour les restaurateurs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all duration-500 hover:scale-105 animate-slide-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <CardHeader>
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4 animate-scale-hover" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment <span className="text-primary">ChatFood</span> transforme votre restaurant ?
            </h2>
            <p className="text-lg text-muted-foreground">En 3 étapes simples, votre restaurant devient ultra-moderne</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Configuration IA",
                description:
                  "Notre équipe configure ChatFood avec votre menu, votre style et vos spécialités en 30 minutes",
                icon: Zap,
              },
              {
                step: "02",
                title: "Lancement intelligent",
                description: "Vos clients découvrent votre nouveau serveur IA via votre numéro WhatsApp habituel",
                icon: MessageCircle,
              },
              {
                step: "03",
                title: "Croissance automatique",
                description: "ChatFood apprend de chaque interaction et optimise vos ventes 24h/24",
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-slide-up p-6 rounded-xl transition-all duration-500"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary/20 mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="py-20" />}>
            <MarqueeTestimonials />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-primary-light/5">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à découvrir <span className="text-primary">ChatFood</span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Paiement mensuel sans engagement • Installation offerte • Support expert français
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/offres">
              <Button variant="hero" size="lg" className="cta-magnetic animate-glow-pulse">
                Découvrir nos offres
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <PlasmaButtonAdvanced className="h-11 px-8 hover-lift">
                <MessageCircle className="h-4 w-4" />
                Parler à un expert
              </PlasmaButtonAdvanced>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Index;
