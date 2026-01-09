import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

const Footer = () => {
  const { openModal } = useCookieConsent();

  return (
    <footer className="bg-gradient-to-br from-muted/50 to-background border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                ChatFood
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              L'assistant IA conversationnel qui révolutionne la prise de commandes pour les restaurants. Plus
              intelligent, plus rapide, disponible 24h/24.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/offres" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Nos offres
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Démo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Informations légales</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/legal" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  CGU
                </Link>
              </li>
              <li>
                <Link to="/data-deletion" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Suppression des données
                </Link>
              </li>
              <li>
                <button 
                  onClick={openModal} 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm text-left"
                >
                  Gestion des cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:chatfoodsas@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  chatfoodsas@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+33778004188"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  +33 7 78 00 41 88
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8 text-center">
          <div className="text-sm text-muted-foreground">© 2024 ChatFood. Tous droits réservés.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
