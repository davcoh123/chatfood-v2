import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar, BarChart3, Megaphone, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const ProPlan = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/offres" className="inline-flex items-center text-primary hover:underline mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux offres
            </Link>
            
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary">⭐ Le plus populaire</Badge>
              <h1 className="text-4xl font-bold mb-4">
                Plan <span className="text-primary">Pro</span> : Passez à la vitesse supérieure
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Idéal pour les restaurants souhaitant optimiser et maîtriser la prise de commandes
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <Card className="sticky top-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Plan Pro</CardTitle>
                  <CardDescription>Passez à la vitesse supérieure grâce à l'automatisation complète</CardDescription>
                  <div className="text-5xl font-bold text-primary mt-4">
                    65,90€
                    <span className="text-lg text-muted-foreground font-normal">/mois</span>
                  </div>
                  <Badge className="mt-4 bg-muted text-muted-foreground">Bientôt disponible</Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Tout de l'Offre Gratuite</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Contrôle du comportement du chatbot : définissez ce que le bot peut dire ou proposer</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Interface Analytics complète : suivez vos ventes et performances</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Support prioritaire</span>
                    </li>
                  </ul>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Le plan Pro est actuellement en développement. Nous travaillons activement pour le rendre disponible très prochainement.
                    </p>
                    <Link to="/offres/starter">
                      <Button variant="outline" className="w-full">
                        Commencer avec Starter
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">


                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-6 w-6 text-primary mr-3" />
                      Interface Analytics Complète
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Visualisez en temps réel l'impact de ChatFood sur votre business :
                    </p>
                    <div className="bg-muted/30 rounded-lg p-6">
                      <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">+34%</div>
                          <div className="text-sm text-muted-foreground">Panier moyen</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">89%</div>
                          <div className="text-sm text-muted-foreground">Taux de conversion</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">2.3min</div>
                          <div className="text-sm text-muted-foreground">Temps de commande</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-6 w-6 text-primary mr-3" />
                      Contrôle du Comportement du Chatbot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Définissez précisément ce que le chatbot peut dire ou proposer. Personnalisez les suggestions automatiques, 
                        les recommandations de plats et créez vos propres règles de dialogue.
                      </p>
                      
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Exemples de contrôles :</h5>
                        <p className="text-sm text-muted-foreground italic">
                          "Toujours proposer une boisson avec les pizzas", "Suggérer le tiramisu après un plat italien", 
                          "Ne jamais proposer de produits contenant du porc"
                        </p>
                      </div>
                      
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Définir les suggestions automatiques</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Paramétrer les recommandations de plats</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Créer des règles de dialogue personnalisées</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Adapter le ton et le style du bot à votre restaurant</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Prêt à faire passer votre restaurant au niveau supérieur ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Rejoignez les restaurants qui ont choisi l'intelligence artificielle 
                pour automatiser leurs ventes et fidéliser leurs clients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/offres/starter">
                  <Button variant="hero" size="lg">
                    Commencer avec Starter
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Me tenir informé du lancement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ProPlan;