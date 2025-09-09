import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Palette,
  Wrench,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { ArtistCarousel } from "../components/UI/ArtistCarousel";

export function Home() {
  const { t } = useTranslation();

  const featuredCategories = [
    {
      name: "Card Alters",
      description: t("home.featuredCategories.cardAlters.description"),
      image:
        "https://draftsim.com/wp-content/uploads/2023/10/To-the-Slaughter-Illustration-by-Christine-Choi-1024x636.jpg",
      link: "/search?category=Card+Alters",
      popular: true,
    },
    {
      name: "Custom Tokens",
      description: t("home.featuredCategories.customTokens.description"),
      image:
        "https://draftsim.com/wp-content/uploads/2022/06/Banishing-Light-%E2%80%93-Will-Murai-1024x748.jpg",
      link: "/search?category=Custom+Tokens",
      popular: true,
    },
    {
      name: "Deckbuilding",
      description: t("home.featuredCategories.deckbuilding.description"),
      image:
        "https://draftsim.com/wp-content/uploads/2022/06/Promise-of-Tomorrow-%E2%80%93-Seb-McKinnon-2-1024x749.jpg",
      link: "/search?type=service&category=Deckbuilding",
      popular: false,
    },
    {
      name: "Playmats",
      description: t("home.featuredCategories.playmats.description"),
      image:
        "https://draftsim.com/wp-content/uploads/2022/06/Gods-Demigods-Constellation-%E2%80%93-Jason-A.-Engle-1-1024x606.jpg",
      link: "/search?category=Playmats",
      popular: true,
    },
  ];

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <img
            src="https://images3.alphacoders.com/558/558484.jpg"
            alt="Magic cards background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/95"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-6 py-3 rounded-2xl glass text-primary text-sm font-light mb-12 border border-primary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("home.hero.tagline")}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-light mb-8 text-foreground leading-tight animate-fade-in tracking-tight">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              <span>{t("home.hero.title.part1")}</span>
              <span className="text-primary">{t("home.hero.title.part2")}</span>
              <span>{t("home.hero.title.part3")}</span>
            </div>
          </h1>

          <p
            className="text-lg md:text-xl lg:text-2xl text-muted-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in px-4"
            style={{ animationDelay: "0.2s" }}
          >
            {t("home.hero.description")}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center animate-fade-in px-4"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              to="/search"
              className="gradient-border rounded-2xl overflow-hidden group transform hover:scale-[1.02] transition-all duration-300"
            >
              <span className="block px-8 md:px-10 py-4 md:py-5 text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-300 bg-card">
                <Search className="inline mr-2 h-5 w-5" />
                {t("home.hero.explore")}
                <ArrowRight className="inline ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              to="/auth/signup"
              className="px-8 md:px-10 py-4 md:py-5 rounded-2xl font-medium transition-all duration-300 text-sm md:text-base glass border border-border/30 hover:border-primary/30 hover:text-primary hover:scale-[1.02] transform"
            >
              {t("home.hero.becomeCreator")}
            </Link>
          </div>

          {/* Stats preview */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-20 md:mt-24 animate-fade-in px-4"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-2">
                500+
              </div>
              <div className="text-muted-foreground/60 text-sm">
                {t("home.hero.stats.artists")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-2">
                50+
              </div>
              <div className="text-muted-foreground/60 text-sm">{t("home.hero.stats.countries")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-2">
                99%
              </div>
              <div className="text-muted-foreground/60 text-sm">
                {t("home.hero.stats.satisfaction")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-foreground px-4 tracking-tight">
            {t("home.categories.title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto px-4">
            {t("home.categories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group bg-card rounded-3xl overflow-hidden border border-border/30 hover:border-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 relative"
            >
              {category.popular && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    {t("home.categories.popular")}
                  </div>
                </div>
              )}
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/60 transition-all duration-500" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-lg md:text-xl font-light text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Artists Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-foreground px-4 tracking-tight">
            {t("home.artists.title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto px-4">
            {t("home.artists.subtitle")}
          </p>
        </div>

        <ArtistCarousel />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-foreground tracking-tight">
              {t("home.features.title")}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground/70 max-w-3xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div className="text-center">
              <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-primary/20">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-4">
                {t("home.features.verified.title")}
              </h3>
              <p className="text-muted-foreground/70 text-center leading-relaxed">
                {t("home.features.verified.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-primary/20">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-4">
                {t("home.features.network.title")}
              </h3>
              <p className="text-muted-foreground/70 text-center leading-relaxed">
                {t("home.features.network.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-primary/20">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-4">
                {t("home.features.secure.title")}
              </h3>
              <p className="text-muted-foreground/70 text-center leading-relaxed">
                {t("home.features.secure.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
        <div className="glass rounded-3xl p-12 md:p-20 text-center relative overflow-hidden border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-foreground tracking-tight">
              {t("home.cta.title")}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t("home.cta.subtitle")}
            </p>
            <Link
              to="/search"
              className="gradient-border rounded-2xl overflow-hidden group inline-flex items-center transform hover:scale-[1.02] transition-all duration-300"
            >
              <span className="block px-10 md:px-12 py-4 md:py-5 text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-300 bg-card">
                <Palette className="inline mr-2 h-5 w-5" />
                {t("home.cta.explore")}
                <ArrowRight className="inline ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
