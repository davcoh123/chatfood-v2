import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link 
        to="/" 
        className={`text-sm font-medium hover:text-primary transition-all duration-300 hover-trace px-3 py-2 rounded-lg ${mobile ? 'text-lg py-4 border-b w-full text-center' : ''}`}
      >
        Accueil
      </Link>
      <Link 
        to="/offres" 
        className={`text-sm font-medium hover:text-primary transition-all duration-300 hover-trace px-3 py-2 rounded-lg ${mobile ? 'text-lg py-4 border-b w-full text-center' : ''}`}
      >
        Offres
      </Link>
      <Link 
        to="/contact" 
        className={`text-sm font-medium hover:text-primary transition-all duration-300 hover-trace px-3 py-2 rounded-lg ${mobile ? 'text-lg py-4 border-b w-full text-center' : ''}`}
      >
        Contact
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2 hover-trace rounded-lg p-2 -m-2">
          <MessageCircle className="h-8 w-8 text-primary animate-scale-hover" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            ChatFood
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLinks />
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  {profile?.role === 'admin' ? 'Admin Panel' : 'Mon espace'}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="sm">
                Se connecter
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
              <SheetTitle className="text-left flex items-center gap-2 border-b pb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span className="font-bold">ChatFood</span>
              </SheetTitle>
              <nav className="flex flex-col items-center gap-2 mt-8">
                <NavLinks mobile />
                
                <div className="flex flex-col w-full gap-3 mt-8 pt-8 border-t">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="w-full">
                        <Button variant="outline" className="w-full">
                          {profile?.role === 'admin' ? 'Admin Panel' : 'Mon espace'}
                        </Button>
                      </Link>
                      <Button variant="ghost" onClick={handleSignOut} className="w-full">
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <Link to="/login" className="w-full">
                      <Button variant="hero" className="w-full">
                        Se connecter
                      </Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;