import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MessageCircle, Phone, Mail, MapPin, Clock, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormData } from "@/schemas/contact";
import { useToast } from "@/hooks/use-toast";
const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      restaurant: "",
      phone: "",
      message: "",
    },
  });

  // Scroll to top when arriving from another page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  const handleSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("https://n8n.chatfood.fr/webhook/demande-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          restaurant: data.restaurant,
          phone: data.phone,
          message: data.message,
          timestamp: new Date().toISOString(),
          source: "website-contact-form",
        }),
      });
      toast({
        title: "Demande envoyée avec succès ! 🎉",
        description: "Notre équipe vous contactera sous 24h pour organiser votre démo gratuite.",
        duration: 5000,
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été transmise à notre équipe.",
        duration: 5000,
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };
  const stats = [
    {
      icon: Users,
      label: "Restaurants actifs",
      value: "5+",
      color: "text-primary",
    },
    {
      icon: MessageCircle,
      label: "Commandes traitées",
      value: "100+",
      color: "text-blue-500",
    },
    {
      icon: Zap,
      label: "Temps de réponse",
      value: "<5s",
      color: "text-green-500",
    },
    {
      icon: Clock,
      label: "Disponibilité",
      value: "24/7",
      color: "text-orange-500",
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary-light/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 animate-bounce">
              <MessageCircle className="w-4 h-4 mr-2" />
              Support français 7j/7
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Parlons de votre projet
              <span className="text-primary"> ChatFood</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Notre équipe d'experts vous accompagne dans la mise en place de votre assistant IA. Démo gratuite,
              configuration incluse.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20" id="contact-form">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="hover:shadow-xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Demander une démo</CardTitle>
                <CardDescription>Remplissez ce formulaire et nous vous contacterons sous 24h</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Votre nom"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  void form.trigger("name");
                                }}
                                className="transition-all duration-300 focus:ring-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="06 12 34 56 78"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  void form.trigger("phone");
                                }}
                                className="transition-all duration-300 focus:ring-primary/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                void form.trigger("email");
                              }}
                              className="transition-all duration-300 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="restaurant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du restaurant</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Le nom de votre restaurant"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                void form.trigger("restaurant");
                              }}
                              className="transition-all duration-300 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Parlez-nous de votre projet, vos besoins, vos questions..."
                              rows={4}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                void form.trigger("message");
                              }}
                              className="transition-all duration-300 focus:ring-primary/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full cta-magnetic"
                      disabled={isSubmitting}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Envoi en cours..." : "Demander ma démo gratuite"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-primary" />
                    Nous appeler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mb-2">+33 7 78 00 41 88</p>
                  <p className="text-muted-foreground">
                    Du lundi au vendredi, 9h-19h Dimanche 10h-16h
                    <br />
                    Samedi 10h-16h
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-primary" />
                    Nous écrire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold mb-2">chatfoodsas@gmail.com</p>
                  <p className="text-muted-foreground">Réponse garantie sous 2h en jour ouvré</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Nos bureaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold mb-2">ChatFood SAS</p>
                  <p className="text-muted-foreground">
                    36, rue Brissard
                    <br />
                    92140 Clamart, France
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-primary-light/10 border-primary/20 hover:shadow-xl transition-all duration-500">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <MessageCircle className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <h3 className="font-semibold">WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground">Chattez directement avec nous</p>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" asChild>
                    <a href="https://wa.me/33778004188" target="_blank" rel="noopener noreferrer">
                      Ouvrir WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-500 hover:scale-105 group"
              >
                <CardContent className="pt-6">
                  <stat.icon
                    className={`h-12 w-12 mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions <span className="text-primary">fréquentes</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Trouvez rapidement les réponses à vos questions sur ChatFood
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "Combien de temps pour mettre en place ChatFood ?",
                  answer:
                    "La configuration complète de ChatFood prend seulement 30 minutes. Notre équipe s'occupe de tout : connexion à votre WhatsApp Business, intégration de votre menu, personnalisation selon votre style. Votre assistant IA est opérationnel le jour même de votre commande.",
                },
                {
                  question: "Mes clients doivent-ils installer une application ?",
                  answer:
                    "Absolument pas ! Vos clients utilisent leur WhatsApp habituel, celui qu'ils ont déjà sur leur téléphone. Ils envoient simplement un message à votre numéro WhatsApp Business et ChatFood répond automatiquement. C'est totalement transparent pour eux.",
                },
                {
                  question: "Comment modifier mon menu ou mes prix ?",
                  answer:
                    "Très facilement via votre tableau de bord ChatFood. Vous pouvez modifier vos plats, prix, disponibilités en temps réel. Les changements sont instantanément pris en compte par votre assistant IA. Plus besoin d'attendre ou de faire appel à un technicien.",
                },
                {
                  question: "Le support client est-il vraiment en français ?",
                  answer:
                    "Oui ! Notre équipe support est 100% française et basée à Paris. Nous proposons un support par téléphone (+33 7 78 00 41 88), email (chatfoodsas@gmail.com) et WhatsApp 7 jours sur 7. Réponse garantie sous 2h en jour ouvré.",
                },
                {
                  question: "ChatFood peut-il gérer les allergies et régimes spéciaux ?",
                  answer:
                    "Parfaitement ! ChatFood mémorise les préférences de chaque client : allergies, régimes végétariens, végans, sans gluten, etc. Il suggère automatiquement les plats adaptés et alerte en cas d'incompatibilité. Plus intelligent qu'un serveur humain !",
                },
                {
                  question: "Que se passe-t-il si ChatFood ne comprend pas une demande ?",
                  answer:
                    "ChatFood est conçu pour comprendre le langage naturel, même avec des fautes ou des expressions familières. Dans les rares cas où il ne comprend pas, il demande poliment au client de reformuler ou transfère la conversation à votre équipe si nécessaire.",
                },
                {
                  question: "Puis-je personnaliser la personnalité de ChatFood ?",
                  answer:
                    "Absolument ! Lors de la configuration, nous adaptons ChatFood à l'ambiance de votre restaurant : ton décontracté pour un fast-food, plus formel pour un restaurant gastronomique, avec l'accent du Sud pour une pizzeria marseillaise... Il représente parfaitement votre marque.",
                },
                {
                  question: "Les données de mes clients sont-elles sécurisées ?",
                  answer:
                    "La sécurité est notre priorité absolue. Toutes les données sont chiffrées et hébergées en Europe (RGPD compliant). Nous ne vendons jamais vos données. Vos clients et leurs informations restent entièrement privés et sous votre contrôle.",
                },
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-background rounded-lg border hover:shadow-lg transition-all duration-300"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center animate-fade-in">
              <Card className="inline-block bg-gradient-to-br from-primary/5 to-primary-light/10 border-primary/20">
                <CardContent className="p-6">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Vous avez d'autres questions ?</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Notre équipe est là pour vous répondre personnellement
                  </p>
                  <Button
                    onClick={() => {
                      const element = document.getElementById("contact-form");
                      if (element) {
                        const elementTop = element.offsetTop;
                        const offset = window.innerHeight * 0.3; // 30% de la hauteur de l'écran
                        window.scrollTo({
                          top: elementTop - offset,
                          behavior: "smooth",
                        });
                      }
                    }}
                    variant="hero"
                    size="sm"
                  >
                    Nous contacter
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Contact;
