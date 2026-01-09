import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const Legal = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-foreground">Mentions légales</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1) Éditeur du site</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le présent site est édité par : <strong>ChatFood SAS</strong>, société par actions simplifiée au capital de 200 €, dont le siège social est situé 36, rue Brissard, 92140 Clamart, France, immatriculée au R.C.S. Nanterre sous le numéro 994 943 082.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              N° de TVA intracommunautaire : FR9201.994943082.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Adresse e‑mail : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Téléphone : +33 7 78 00 41 88.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2) Directeur de la publication</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le directeur de la publication est <strong>Adam Birstein</strong>, en qualité de Président.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3) Hébergeur du site</h2>
            <p className="text-muted-foreground leading-relaxed">
              Hébergeur : <strong>Lovable (GPT Engineer AB)</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Adresse : Lovable Labs AB, Box 190, 101 23, Stockholm, Sweden.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Site web : <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://lovable.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4) Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              L’ensemble des éléments du site (textes, graphismes, logos, icônes, images, vidéos, logiciels, architecture, base de données, etc.) est protégé par le droit d’auteur et les droits de propriété intellectuelle.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Sauf mention contraire, ces éléments sont la propriété exclusive de ChatFood SAS ou font l’objet d’une licence d’utilisation.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Toute reproduction, représentation, adaptation, modification, traduction, diffusion ou exploitation, totale ou partielle, du site ou de l’un de ses éléments, par quelque procédé que ce soit, sans autorisation écrite préalable de ChatFood, est strictement interdite et constituerait une contrefaçon.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5) Responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l’absence d’erreurs ou d’omissions.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Le site peut contenir des liens hypertextes vers d’autres sites sur lesquels ChatFood n’exerce aucun contrôle ; ChatFood décline toute responsabilité quant aux contenus ou pratiques de ces sites tiers.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              L’accès au site peut être interrompu à tout moment pour des raisons techniques, de maintenance ou de force majeure ; ChatFood ne saurait être tenue responsable des conséquences de ces interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6) Données personnelles et cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les traitements de données personnelles réalisés via le site et la solution ChatFood sont décrits dans la Politique de confidentialité accessible à l’adresse : <Link to="/privacy" className="text-primary hover:underline">/privacy</Link>.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              La gestion des traceurs et cookies est décrite dans la Politique cookies accessible à l’adresse : <Link to="/cookies" className="text-primary hover:underline">/cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7) Droit applicable et règlement des litiges</h2>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes mentions légales sont soumises au droit français.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              En cas de litige relatif à l’utilisation du site, et à défaut d’accord amiable, les tribunaux compétents seront ceux du ressort de la Cour d’appel de Paris, sous réserve des règles de compétence impératives.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8) Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant le site, son contenu ou l’exercice de vos droits, vous pouvez contacter ChatFood à l’adresse suivante : ChatFood SAS – 36, rue Brissard, 92140 Clamart, France.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              E‑mail : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
