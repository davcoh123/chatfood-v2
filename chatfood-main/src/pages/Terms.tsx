import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-foreground">Conditions d’utilisation (Terms) – ChatFood</h1>
        <p className="text-muted-foreground mb-8">Date d’entrée en vigueur : 20/12/2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground leading-relaxed">
            Ces Conditions régissent (i) l’utilisation de la solution ChatFood par les restaurants, et (ii) l’utilisation du service de messagerie WhatsApp opéré techniquement par ChatFood pour les clients finaux des restaurants.
          </p>

          <div className="border-t border-border my-8"></div>

          <h2 className="text-3xl font-bold mb-6 text-primary">A. CGU – Restaurants (clients ChatFood)</h2>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">1. Objet</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes Conditions Générales d’Utilisation ont pour objet de définir les conditions dans lesquelles ChatFood SAS met à disposition des restaurants une solution SaaS de chatbot conversationnel permettant de gérer les échanges et commandes via WhatsApp, ainsi que les droits et obligations des parties.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">2. Définitions</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>ChatFood :</strong> ChatFood SAS, éditrice de la solution.</li>
              <li><strong>Restaurant :</strong> tout professionnel signataire d’un contrat (ou bon de commande) utilisant la solution pour ses besoins propres.</li>
              <li><strong>Solution :</strong> l’ensemble des services fournis par ChatFood (chatbot WhatsApp, automatisation, stockage, interface d’administration).</li>
              <li><strong>Utilisateur final :</strong> client du Restaurant utilisant WhatsApp pour passer commande ou poser des questions.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">3. Inscription, compte et accès</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le Restaurant garantit l’exactitude et la mise à jour des informations communiquées (raison sociale, coordonnées, SIREN, etc.).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Le Restaurant est responsable de la confidentialité de ses identifiants d’accès et de toute action réalisée depuis son compte.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">4. Description des services</h3>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood met à disposition un chatbot accessible via WhatsApp pour la gestion des commandes, réservations et questions clients, selon les fonctionnalités de l’offre souscrite.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              La Solution inclut l’hébergement et le traitement des données nécessaires (messages, données de commande, statistiques) et un tableau de bord permettant au Restaurant de consulter les échanges, suivre les commandes et configurer les réponses.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">5. Données personnelles (RGPD) – rôles et responsabilités</h3>
            <p className="text-muted-foreground leading-relaxed">
              Pour les données des Utilisateurs finaux collectées via WhatsApp, le Restaurant est responsable de traitement et ChatFood agit en sous‑traitant, conformément au RGPD.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Le Restaurant s’engage à respecter la réglementation applicable (RGPD, loi Informatique et Libertés), notamment en informant ses clients et en recueillant les consentements requis (par exemple pour les messages promotionnels).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Les modalités détaillées de traitement, suppression et réversibilité des données sont précisées dans l’accord de sous‑traitance (DPA) conclu entre ChatFood et le Restaurant.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">6. Sous‑traitants et transferts</h3>
            <p className="text-muted-foreground leading-relaxed">
              Pour fournir la Solution, ChatFood peut faire intervenir des prestataires tels que : un serveur d’automatisation n8n auto‑hébergé, un service de base de données (type Supabase), un fournisseur de modèle d’IA (type Grok / xAI), et les services Meta/WhatsApp.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Le Restaurant est informé que certains prestataires peuvent être situés hors Union européenne ; des garanties appropriées (ex. clauses contractuelles types, décisions d’adéquation ou autres mécanismes reconnus) sont mises en place, conformément au DPA et à la politique de confidentialité.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">7. Obligations du Restaurant</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">Le Restaurant s’engage notamment à :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Utiliser la Solution uniquement dans le cadre de son activité professionnelle et conformément à la loi (consommation, e‑commerce, communications électroniques, données personnelles).</li>
              <li>Fournir aux Utilisateurs finaux une information claire sur l’utilisation de WhatsApp et de ChatFood, et un lien vers la politique de confidentialité applicable.</li>
              <li>Ne pas utiliser la Solution pour envoyer des contenus illicites, trompeurs, abusifs, non sollicités, ni pour contourner les politiques WhatsApp/Meta.</li>
              <li>Assurer la conformité de ses menus, prix, informations produits et obligations légales (mentions obligatoires, allergènes, etc.).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">8. Obligations de ChatFood</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">ChatFood s’engage notamment à :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fournir la Solution conformément à la description contractuelle et aux règles de l’art.</li>
              <li>Mettre en œuvre des mesures de sécurité raisonnables (contrôle d’accès, chiffrement en transit, journalisation, sauvegardes).</li>
              <li>Notifier le Restaurant en cas de violation de données affectant ses Utilisateurs finaux dans les délais légaux.</li>
              <li>Coopérer avec le Restaurant pour l’exécution des demandes de droits (accès, rectification, effacement, opposition, limitation, portabilité) présentées par les Utilisateurs finaux.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">9. Propriété intellectuelle</h3>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood conserve l’ensemble des droits de propriété intellectuelle sur la Solution, les logiciels, interfaces, modèles, contenus et savoir‑faire associés.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Le Restaurant bénéficie d’un droit d’utilisation non exclusif, non cessible, pour la durée du contrat et pour ses seuls besoins internes.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Toute reproduction, modification, décompilation, diffusion ou mise à disposition de la Solution à des tiers est interdite sans accord écrit préalable de ChatFood.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">10. Conditions financières</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les tarifs applicables, modalités de facturation et conditions des offres (freemium, professional, premium…) sont ceux mentionnés dans l’offre ou la commande acceptée par le Restaurant.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Sauf mention contraire, les abonnements sont conclus pour une durée minimale (par exemple mensuelle) renouvelable par tacite reconduction.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Tout retard de paiement peut entraîner suspension de la Solution, intérêts de retard et frais de recouvrement, conformément à la législation applicable.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">11. Durée, suspension et résiliation</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le contrat prend effet à la création du compte ou à la signature du bon de commande, pour la durée indiquée.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              ChatFood peut suspendre ou limiter l’accès en cas d’utilisation illicite, de non‑paiement, de violation grave des CGU ou de nécessité de maintenance.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Chaque partie peut résilier sous préavis de 30 jours (ou immédiatement en cas de manquement grave non corrigé dans un délai raisonnable).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              En cas de résiliation, les données traitées pour le compte du Restaurant sont supprimées ou restituées selon les modalités prévues contractuellement, puis effacées ou anonymisées à l’issue des délais applicables et obligations légales.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">12. Limitation de responsabilité</h3>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood n’est responsable que des dommages directs, prouvés, causés par un manquement établi à ses obligations contractuelles, dans la limite d’un plafond de 3 mois d’abonnement payés.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              ChatFood ne saurait être responsable des pertes de chiffre d’affaires, de réputation, des dommages indirects, ni des conséquences liées au non‑respect par le Restaurant de ses propres obligations légales (notamment vis‑à‑vis des consommateurs et du RGPD).
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">13. Données personnelles et conservation</h3>
            <p className="text-muted-foreground leading-relaxed">
              La durée de conservation des données (commandes, logs, historiques de conversations, statistiques) est définie dans la politique de confidentialité de ChatFood et, le cas échéant, dans un accord spécifique avec le Restaurant.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              À l’issue du contrat, ChatFood supprimera ou anonymisera les données dans les délais indiqués, sous réserve des obligations légales de conservation et de ses intérêts légitimes (preuve, facturation).
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">14. Droit applicable et juridiction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes CGU sont soumises au droit français.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Tout litige relatif à leur formation, interprétation ou exécution relève de la compétence exclusive des tribunaux du ressort du siège social de ChatFood, sauf disposition impérative contraire.
            </p>
          </section>

          <div className="border-t border-border my-8"></div>

          <h2 className="text-3xl font-bold mb-6 text-primary">B. Conditions – Utilisateurs finaux (clients des restaurants)</h2>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">1. Objet</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les présentes conditions ont pour objet d’informer les Utilisateurs finaux des conditions d’utilisation du service de messagerie WhatsApp mis en place par leur restaurant et opéré techniquement par ChatFood, permettant notamment de passer commande, poser des questions et recevoir des informations.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">2. Rôle des parties</h3>
            <p className="text-muted-foreground leading-relaxed">
              Le Restaurant est responsable des commandes, de la relation commerciale et du traitement des données personnelles de ses clients.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              ChatFood agit comme prestataire technique pour le compte du Restaurant et traite les messages afin d’automatiser les réponses et la gestion des demandes.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">3. Fonctionnement du service</h3>
            <p className="text-muted-foreground leading-relaxed">
              Lorsque l’Utilisateur envoie un message au numéro WhatsApp du Restaurant, son message est transmis aux systèmes de ChatFood pour analyse et génération de réponses automatisées, puis renvoyé sur WhatsApp.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Les échanges peuvent être consultés par le Restaurant afin de traiter les commandes, gérer le service client et améliorer la qualité de service.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">4. Utilisation acceptable</h3>
            <p className="text-muted-foreground leading-relaxed">
              L’Utilisateur s’engage à utiliser le service uniquement pour des échanges liés au Restaurant (questions, commandes, avis, etc.).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Il s’interdit d’envoyer des contenus illicites, injurieux, discriminatoires, diffamatoires ou susceptibles de porter atteinte aux droits de tiers.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">5. Données traitées et finalités (résumé)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sont notamment traités : le numéro de téléphone, les messages échangés (texte, images le cas échéant), informations de commande (produits, adresse de livraison, instructions) et métadonnées techniques nécessaires au fonctionnement du service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Ces données sont utilisées pour gérer les demandes/commandes, assurer le support client, produire des statistiques agrégées/anonymisées et, avec accord préalable, envoyer des informations et offres promotionnelles.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">6. Sous‑traitance et transferts</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les données peuvent être hébergées et traitées par des prestataires techniques choisis par ChatFood (automatisation, hébergeurs de base de données, fournisseurs de modèles d’IA, Meta/WhatsApp).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Lorsque des transferts ont lieu hors de l’Union européenne, ils sont encadrés par des mécanismes légaux adéquats, détaillés dans la politique de confidentialité.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">7. Droits des Utilisateurs</h3>
            <p className="text-muted-foreground leading-relaxed">
              L’Utilisateur dispose, dans les conditions prévues par la réglementation, d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Ces droits peuvent être exercés auprès du Restaurant (coordonnées indiquées par celui‑ci) ou auprès de ChatFood pour les points précisés dans la politique de confidentialité.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              L’Utilisateur peut demander l’arrêt des messages promotionnels en répondant par un mot‑clé simple (ex. « STOP ») ou via les paramètres de WhatsApp.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Pour les données des clients finaux, ChatFood agit en qualité de sous‑traitant et met en œuvre la suppression sur instruction du Restaurant, responsable de traitement.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">8. Conservation et suppression</h3>
            <p className="text-muted-foreground leading-relaxed">
              Les données liées aux échanges WhatsApp sont conservées pendant la durée nécessaire à la gestion de la relation entre l’Utilisateur et le Restaurant (ex. 6 mois après la dernière interaction), puis supprimées ou anonymisées.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Sur demande, les données peuvent être effacées plus tôt, sous réserve d’obligations légales (facturation, litiges, etc.) ; les modalités pratiques sont détaillées dans la politique de confidentialité.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">9. Sécurité</h3>
            <p className="text-muted-foreground leading-relaxed">
              Des mesures de sécurité raisonnables sont mises en œuvre pour protéger les données contre tout accès, modification, divulgation ou destruction non autorisés.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Malgré ces mesures, aucun système n’est exempt de risques ; il est recommandé d’éviter d’envoyer via WhatsApp des informations particulièrement sensibles (santé, données bancaires, etc.).
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">10. Mise à jour</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ces conditions peuvent être mises à jour pour refléter les évolutions légales, techniques ou fonctionnelles ; en cas de modification substantielle, l’information sera fournie par un message ou un lien actualisé.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Toute question relative à la protection des données et à l’exercice des droits peut être adressée à : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
