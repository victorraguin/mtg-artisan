import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Package,
  Sparkles,
  Globe,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabase";
import toast from "react-hot-toast";

interface CreatorBenefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}

interface CreatorStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CreatorProgram() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = useState(false);

  const benefits: CreatorBenefit[] = [
    {
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      title: "Revenus Passifs",
      description: "Gagnez de l'argent avec vos créations et services. Fixez vos prix, nous nous occupons du reste.",
      highlight: true,
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Communauté Active",
      description: "Rejoignez une communauté de créateurs passionnés et échangez avec vos clients.",
    },
    {
      icon: <Palette className="h-6 w-6 text-purple-500" />,
      title: "Outils Créatifs",
      description: "Interface intuitive pour présenter vos œuvres et gérer votre portfolio.",
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-500" />,
      title: "Paiements Sécurisés",
      description: "Transactions protégées avec PayPal. Recevez vos paiements automatiquement.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-orange-500" />,
      title: "Analytics Avancées",
      description: "Suivez vos ventes, analysez vos performances et optimisez votre stratégie.",
    },
    {
      icon: <Globe className="h-6 w-6 text-cyan-500" />,
      title: "Visibilité Maximale",
      description: "Votre boutique est visible par tous les collectionneurs de la plateforme.",
    },
  ];

  const steps: CreatorStep[] = [
    {
      number: 1,
      title: "Devenir Artisan",
      description: "Cliquez sur le bouton pour passer votre compte en mode créateur",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      number: 2,
      title: "Créer votre Boutique",
      description: "Configurez votre boutique avec nom, description et image de profil",
      icon: <Package className="h-5 w-5" />,
    },
    {
      number: 3,
      title: "Ajouter vos Créations",
      description: "Uploadez vos œuvres, définissez les prix et descriptions",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      number: 4,
      title: "Commencer à Vendre",
      description: "Votre boutique est en ligne ! Partagez-la et commencez à recevoir des commandes",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  const upgradeToCreator = async () => {
    if (!user || !profile) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (profile.role === "creator") {
      toast.info("Vous êtes déjà artisan !");
      navigate("/creator/shop");
      return;
    }

    setUpgrading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "creator" })
        .eq("id", user.id);

      if (error) throw error;

      // Rafraîchir le profil
      await refreshProfile();

      toast.success("Félicitations ! Vous êtes maintenant artisan !");
      
      // Rediriger vers la page d'onboarding après un court délai
      setTimeout(() => {
        navigate("/creator/onboarding");
      }, 1500);

    } catch (error) {
      console.error("Erreur lors du passage en artisan:", error);
      toast.error("Erreur lors du passage en artisan");
    } finally {
      setUpgrading(false);
    }
  };

  const isCreator = profile?.role === "creator";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Palette className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-light text-foreground tracking-tight mb-6">
              Programme{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Artisans
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transformez votre passion pour Magic: The Gathering en source de revenus. 
              Rejoignez notre communauté d'artisans et vendez vos créations à des collectionneurs du monde entier.
            </p>

            {!isCreator ? (
              <Button
                onClick={upgradeToCreator}
                loading={upgrading}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                <Palette className="h-5 w-5 mr-3" />
                Devenir Artisan Maintenant
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/creator/shop")}
                  size="lg"
                  className="text-lg px-8 py-4 h-auto"
                >
                  <Package className="h-5 w-5 mr-3" />
                  Gérer ma Boutique
                </Button>
                <Button
                  onClick={() => navigate("/dashboard/creator")}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 h-auto"
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Dashboard Créateur
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Pourquoi devenir artisan ?
          </h2>
          <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
            Découvrez tous les avantages de rejoindre notre programme créateur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className={`p-6 text-center hover:scale-105 transition-transform duration-300 ${
                benefit.highlight ? 'ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground/70 leading-relaxed">
                {benefit.description}
              </p>
              {benefit.highlight && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Populaire
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Examples */}
      <div className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground tracking-tight mb-4">
              Potentiel de revenus
            </h2>
            <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
              Exemples de ce que vous pourriez gagner en tant qu'artisan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="text-3xl font-light text-foreground mb-2">50€</div>
              <div className="text-sm text-muted-foreground mb-4">par mois</div>
              <h4 className="font-medium text-foreground mb-3">Artisan Débutant</h4>
              <ul className="text-sm text-muted-foreground/70 space-y-2">
                <li>• 5-10 créations par mois</li>
                <li>• Prix moyen 8-12€</li>
                <li>• Temps partiel</li>
              </ul>
            </Card>

            <Card className="p-8 text-center ring-2 ring-primary/20 bg-primary/5">
              <div className="text-3xl font-light text-foreground mb-2">250€</div>
              <div className="text-sm text-muted-foreground mb-4">par mois</div>
              <h4 className="font-medium text-foreground mb-3">Artisan Confirmé</h4>
              <ul className="text-sm text-muted-foreground/70 space-y-2">
                <li>• 15-25 créations par mois</li>
                <li>• Prix moyen 15-20€</li>
                <li>• Clientèle fidèle</li>
              </ul>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Le plus populaire
                </span>
              </div>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-3xl font-light text-foreground mb-2">500€+</div>
              <div className="text-sm text-muted-foreground mb-4">par mois</div>
              <h4 className="font-medium text-foreground mb-3">Artisan Expert</h4>
              <ul className="text-sm text-muted-foreground/70 space-y-2">
                <li>• 30+ créations par mois</li>
                <li>• Prix moyen 20-35€</li>
                <li>• Services premium</li>
              </ul>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground/60">
              * Revenus indicatifs basés sur l'activité moyenne de nos artisans. Les résultats peuvent varier.
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-foreground tracking-tight mb-4">
            Comment ça fonctionne ?
          </h2>
          <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
            Quatre étapes simples pour commencer à vendre vos créations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {step.number}
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!isCreator && (
        <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-light text-foreground tracking-tight mb-6">
              Prêt à commencer votre aventure d'artisan ?
            </h2>
            <p className="text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines d'artisans qui gagnent déjà de l'argent avec leurs créations Magic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={upgradeToCreator}
                loading={upgrading}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                <CheckCircle className="h-5 w-5 mr-3" />
                Devenir Artisan Gratuitement
              </Button>
              <p className="text-sm text-muted-foreground/60">
                ✓ Gratuit à vie • ✓ Pas de frais cachés • ✓ Support inclus
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message for Creators */}
      {isCreator && (
        <div className="bg-green-500/5 border border-green-500/20 py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-light text-foreground tracking-tight mb-4">
              Vous êtes déjà artisan ! 🎉
            </h2>
            <p className="text-lg text-muted-foreground/80 mb-8">
              Accédez à votre dashboard créateur pour gérer vos ventes et créations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/dashboard/creator")}
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                Mon Dashboard
              </Button>
              <Button
                onClick={() => navigate("/creator/shop")}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto"
              >
                <Package className="h-5 w-5 mr-3" />
                Gérer ma Boutique
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
