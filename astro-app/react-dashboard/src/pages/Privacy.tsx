import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-foreground">Politique de confidentialité – ChatFood</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 20/12/2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Identité et contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              La présente politique décrit la manière dont ChatFood SAS (36, rue Brissard, 92140 Clamart, France) traite des données à caractère personnel dans le cadre de son site et de sa solution de chatbot WhatsApp destinée aux restaurants.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Contact RGPD : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Champ d’application</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">La présente politique s’applique :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Aux visiteurs du site ChatFood.</li>
              <li>Aux représentants des restaurants clients ou prospects.</li>
              <li>Aux clients finaux des restaurants qui interagissent avec un chatbot opéré via WhatsApp grâce à ChatFood.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Rôles RGPD (qui est responsable de quoi)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pour les clients finaux des restaurants (WhatsApp) : le restaurant est en principe responsable de traitement pour les données liées à la commande et à la relation commerciale ; ChatFood agit en sous‑traitant au sens du RGPD, en traitant les messages et données nécessaires pour fournir le service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Pour certaines données techniques/sécurité (ex. logs, sécurité, supervision), ChatFood peut agir comme responsable de traitement autonome, lorsque ces traitements sont nécessaires au fonctionnement et à la sécurité de la solution.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Pour plus de détails sur la sous‑traitance, un accord de sous‑traitance (DPA) encadre les traitements effectués par ChatFood pour le compte des restaurants.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Données traitées</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Selon les cas, ChatFood peut traiter notamment les catégories suivantes :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Données d’identification (restaurants) :</strong> nom, prénom, fonction, raison sociale, SIREN, adresse professionnelle, e‑mail, téléphone.</li>
              <li><strong>Données de connexion / techniques :</strong> identifiants, logs, horodatages, adresses IP, paramètres techniques.</li>
              <li><strong>Données issues des échanges WhatsApp :</strong> numéro de téléphone, contenu des messages (texte, et le cas échéant médias), informations de commande (produits, quantités, instructions), adresse de livraison si fournie via WhatsApp, et historique de conversation.</li>
              <li><strong>Données de facturation :</strong> moyens de paiement, montant, date, références de transaction (le cas échéant via un prestataire de paiement tiers).</li>
              <li><strong>Données de support :</strong> demandes adressées au service client, notes internes, correspondances.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              ChatFood ne collecte pas intentionnellement de données dites sensibles (santé, opinions politiques, etc.) et invite les utilisateurs à ne pas en communiquer via les canaux gérés par la solution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Finalités et bases légales</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">ChatFood traite les données personnelles pour les finalités suivantes :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Fourniture de la solution aux restaurants</strong> (gestion des comptes, configuration, traitement des commandes et messages via WhatsApp). Base légale : exécution du contrat conclu avec le restaurant.</li>
              <li><strong>Gestion des échanges avec les clients finaux</strong> (réception et traitement des messages, automatisation des réponses, suivi des demandes/commandes). Base légale : exécution du contrat entre le restaurant et son client et/ou intérêt légitime à fournir un service de messagerie efficace.</li>
              <li><strong>Support, maintenance et amélioration du service</strong> (assistance, sécurité, statistiques d’utilisation agrégées/anonymisées lorsque possible). Base légale : intérêt légitime.</li>
              <li><strong>Prospection commerciale B2B</strong> (restaurants/prospects professionnels). Base légale : intérêt légitime, avec droit d’opposition.</li>
              <li><strong>Obligations légales</strong> (facturation, comptabilité, prévention de la fraude, demandes des autorités). Base légale : obligation légale.</li>
              <li><strong>Messages promotionnels aux clients finaux</strong> (pour le compte des restaurants). Base légale : consentement, retirable à tout moment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Origine des données</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Les données proviennent :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Directement des personnes concernées (restaurants ou utilisateurs finaux) lors de l’utilisation du site, de la solution ou de WhatsApp.</li>
              <li>Des restaurants, lorsqu’ils communiquent à ChatFood certains éléments relatifs à leurs clients.</li>
              <li>Des systèmes techniques de ChatFood (journaux de connexion, mesures d’audience).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Destinataires et sous‑traitants</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Les données sont accessibles, dans la limite de leurs attributions :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Aux équipes internes de ChatFood (technique, support, commerciale, facturation).</li>
              <li>Aux restaurants clients, pour les données relatives à leurs propres clients.</li>
              <li>À des prestataires techniques agissant en tant que sous‑traitants (hébergeurs, plateforme d’automatisation, base de données, fournisseur de modèles d’IA, prestataire de paiement, outil de support).</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              ChatFood ne vend pas de données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Fonctionnement WhatsApp, IA et traitements automatisés</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lorsque l’utilisateur envoie un message au numéro WhatsApp d’un restaurant utilisant ChatFood, le message est transmis aux systèmes de ChatFood afin d’être analysé et de générer une réponse automatisée, puis la réponse est renvoyée sur WhatsApp.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Pour le fonctionnement de la solution, certains messages et données peuvent transiter par un serveur d’automatisation (type n8n), une base de données (type Supabase) et un fournisseur de modèle d’intelligence artificielle (type Grok).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Ces traitements visent à améliorer la rapidité et la pertinence des échanges, sans produire de décision juridique ou ayant des effets significatifs similaires ; en cas de problème, une intervention humaine peut être demandée via le support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Transferts hors Union européenne</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certains prestataires peuvent être situés en dehors de l’Espace économique européen ou traiter des données depuis un pays tiers ; dans ce cas, ChatFood met en place des garanties appropriées (par exemple clauses contractuelles types, décision d’adéquation, ou autres garanties reconnues).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Des informations plus détaillées sur les pays de destination et les garanties applicables peuvent être obtenues sur demande à <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Durées de conservation</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Les données sont conservées pendant la durée nécessaire aux finalités poursuivies.</p>
            <p className="text-muted-foreground leading-relaxed mb-2">À titre indicatif :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Données de compte et facturation des restaurants :</strong> durée de la relation contractuelle puis durées légales de conservation/prescription.</li>
              <li><strong>Logs techniques :</strong> quelques mois à compter de la collecte (sécurité/maintenance).</li>
              <li><strong>Messages WhatsApp et historiques de commandes :</strong> durée de la relation entre le restaurant et le client puis période limitée définie avec le restaurant.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Au‑delà de ces durées, les données sont supprimées ou anonymisées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Droits des personnes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, les personnes concernées disposent notamment des droits d’accès, rectification, effacement, opposition, limitation et, lorsque applicable, portabilité.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Les clients des restaurants peuvent exercer certains de ces droits directement auprès de leur restaurant (responsable de traitement pour la relation commerciale et la commande).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Exercice des droits</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">Les demandes peuvent être adressées :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Par e‑mail : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a></li>
              <li>Par courrier : ChatFood SAS, 36, rue Brissard, 92140 Clamart, France</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour des raisons de sécurité, une preuve d’identité pourra être demandée.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              ChatFood s’efforce de répondre dans un délai d’un mois (prolongeable en cas de complexité ou de demandes multiples).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              En cas de désaccord, une réclamation peut être adressée à l’autorité de contrôle compétente (en France : la CNIL).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Sécurité</h2>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood met en œuvre des mesures techniques et organisationnelles appropriées pour protéger les données (contrôle d’accès, chiffrement des communications, sauvegardes/restauration, sensibilisation).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Cookies et traceurs (site web)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Des cookies/traceurs peuvent être utilisés pour assurer le fonctionnement et la sécurité du site, mesurer l’audience et améliorer l’ergonomie et, le cas échéant, proposer des contenus personnalisés.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Les modalités (acceptation/refus) sont décrites dans la Politique cookies : <Link to="/cookies" className="text-primary hover:underline">/cookies</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">15. Mise à jour de la politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cette politique peut être modifiée pour tenir compte des évolutions légales, techniques ou organisationnelles ; la date de dernière mise à jour figure en en‑tête.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              En cas de modification substantielle, les utilisateurs seront informés par un moyen approprié.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
