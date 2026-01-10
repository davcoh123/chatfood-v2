import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const StarterPlan = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/offres" className="inline-flex items-center text-primary hover:underline mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux offres
            </Link>
            
            <div className="text-center mb-12">
              <Badge className="mb-4">Offre Gratuite</Badge>
              <h1 className="text-4xl font-bold mb-4">
                Découvrez ChatFood avec l'<span className="text-primary">Offre Gratuite</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Idéale pour découvrir ChatFood et commencer à automatiser vos commandes
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Offre Gratuite</CardTitle>
                  <CardDescription>Idéale pour découvrir ChatFood et commencer à automatiser vos commandes</CardDescription>
                  <div className="text-5xl font-bold text-primary mt-4">
                    Gratuit
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Durée ILLIMITÉE</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Installation et configuration du chatbot personnalisé selon le menu du restaurant</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Prise de commandes en temps réel avec vos clients</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Messages illimités</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Ajustements en temps réel (délais de préparation, ruptures de stock, options de livraison...)</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Multilingue</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Pas de contrôle du comportement du chatbot</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Pas d'interface Analytics</span>
                    </li>
                    <li className="flex items-center">
                      <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      <span className="text-muted-foreground">Pas de gestion des réservations (disponible avec Premium)</span>
                    </li>
                  </ul>
                  <Button variant="hero" className="w-full" asChild>
                    <a href="https://buy.stripe.com/cNibIU5F52sn9FVbOuebu00" target="_blank" rel="noopener noreferrer">
                      Commencer avec l'Offre Gratuite
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-6 w-6 text-primary mr-3" />
                      Pourquoi commencer par l'Offre Gratuite ?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      L'Offre Gratuite vous permet de découvrir la puissance de ChatFood sans engagement. 
                      C'est l'occasion parfaite de voir comment vos clients interagissent avec notre IA et 
                      de mesurer l'impact sur vos ventes.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Messages illimités pour communiquer avec vos clients</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Ajustements en temps réel de vos paramètres opérationnels</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Support multilingue pour servir tous vos clients</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm">Migration facile vers le plan Pro quand vous êtes prêt</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ce qui n'est PAS inclus</CardTitle>
                    <CardDescription>Pourquoi passer au plan Pro ?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <h4 className="font-semibold mb-3 text-muted-foreground">
                        Avec l'Offre Gratuite, vous n'aurez pas accès à :
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Contrôle du comportement du chatbot</span>
                        </li>
                        <li className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Interface Analytics complète</span>
                        </li>
                        <li className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Gestion des réservations (inclus dans Premium)</span>
                        </li>
                        <li className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Apprentissage IA avancé</span>
                        </li>
                        <li className="flex items-center text-muted-foreground">
                          <X className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Promotions ciblées</span>
                        </li>
                      </ul>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          Vous voulez voir l'exemple de l'interface Pro ?
                        </p>
                        <Link to="/offres/pro">
                          <Button variant="outline" size="sm">
                            Découvrir le plan Pro →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Questions fréquentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h4>
                        <p className="text-sm text-muted-foreground">
                          Oui, vous pouvez passer au plan Pro ou Premium à tout moment. 
                          Votre historique de conversations est conservé.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Puis-je ajouter d'autres fonctionnalités ?</h4>
                        <p className="text-sm text-muted-foreground">
                          Oui, vous pouvez passer au plan Pro pour bénéficier d'analytics complètes,
                          de promotions personnalisables et de fonctionnalités avancées.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default StarterPlan;