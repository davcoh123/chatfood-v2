import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Brain, Building2, Users, Crown, ArrowLeft, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const PremiumPlan = () => {
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
              <Badge className="mb-4 bg-gradient-to-r from-primary to-primary-light">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                Plan <span className="text-primary">Premium</span> : La solution tout-en-un
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                L'offre idéale pour maximiser votre efficacité et fidéliser vos clients
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <Card className="sticky top-8 border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary mr-2" />
                    Premium
                  </CardTitle>
                  <CardDescription>La solution tout-en-un pour les restaurants ambitieux et les chaînes</CardDescription>
                  <div className="text-5xl font-bold text-primary mt-4">
                    85,90€
                    <span className="text-lg text-muted-foreground font-normal">/mois</span>
                  </div>
                  <Badge className="mt-4 bg-muted text-muted-foreground">Bientôt disponible</Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/5 rounded-lg p-3 mb-6">
                    <p className="text-sm text-center font-medium">
                      Tout du plan Pro +
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Gestion des réservations avec calendrier intégré</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Apprentissage IA avancé : le bot s'adapte à votre style et mémorise les commandes récurrentes</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Envoi de promotions ciblées via WhatsApp</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Paiement en ligne sans intermédiaire</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>Support personnalisé par un Account manager</span>
                    </li>
                  </ul>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Le plan Premium est actuellement en développement. Nous travaillons activement pour le rendre disponible très prochainement.
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
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-6 w-6 text-primary mr-3" />
                        Gestion des Réservations IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <p className="text-muted-foreground">
                          Le plan Premium inclut la gestion intelligente des réservations avec calendrier intégré pour optimiser votre planning et maximiser votre taux de remplissage.
                        </p>
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                          <h5 className="font-semibold mb-3">Exemple de conversation :</h5>
                          <div className="space-y-3">
                            <div className="bg-background rounded-lg p-3">
                              <p className="text-sm">
                                <strong>Client :</strong> "Bonjour, j'aimerais réserver pour 4 personnes demain soir"
                              </p>
                            </div>
                            <div className="bg-primary text-primary-foreground rounded-lg p-3">
                              <p className="text-sm">
                                <strong>ChatFood :</strong> "Parfait ! J'ai plusieurs créneaux disponibles : 19h30, 20h15 ou 21h00. Quelle heure vous conviendrait le mieux ? Et souhaitez-vous déjà pré-commander ?"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h5 className="font-semibold mb-2">Optimisation automatique</h5>
                            <p className="text-sm text-muted-foreground">
                              L'IA optimise automatiquement vos créneaux pour maximiser le remplissage et minimiser les temps morts.
                            </p>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h5 className="font-semibold mb-2">Pré-commandes intelligentes</h5>
                            <p className="text-sm text-muted-foreground">
                              Propose automatiquement de pré-commander selon les habitudes et les créneaux de réservation.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-6 w-6 text-primary mr-3" />
                      Apprentissage IA Avancé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-muted-foreground">
                        L'IA la plus sophistiquée du marché, qui apprend non seulement de vos clients 
                        mais aussi de l'ensemble de votre chaîne de restaurants pour une optimisation maximum.
                      </p>
                      
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                        <h5 className="font-semibold mb-3">Ce que l'IA Premium peut faire :</h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-background rounded-lg p-3">
                            <h6 className="font-medium mb-1">Prédictions de vente</h6>
                            <p className="text-sm text-muted-foreground">
                              "Dimanche prochain, il va pleuvoir. Je vous conseille de préparer 
                              plus de soupes et de plats chauds."
                            </p>
                          </div>
                          <div className="bg-background rounded-lg p-3">
                            <h6 className="font-medium mb-1">Analyse comportementale</h6>
                            <p className="text-sm text-muted-foreground">
                              "Ce client hésite toujours entre 2 plats. Je vais lui proposer 
                              une dégustation pour l'aider à se décider."
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h5 className="font-semibold mb-2">IA Cross-restaurants</h5>
                          <p className="text-sm text-muted-foreground">
                            Apprend des tendances de tous vos restaurants pour optimiser 
                            chaque établissement individuellement.
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h5 className="font-semibold mb-2">Machine Learning avancé</h5>
                          <p className="text-sm text-muted-foreground">
                            Algorithmes de pointe qui s'adaptent en temps réel 
                            aux changements de comportement client.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-6 w-6 text-primary mr-3" />
                      Paiement en ligne sans intermédiaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Intégrez le paiement en ligne directement dans le parcours de commande, 
                        sans passer par des plateformes tierces qui prennent des commissions.
                      </p>
                      
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                        <h5 className="font-semibold mb-2">Avantages :</h5>
                        <p className="text-sm text-muted-foreground">
                          Encaissement direct, pas de commission supplémentaire, suivi des transactions 
                          en temps réel, et paiement sécurisé pour vos clients.
                        </p>
                      </div>

                      <ul className="space-y-2 mt-4">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Intégration sans intermédiaire</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Encaissement direct sur votre compte</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Suivi des transactions en temps réel</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-primary mr-2 mt-1 flex-shrink-0" />
                          <span className="text-sm">Paiement sécurisé pour vos clients</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-6 w-6 text-primary mr-3" />
                      Accompagnement VIP
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Phone className="h-4 w-4 text-primary mr-2" />
                            Account Manager Dédié
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            Un expert ChatFood dédié à votre réussite, disponible 
                            par téléphone, email et visio.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">Formation Sur Site</h5>
                          <p className="text-sm text-muted-foreground">
                            Nous venons former votre équipe directement dans 
                            vos restaurants pour une adoption parfaite.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Support Prioritaire</h5>
                          <p className="text-sm text-muted-foreground">
                            Réponse garantie sous 2h en cas de problème, 
                            avec une hotline dédiée 7j/7.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">Développements Sur Mesure</h5>
                          <p className="text-sm text-muted-foreground">
                            Des fonctionnalités personnalisées développées 
                            spécifiquement pour vos besoins.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                Le plan Premium est fait pour vous si...
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous voulez une IA qui apprend de vos clients</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous souhaitez envoyer des promotions ciblées</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous voulez un accompagnement personnalisé</span>
                  </li>
                </ul>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous avez besoin de paiement en ligne direct</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous voulez maximiser votre ROI avec l'IA</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span>Vous cherchez un partenaire de croissance</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/offres/starter">
                  <Button variant="hero" size="lg" className="bg-gradient-to-r from-primary to-primary-light">
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

export default PremiumPlan;