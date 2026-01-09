import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const DataDeletion = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl font-bold mb-4 text-foreground">Politique de suppression des données – ChatFood</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : 20/12/2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1) Objet</h2>
            <p className="text-muted-foreground leading-relaxed">
              La présente politique décrit les modalités selon lesquelles ChatFood SAS procède à la suppression ou à l’anonymisation des données personnelles traitées via son site et sa solution de chatbot WhatsApp pour restaurants, en complément de sa Politique de confidentialité.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour les données des clients finaux des restaurants, ChatFood agit en qualité de sous‑traitant et met en œuvre la suppression sur instruction du Restaurant, responsable de traitement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2) Données concernées</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Sont notamment concernées :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Données des représentants des restaurants (compte client, facturation, support).</li>
              <li>Données des clients finaux des restaurants (messages WhatsApp, commandes, historique d’échanges).</li>
              <li>Données techniques (logs, journaux d’erreurs, données d’usage anonymisées ou pseudonymisées).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3) Principes de suppression</h2>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood ne conserve les données personnelles que pendant la durée strictement nécessaire aux finalités pour lesquelles elles sont traitées, sauf obligations légales ou réglementaires contraires.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              À l’issue des durées de conservation, les données sont soit supprimées, soit anonymisées de manière irréversible.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Quand une demande d’effacement est recevable, ChatFood met en œuvre les opérations nécessaires dans les délais prévus et en informe, si nécessaire, les prestataires impliqués.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4) Durées de conservation (règles standard)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sous réserve d’ajustements contractuels avec les restaurants et des obligations légales applicables, ChatFood applique notamment :
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Données de compte & facturation (restaurants) :</strong> pendant la relation contractuelle, puis archivage pendant les durées légales de conservation comptable et de prescription, puis suppression/anonymisation.
              </li>
              <li>
                <strong>Messages WhatsApp & données de commandes (clients finaux) :</strong> pendant la durée nécessaire à la gestion de la relation (commande, SAV, litige), puis pour une période complémentaire limitée définie avec le restaurant, puis suppression/anonymisation.
              </li>
              <li>
                <strong>Prospection B2B :</strong> jusqu’au retrait/à l’opposition ou durée limitée conforme aux recommandations de l’autorité de contrôle.
              </li>
              <li>
                <strong>Logs techniques/sécurité :</strong> durée limitée nécessaire à la sécurité, maintenance et audit (ex. quelques mois), puis suppression ou agrégation non identifiable.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Lorsque la finalité est atteinte (ex. conversation terminée pour un acte d’achat), des mécanismes de purge immédiate ou régulière doivent être mis en place afin d’éviter une conservation non pertinente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5) Comment demander la suppression (droit à l’effacement)</h2>
            
            <h3 className="text-xl font-semibold mb-2 text-foreground mt-6">A) Clients finaux (clients des restaurants sur WhatsApp)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Demande prioritaire au restaurant auprès duquel la commande a été passée, car il est responsable de traitement principal pour la relation commerciale.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Si la demande est envoyée à ChatFood, elle sera transmise au restaurant concerné (si identifié) et ChatFood coopérera pour exécuter la suppression sur instruction du restaurant.
            </p>

            <h3 className="text-xl font-semibold mb-2 text-foreground mt-6">B) Restaurants, prospects et visiteurs du site</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">Les demandes peuvent être adressées à ChatFood :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Par e‑mail : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a></li>
              <li>Par courrier : ChatFood SAS, 36 rue Brissard, 92140 Clamart, France</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Pour faciliter le traitement, il est recommandé d’indiquer : le numéro WhatsApp concerné, le restaurant concerné (si applicable), et la période approximative des échanges.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Pour des raisons de sécurité, un justificatif d’identité peut être demandé si nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6) Délais de traitement</h2>
            <p className="text-muted-foreground leading-relaxed">
              ChatFood répond aux demandes dans les délais prévus par la réglementation, en principe dans un délai d’un mois (prolongeable en cas de complexité ou multiplicité des demandes).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Lorsque la demande d’effacement est recevable, l’effacement ou l’anonymisation est effectué dans un délai maximal de 30 jours à compter de la validation de la demande, sous réserve des contraintes techniques ou légales pouvant justifier un délai plus long.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7) Mise en œuvre technique de la suppression</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Lorsqu’une suppression est due, ChatFood met en œuvre, dans la mesure du possible :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Suppression ou anonymisation dans les bases de données applicatives.</li>
              <li>Purge des journaux et scénarios d’automatisation lorsque techniquement possible et compatible avec les obligations de sécurité.</li>
              <li>Information des sous‑traitants concernés afin qu’ils procèdent eux‑mêmes à la suppression/anonymisation, conformément aux contrats.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Si l’effacement complet n’est pas immédiatement possible (ex. sauvegardes), les données sont placées en restriction d’accès et ne sont plus utilisées qu’aux fins strictement nécessaires (preuve, litige, obligations comptables).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8) Sauvegardes et archives</h2>
            <p className="text-muted-foreground leading-relaxed">
              Des données peuvent rester temporairement dans des systèmes de sauvegarde/archives sécurisés ; elles ne sont plus utilisées activement et sont effacées/anonymisées à l’issue des cycles de rotation des sauvegardes ou des durées légales applicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9) Évolution de la politique</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cette politique peut être mise à jour pour tenir compte des évolutions légales, techniques ou organisationnelles ; la version en vigueur est accessible sur le site de ChatFood.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Toute question relative à cette politique ou à la protection des données peut être adressée à : <a href="mailto:chatfoodsas@gmail.com" className="text-primary hover:underline">chatfoodsas@gmail.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DataDeletion;
