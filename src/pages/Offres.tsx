import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PlasmaButtonAdvanced from "@/components/PlasmaButtonAdvanced";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, MessageCircle, Clock, Users, BarChart3, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const Offres = () => {
  const location = useLocation();

  // Scroll to top when arriving from another page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  const features = [{
    icon: MessageCircle,
    title: "IA conversationnelle avancée",
    description: "ChatFood comprend le langage naturel et répond comme un vrai serveur expérimenté"
  }, {
    icon: Clock,
    title: "Service non-stop",
    description: "Vos clients commandent quand ils veulent, ChatFood ne dort jamais"
  }, {
    icon: Users,
    title: "Gestion intelligente",
    description: "Traite plusieurs conversations simultanément avec une personnalité unique"
  }, {
    icon: BarChart3,
    title: "Analytics prédictifs",
    description: "ChatFood apprend des habitudes clients et suggère des améliorations"
  }];
  const plans = [{
    name: "Offre Gratuite",
    price: "Gratuit",
    description: "Durée ILLIMITÉE",
    idealFor: "Idéale pour découvrir ChatFood et commencer à automatiser vos commandes",
    features: ["Installation et configuration du chatbot personnalisé selon le menu du restaurant", "Prise de commandes en temps réel avec vos clients", "Messages illimités", "Ajustements en temps réel (délais, ruptures de stock, options de livraison...)", "Multilingue"],
    popular: false,
    slug: "starter"
  }, {
    name: "Pro",
    price: "65,90€",
    description: "Passez à la vitesse supérieure grâce à l'automatisation complète des commandes",
    idealFor: "Idéal pour les restaurants souhaitant optimiser et maîtriser la prise de commandes",
    features: ["Tout de l'Offre Gratuite", "Contrôle du comportement du chatbot (suggestions, recommandations, règles de dialogue...)", "Interface Analytics complète : suivez vos ventes et performances", "Support prioritaire"],
    popular: true,
    slug: "pro"
  }, {
    name: "Premium",
    price: "85,90€",
    description: "La solution tout-en-un pour les restaurants ambitieux et les chaînes",
    idealFor: "L'offre idéale pour maximiser votre efficacité et fidéliser vos clients",
    features: ["Tout du Plan Pro", "Gestion des réservations avec calendrier intégré", "Apprentissage IA avancé : le bot s'adapte et mémorise les commandes récurrentes", "Envoi de promotions ciblées via WhatsApp", "Paiement en ligne sans intermédiaire", "Support personnalisé par un Account manager"],
    popular: false,
    slug: "premium"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 animate-bounce pulse-glow">Solution complète</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Découvrez la puissance de
              <span className="text-primary"> ChatFood</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              L'assistant IA conversationnel qui comprend vos clients et booste vos ventes. 
              Plus intelligent qu'un humain, disponible 24h/24.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Pourquoi <span className="text-primary">ChatFood</span> ?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className="text-center hover:shadow-xl transition-all duration-500 hover:scale-105 animate-slide-in-left" style={{
            animationDelay: `${0.5 + index * 0.2}s`
          }}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4 animate-scale-hover" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Product Explanation */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-6">
                ChatFood, votre serveur IA de nouvelle génération
              </h2>
              <p className="text-lg text-muted-foreground mb-6 animate-fade-in animation-delay-200">
                ChatFood n'est pas un simple bot à commandes. C'est une IA conversationnelle 
                qui comprend, conseille et interagit naturellement avec vos clients comme 
                le ferait votre meilleur serveur.
              </p>
              <ul className="space-y-3 mb-8">
                {["Comprend les demandes complexes et les nuances du langage", "Suggest des plats selon les goûts et restrictions alimentaires", "Mémorise les préférences de chaque client régulier", "S'adapte au style et à l'ambiance de votre restaurant", "Apprend en continu pour améliorer l'expérience client"].map((item, index) => <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>)}
              </ul>
              <Link to="/demo#chatfood-assistant">
                <Button variant="hero" size="lg" className="animate-scale-hover pulse-glow">
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  Voir ChatFood en action
                </Button>
              </Link>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 transition-all duration-500 animate-fade-in animation-delay-400 hover:scale-105">
              <div className="bg-background rounded-xl p-6 shadow-xl">
                <h3 className="font-semibold mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 text-primary mr-2" />
                  Conversation avec ChatFood
                </h3>
                <div className="space-y-4 text-sm max-h-96 overflow-y-auto">
                  <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-bl-sm animate-fade-in">
                    🍕 Bonjour ! Je suis ChatFood, votre assistant personnel chez Pizza Express. 
                    Comment puis-je vous aider aujourd'hui ?
                  </div>
                  
                  <div className="bg-muted p-4 rounded-2xl rounded-br-sm ml-8 animate-fade-in animation-delay-200">
                    Salut ! J'aimerais commander quelque chose mais je sais pas trop quoi, vous avez quoi de bon ?
                  </div>
                  
                  <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-bl-sm animate-fade-in animation-delay-400">
                    Parfait ! Pour mieux vous conseiller, dites-moi : plutôt envie d'une pizza classique 
                    ou quelque chose de plus original ? Et avez-vous des restrictions alimentaires ?
                  </div>
                  
                  <div className="bg-muted p-4 rounded-2xl rounded-br-sm ml-8 animate-fade-in animation-delay-600">
                    J'aime bien les trucs originaux, et je suis végétarien
                  </div>
                  
                  <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-bl-sm animate-fade-in animation-delay-800">
                    Excellent choix ! Je vous recommande notre Pizza des Jardins : 
                    base tomate, mozzarella, légumes grillés (courgettes, aubergines, poivrons), 
                    roquette fraîche et pesto de basilic. C'est notre spécialité végé la plus populaire ! 
                    15€. Ça vous tente ?
                  </div>
                  
                  <div className="bg-muted p-4 rounded-2xl rounded-br-sm ml-8 animate-fade-in animation-delay-1000">
                    Ça a l'air délicieux ! Je prends ça. Et vous avez des desserts ?
                  </div>
                  
                  <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-bl-small animate-fade-in animation-delay-1200">
                    🍰 Parfait ! Pour les desserts, je vous suggère notre Tiramisu maison (6€) 
                    ou notre Panna Cotta aux fruits rouges (5€). Les deux sont un délice ! 
                    
                    Récap de votre commande :
                    • Pizza des Jardins - 15€
                    
                    Souhaitez-vous ajouter un dessert ?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Choisissez votre <span className="text-primary">ChatFood</span></h2>
            <p className="text-lg text-muted-foreground">
              Des plans conçus pour accompagner votre croissance avec l'IA
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => <div key={index} className={plan.popular ? "transition-transform duration-500 hover:scale-105" : ""}>
                <div className="animate-slide-up h-full" style={{
              animationDelay: `${index * 0.2}s`
            }}>
                  <Card className={`relative hover:shadow-2xl transition-all duration-500 flex flex-col h-full ${plan.popular ? 'border-primary shadow-xl ring-2 ring-primary/20' : ''}`}>
                    {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                        ⭐ Le plus demandé
                      </Badge>}
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl font-bold mb-4">{plan.name}</CardTitle>
                      
                      <div className="min-h-[80px] flex items-center justify-center mb-4">
                        <div className="text-5xl font-bold text-green-600">
                          {plan.price}
                          {plan.price !== "Gratuit" && <span className="text-lg text-muted-foreground font-normal">/mois</span>}
                        </div>
                      </div>
                      
                      <CardDescription className="text-sm mb-3 min-h-[60px] flex items-center justify-center px-2">
                        {plan.description}
                      </CardDescription>
                      
                      <p className="text-sm text-foreground min-h-[60px] flex items-center justify-center px-2">
                        {plan.idealFor}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col pt-4">
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-start">
                            <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-left">{feature}</span>
                          </li>)}
                      </ul>
                      {plan.slug === "starter" ? <Link to={`/offres/${plan.slug}`} className="block mt-auto">
                          <Button variant={plan.popular ? "hero" : "outline"} className="w-full h-11 transition-all duration-500 hover:shadow-lg hover:scale-105">
                            Découvrir {plan.name}
                          </Button>
                        </Link> : <div className="mt-auto">
                          <Badge className="w-full justify-center mb-2 bg-muted text-muted-foreground">
                            Bientôt disponible
                          </Badge>
                          <Button variant="outline" className="w-full h-11" disabled>
                            Prochainement disponible
                          </Button>
                        </div>}
                    </CardContent>
                  </Card>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à booster vos ventes avec <span className="text-primary">ChatFood</span> ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Rejoignez plus de 5 restaurants qui ont adopté l'IA conversationnelle. Découvrez ChatFood en action avec notre démo interactive.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo#chatfood-assistant">
              <Button variant="hero" size="lg" className="cta-magnetic animate-glow-pulse">
                Essayer la démo ChatFood
              </Button>
            </Link>
            <Link to="/contact">
              <PlasmaButtonAdvanced className="h-11 px-8 hover-lift">
                <HeadphonesIcon className="h-4 w-4" />
                Parler à un expert IA
              </PlasmaButtonAdvanced>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Offres;