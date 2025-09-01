import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Eye, EyeOff, Sparkles, Palette, Package } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"buyer" | "creator">("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(email, password, displayName);
      if (error) throw error;

      toast.success("Compte créé avec succès !");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Échec de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://draftsim.com/wp-content/uploads/2022/05/Alseid-of-Lifes-Bounty-Illustration-by-Magali-Villeneuve.jpg"
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
              MANASHOP
            </span>
          </Link>
          <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight mb-3">
            Rejoignez notre communauté
          </h2>
          <p className="text-muted-foreground/80 text-lg">
            Créez un compte pour commencer à acheter ou vendre
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

          <Input
            label="Nom d'affichage"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Votre nom"
            id="displayName"
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
                placeholder="Créez un mot de passe fort"
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-4">
              Choisissez votre voie :
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  role === "buyer"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 bg-card/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === "buyer"}
                  onChange={(e) => setRole(e.target.value as "buyer")}
                  className="sr-only"
                />
                <div className="text-center">
                  <Package className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-lg font-medium text-foreground">
                    Collectionneur
                  </div>
                  <div className="text-sm text-muted-foreground/70">
                    Commandez de l'art légendaire
                  </div>
                </div>
              </label>

              <label
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  role === "creator"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 bg-card/50"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === "creator"}
                  onChange={(e) => setRole(e.target.value as "creator")}
                  className="sr-only"
                />
                <div className="text-center">
                  <Palette className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-lg font-medium text-foreground">
                    Artisan
                  </div>
                  <div className="text-sm text-muted-foreground/70">
                    Créez des services magiques
                  </div>
                </div>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Créer le compte
          </Button>

          <div className="text-center">
            <p className="text-muted-foreground/70">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/auth/signin"
                className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
