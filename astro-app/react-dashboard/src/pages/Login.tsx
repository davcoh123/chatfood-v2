import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Inscription
        const { error } = await signUp(email, password, firstName, lastName);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: error,
          });
          return;
        }

        toast({
          title: "Inscription réussie",
          description: "Bienvenue sur ChatFood !",
        });
        navigate("/dashboard");
      } else {
        // Connexion
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: error,
          });
          return;
        }

        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté à votre espace.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary-light/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--primary-light)/0.08)_0%,_transparent_50%)]"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary-light/5 rounded-full blur-2xl animate-float animation-delay-200"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/3 rounded-full blur-lg animate-float animation-delay-400"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-6 animate-slide-up">
            <Link to="/" className="inline-flex items-center space-x-2 hover-trace rounded-lg p-2 -m-2 mb-8 group transition-all duration-300">
              <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200 group-hover:-translate-x-1" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-200">Retour à l'accueil</span>
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3 animate-slide-up animation-delay-200">
                <div className="relative">
                  <MessageCircle className="h-12 w-12 text-primary animate-scale-hover" />
                  <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
                  ChatFood
                </span>
              </div>
              <div className="space-y-2 animate-slide-up animation-delay-400">
                <h1 className="text-2xl font-semibold text-foreground">
                  {isSignUp ? "Créer un compte" : "Bienvenue"}
                </h1>
                <p className="text-muted-foreground">
                  {isSignUp 
                    ? "Inscrivez-vous pour accéder à votre espace ChatFood"
                    : "Connectez-vous pour accéder à votre espace personnel"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Login/Signup Form */}
          <Card className="backdrop-blur-sm bg-card/80 border-primary/10 shadow-2xl shadow-primary/5 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/20 animate-slide-up animation-delay-200">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <CardTitle className="text-2xl font-semibold">
                  {isSignUp ? "Inscription" : "Connexion"}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {isSignUp 
                    ? "Remplissez les informations ci-dessous"
                    : "Entrez vos identifiants pour continuer"
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 group">
                        <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jean"
                          className="h-12 bg-background/50 border-border focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all duration-200 hover:border-primary/20"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Dupont"
                          className="h-12 bg-background/50 border-border focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all duration-200 hover:border-primary/20"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@example.com"
                      required
                      className="h-12 bg-background/50 border-border focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all duration-200 hover:border-primary/20"
                    />
                  </div>
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="h-12 bg-background/50 border-border focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all duration-200 hover:border-primary/20"
                    />
                    {isSignUp && (
                      <div className="mt-2">
                        <PasswordStrengthIndicator 
                          password={password} 
                          onValidityChange={setIsPasswordValid}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold cta-magnetic transform hover:scale-[1.02] transition-all duration-200" 
                  variant="hero"
                  size="lg"
                  disabled={isLoading || (isSignUp && !isPasswordValid)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Inscription..." : "Connexion..."}
                    </>
                  ) : (
                    isSignUp ? "S'inscrire" : "Se connecter"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">
                    {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
                  </span>
                </div>
              </div>

              {/* Toggle Mode Button */}
              <Button 
                variant="outline" 
                className="w-full h-11 border-border hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-all duration-300"
                onClick={toggleMode}
                type="button"
              >
                <span className="font-medium">
                  {isSignUp ? "Se connecter" : "Créer un compte"}
                </span>
              </Button>

              {/* Alternative Actions */}
              {!isSignUp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full h-11 border-border hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5">
                      <span className="font-medium">Nous contacter</span>
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="secondary" className="w-full h-11 bg-muted hover:bg-muted/80 hover:text-foreground transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5">
                      <span className="font-medium">Essayer la démo</span>
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
