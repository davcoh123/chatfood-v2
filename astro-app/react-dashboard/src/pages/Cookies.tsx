import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

const Cookies = () => {
  const { openModal } = useCookieConsent();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-foreground">Politique de Cookies – ChatFood</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 20/12/2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet à son émetteur d'identifier le terminal dans lequel il est enregistré, pendant la durée de validité ou d'enregistrement du cookie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Les cookies que nous utilisons</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nous utilisons différents types de cookies pour améliorer votre expérience sur notre site :
            </p>
            
            <h3 className="text-xl font-medium mb-2 text-foreground">Cookies strictement nécessaires</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ces cookies sont indispensables au bon fonctionnement du site (authentification, sécurité, mémorisation de votre choix de consentement) et ne peuvent pas être désactivés dans nos systèmes. Ils ne requièrent pas votre consentement préalable.
            </p>

            <h3 className="text-xl font-medium mb-2 text-foreground">Cookies de mesure d’audience (Analytics)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ces cookies nous permettent de déterminer le nombre de visites et les sources du trafic, afin de mesurer et d'améliorer les performances de notre site. Ils sont désactivés par défaut et ne sont déposés qu'après votre consentement explicite.
            </p>

            <h3 className="text-xl font-medium mb-2 text-foreground">Cookies marketing / publicité</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ces cookies peuvent être mis en place au sein de notre site Web par nos partenaires publicitaires. Ils peuvent être utilisés par ces sociétés pour établir un profil de vos intérêts et vous proposer des publicités pertinentes sur d'autres sites Web. Ils sont désactivés par défaut.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Gestion de votre consentement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Votre choix (acceptation ou refus) est conservé pendant une durée de <strong>6 mois</strong>. À l'issue de cette période, nous vous solliciterons à nouveau pour renouveler votre choix.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Vous pouvez à tout moment modifier vos préférences ou retirer votre consentement en cliquant sur le lien « Gestion des cookies » présent en bas de chaque page du site, ou en cliquant sur le bouton ci-dessous :
            </p>
            <div className="mt-4">
              <button 
                onClick={openModal}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Gérer mes préférences cookies
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question relative à notre politique de cookies, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
