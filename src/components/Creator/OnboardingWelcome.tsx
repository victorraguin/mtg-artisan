import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Store,
  Package,
  Palette,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../UI/Card";
import { Button } from "../UI/Button";

interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  completed?: boolean;
}

interface OnboardingWelcomeProps {
  hasShop: boolean;
  hasProducts: boolean;
}

export function OnboardingWelcome({ hasShop, hasProducts }: OnboardingWelcomeProps) {
  const steps: OnboardingStep[] = [
    {
      number: 1,
      title: "Créer votre Boutique",
      description: "Configurez le nom, la description et l'apparence de votre boutique",
      icon: <Store className="h-5 w-5" />,
      link: "/creator/shop",
      completed: hasShop,
    },
    {
      number: 2,
      title: "Ajouter vos Créations",
      description: "Uploadez vos premières œuvres avec prix et descriptions",
      icon: <Palette className="h-5 w-5" />,
      link: "/creator/products/new",
      completed: hasProducts,
    },
    {
      number: 3,
      title: "Promouvoir votre Boutique",
      description: "Partagez votre lien et commencez à recevoir des commandes",
      icon: <Users className="h-5 w-5" />,
      link: "/dashboard/creator",
      completed: false,
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const nextStep = steps.find(step => !step.completed);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-light text-foreground tracking-tight mb-4">
          Bienvenue chez les Artisans ! 🎉
        </h1>
        <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
          Félicitations ! Vous êtes maintenant artisan ManaShop. 
          Suivez ces étapes pour configurer votre boutique et commencer à vendre.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-foreground">
              Progression de l'installation
            </h3>
            <div className="text-sm text-muted-foreground">
              {completedSteps}/{steps.length} étapes terminées
            </div>
          </div>
          
          <div className="w-full bg-muted/30 rounded-full h-3 mb-4">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps / steps.length) * 100}%` }}
            />
          </div>

          {completedSteps === steps.length ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Configuration terminée ! Votre boutique est prête.</span>
            </div>
          ) : (
            <div className="flex items-center text-primary">
              <TrendingUp className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Prochaine étape : {nextStep?.title}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {steps.map((step) => (
          <Card 
            key={step.number} 
            className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
              step.completed 
                ? 'bg-green-500/5 border-green-500/20' 
                : step === nextStep 
                  ? 'bg-primary/5 border-primary/20 ring-2 ring-primary/10' 
                  : 'hover:bg-muted/30'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-primary/10 border border-primary/20'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                  step.completed 
                    ? 'bg-green-500/10 text-green-600' 
                    : step === nextStep 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/50 text-muted-foreground'
                }`}>
                  Étape {step.number}
                </div>
              </div>

              <h3 className="text-lg font-medium text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground/70 mb-4 leading-relaxed">
                {step.description}
              </p>

              <Link to={step.link}>
                <Button 
                  variant={step.completed ? "outline" : step === nextStep ? "default" : "outline"}
                  size="sm" 
                  className="w-full"
                >
                  {step.completed ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Terminé
                    </>
                  ) : step === nextStep ? (
                    <>
                      Commencer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      À faire
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Reminder */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="text-2xl font-light text-foreground tracking-tight">
            Rappel des avantages artisan
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium text-foreground">Revenus Passifs</div>
                <div className="text-sm text-muted-foreground/70">
                  Gagnez jusqu'à 500€/mois
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium text-foreground">Communauté Active</div>
                <div className="text-sm text-muted-foreground/70">
                  Milliers de collectionneurs
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <div className="font-medium text-foreground">Outils Intégrés</div>
                <div className="text-sm text-muted-foreground/70">
                  Dashboard complet inclus
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {nextStep ? (
          <Link to={nextStep.link}>
            <Button size="lg" className="w-full sm:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              Continuer : {nextStep.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard/creator">
            <Button size="lg" className="w-full sm:w-auto">
              <TrendingUp className="h-5 w-5 mr-2" />
              Accéder au Dashboard
            </Button>
          </Link>
        )}
        
        <Link to="/creator/shop">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Store className="h-5 w-5 mr-2" />
            Gérer la Boutique
          </Button>
        </Link>
      </div>
    </div>
  );
}
