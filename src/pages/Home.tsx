import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Palette, Wrench, Star, ArrowRight, Sparkles, TrendingUp, Users, Award } from 'lucide-react';

export function Home() {
  const featuredCategories = [
    {
      name: 'Card Alters', 
      description: 'Transform your favorite cards into unique artwork',
      image: 'https://draftsim.com/wp-content/uploads/2023/10/To-the-Slaughter-Illustration-by-Christine-Choi-1024x636.jpg', 
      link: '/search?category=Card+Alters'
    },
    {
      name: 'Custom Tokens',
      description: 'Professional tokens and game pieces',
      image: 'https://draftsim.com/wp-content/uploads/2022/06/Banishing-Light-%E2%80%93-Will-Murai-1024x748.jpg',
      link: '/search?category=Custom+Tokens'
    },
    {
      name: 'Deckbuilding',
      description: 'Improve your gameplay with expert guidance',
      image: 'https://draftsim.com/wp-content/uploads/2022/06/Promise-of-Tomorrow-%E2%80%93-Seb-McKinnon-2-1024x749.jpg',
      link: '/search?type=service&category=Deckbuilding'
    },
    {
      name: 'Playmats',
      description: 'Custom playmats, deck boxes, and accessories',
      image: 'https://draftsim.com/wp-content/uploads/2022/06/Gods-Demigods-Constellation-%E2%80%93-Jason-A.-Engle-1-1024x606.jpg',
      link: '/search?category=Playmats'
    }
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <img
            src="https://images3.alphacoders.com/558/558484.jpg"
            alt="Magic cards background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/85"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              The Premier MTG Artisan Marketplace
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight animate-fade-in">
            Premium MTG Art Marketplace
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Commission custom card alters, tokens, and professional services from talented artists worldwide
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/search"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="mr-2 h-5 w-5" />
              Explore Marketplace
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link
              to="/auth/signup"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Become a Creator
            </Link>
          </div>
          
          {/* Stats preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">10k+</div>
              <div className="text-muted-foreground text-sm">Custom Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">500+</div>
              <div className="text-muted-foreground text-sm">Active Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">99%</div>
              <div className="text-muted-foreground text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Popular Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From custom artwork to professional services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCategories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            >
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
              Why Choose MTG Artisans?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The trusted marketplace for quality MTG artwork and services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Verified Artists</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                All artists are verified professionals ensuring quality work for your cards.
              </p>
            </div>
            <div>
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Global Network</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Connect with talented artists worldwide, each bringing unique skills and expertise.
              </p>
            </div>
            <div>
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Secure Transactions</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                Secure payments with buyer protection and satisfaction guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-display">
            Ready to Find Your Perfect Artist?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of players who've commissioned amazing custom artwork
          </p>
          <Link
            to="/search"
            className="inline-flex items-center bg-white text-primary px-10 py-5 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 group shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            <Palette className="mr-2 h-5 w-5" />
            Start Exploring
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}