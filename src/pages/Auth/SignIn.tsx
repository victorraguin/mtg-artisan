import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const testAccounts = [
    { email: "admin@mtgartisans.com", password: "admin123!", role: "Admin" },
    { email: "alice@artmaster.com", password: "alice123!", role: "Creator" },
    { email: "bob@tokencraft.com", password: "bob123!", role: "Creator" },
    { email: "collector@mtg.com", password: "collector123!", role: "Buyer" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      toast.success("Bienvenue !");
      navigate("/");
    } catch (error: any) {
      if (error.message?.includes("Invalid login credentials")) {
        toast.error(
          "Email ou mot de passe invalide. Veuillez vérifier vos identifiants."
        );
      } else {
        toast.error(error.message || "Échec de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-8 md:py-12 px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/06/Briarhorn-Illustration-by-Nils-Hamm-1024x759.jpg"
          alt="MTG Fantasy Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/95"></div>
      </div>

      <div className="max-w-md w-full space-y-8 md:space-y-10 relative z-10">
        <div className="text-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-3 mb-8 group"
          >
            <div className="relative">
              <Sparkles className="h-10 w-10 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-2xl font-light tracking-wider text-foreground group-hover:text-primary transition-colors duration-300">
              MTG ARTISANS
            </span>
          </Link>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-3">
            Bon retour, Planeswalker
          </h2>
          <p className="text-muted-foreground/80 text-lg">
            Entrez vos identifiants de guilde pour accéder au multivers
          </p>
        </div>

        <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
          <Input
            label="Adresse email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            id="email"
          />

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-3"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                id="password"
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 hover:text-primary transition-colors duration-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Se connecter
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="text-muted-foreground/70 hover:text-primary"
            >
              {showTestAccounts ? "Masquer" : "Afficher"} les comptes de test
            </Button>
          </div>

          {showTestAccounts && (
            <div className="glass rounded-3xl p-6 space-y-3 border border-border/30">
              <p className="text-sm text-foreground mb-4">Comptes de test :</p>
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    fillTestAccount(account.email, account.password)
                  }
                  className="w-full text-left p-3 rounded-2xl bg-card/50 hover:bg-card border border-border/30 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="text-sm text-foreground truncate">
                    {account.email}
                  </div>
                  <div className="text-xs text-muted-foreground/60">
                    {account.role}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className="text-muted-foreground/70">
              Vous n'avez pas de compte ?{" "}
              <Link
                to="/auth/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
