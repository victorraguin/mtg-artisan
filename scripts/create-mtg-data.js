// Script pour créer de fausses données MTG complètes
import { createClient } from "@supabase/supabase-js";

// Configuration Supabase
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://jihtpkegbsjavmmdcbhm.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppaHRwa2VnYnNqYXZtbWRjYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMjkwOSwiZXhwIjoyMDcxOTA4OTA5fQ.QaIzq7YG4VvzKeEnI1riMwNOLtCwM0x9y235kz1eFUc";

// Vérification des variables d'environnement
if (!supabaseUrl) {
  console.error("❌ ERREUR: Variable VITE_SUPABASE_URL manquante");
  console.log("📝 Ajoutez cette ligne à votre fichier .env:");
  console.log("VITE_SUPABASE_URL=https://jihtpkegbsjavmmdcbhm.supabase.co");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("❌ ERREUR: Variable SUPABASE_SERVICE_ROLE_KEY manquante");
  console.log("📝 Ajoutez cette ligne à votre fichier .env:");
  console.log("SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici");
  console.log("🔑 Trouvez votre service role key dans:");
  console.log("   Supabase Dashboard > Settings > API > service_role (secret)");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// URLs d'images MTG réelles - Cartes alters authentiques
const MTG_IMAGES = {
  cards: [
    // Cartes alters réelles de la communauté MTG
    "https://scontent-cdg4-2.xx.fbcdn.net/v/t1.6435-9/165486885_724329878251367_2571558592749741979_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=33274f&_nc_ohc=BDmoTl0da6QQ7kNvwHpGatg&_nc_oc=Adl4UR3fcWrjU5V4D_7E9oBS5P-XKEihDJaeES7mq3mGyxKDUnd2c5H6ROWaOvRT30DOnkckDNMR2aMafRv6PJ72&_nc_zt=23&_nc_ht=scontent-cdg4-2.xx&_nc_gid=QPT-SNrKjkIlYFKqiPuzFg&oh=00_AfVEL2KiNox3BFf2kkq6AzngZGudfr20fpSxS0jVUA9rdg&oe=68DD8BD9", // Alter artistique #1
    "https://scontent-cdg4-3.xx.fbcdn.net/v/t39.30808-6/487428049_1215086933955352_1615896959296509219_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=m2ss78oBM3IQ7kNvwHi6G7R&_nc_oc=AdnMxsm10DD74eG1CjF2uev3Oc4fxbSDSiXFKLBUBNgLIbsTAYQ_xHWrYj1qSvDgHiAkvr6e4vUv5TOIocBKq6yo&_nc_zt=23&_nc_ht=scontent-cdg4-3.xx&_nc_gid=LSaOuFSkNv40ufRsZ2ww9w&oh=00_AfUak4Ub4UNo0_thAdT1fZPbK1yelUpTz3QnkwuoNoEp1w&oe=68BBF41A", // Alter artistique #2
    "https://scontent-cdg4-3.xx.fbcdn.net/v/t39.30808-6/488530045_645284054897990_8615263008455168844_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=HIFijE2ECscQ7kNvwF2oz7a&_nc_oc=AdnrXgcjUsy6HUqo1mRGvR3OqeMWFSWZGFd1U82aN4T_x-No9LS5IW8dtzVXBTSOppa8vUoE-VOJdpTnP1bVeQJd&_nc_zt=23&_nc_ht=scontent-cdg4-3.xx&_nc_gid=kON8NiIcTtZV-aLa1xewSA&oh=00_AfWxbwWm2MUO-YI3q2IuGh-tmDP_tvsepG9n_EEu4BCeoA&oe=68BBE39D", // Alter artistique #3
    "https://scontent-cdg4-1.xx.fbcdn.net/v/t39.30808-6/473425900_1788081055062815_1322690864825791872_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=wq9kGYlUhL0Q7kNvwFXHxUF&_nc_oc=Adlc9XdUVGcipqBdnM7cF5X3G-PEwMyyAXxGe_n7RH8z_PzhtJp3wW4y2ol7mvU5LUCbHvq-K2Ju6CazBMsujSb2&_nc_zt=23&_nc_ht=scontent-cdg4-1.xx&_nc_gid=DBIGDe0kLs76jdbBIu8LvA&oh=00_AfXmqQZM2vnqUyfeNUrD_-U9jz0h5HPYWwZiXFvfwc2v_w&oe=68BC00A4", // Alter artistique #4
    "https://scontent-cdg4-1.xx.fbcdn.net/v/t39.30808-6/475275654_1329962148328978_8215768876984065638_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=104&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=OgG5igFgXbEQ7kNvwH_mq-8&_nc_oc=AdlYxYLTC2F_-z9SNQ8n6Q7w8eAybyDeLxA5l9cCvjHKVAyFcEiIzEYm0Uvo4XvLsCjDDcrKRaqc93BPFVVL5Fdi&_nc_zt=23&_nc_ht=scontent-cdg4-1.xx&_nc_gid=b8IrsllnyFJsPwIaSJB3Hg&oh=00_AfUiET5q5ERsRis7A2ehEfozb-LCMd4co8WIQeGXpMEDfA&oe=68BC04F2", // Alter artistique #5
    "https://scontent-cdg4-3.xx.fbcdn.net/v/t39.30808-6/505360390_695191839907211_3460937335861126871_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=127cfc&_nc_ohc=lb6rbLgRl2kQ7kNvwE_EZ8q&_nc_oc=Admht1r18p3lG82CZ3mR_oD-qp3XMfNOWdUefVM9q3hm0g3nFYlhC6XWR35Roh81x4kNHzeRZE4v_Tk7JNWs4rWj&_nc_zt=23&_nc_ht=scontent-cdg4-3.xx&_nc_gid=LsSyrdUiTTzLoHUUyKFZaQ&oh=00_AfUeWXYZKvR81h_Yk1aHMmaCPV6xFnvAGLZbu1s9PpuzTA&oe=68BC0594", // Alter artistique #6
    "https://scontent-cdg4-1.xx.fbcdn.net/v/t39.30808-6/498919336_23999079636366754_5329629073552345150_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=h8EwRSWrbJoQ7kNvwFDnpDf&_nc_oc=Adm21nDqQzZAb_lP3o0Amn0UBOVBuYRap3SkEWRRyPi-BbL6ALvx2qwSpwjdEfZ9_AC8PDPcxl_fyv3nLlKEw647&_nc_zt=23&_nc_ht=scontent-cdg4-1.xx&_nc_gid=KooR8kHKs0mkszVLLHwZIA&oh=00_AfWvMru_miwgUeFtDX0xMkP3ka1dAwIThVy0IW-pQoM6qQ&oe=68BBE514", // Alter artistique #7
    "https://scontent-cdg4-1.xx.fbcdn.net/v/t39.30808-6/499848441_24106641125610604_6524984956620424330_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=XnaLV6EDwN0Q7kNvwF31oU8&_nc_oc=AdnSONkzM9bVFis5NjB2EexyMh2aWqjz2LP8m-7s2-kPD_9cCYGm95z3ezDEFaSAJwVMFpRcrPAT--UDnUqv1zgB&_nc_zt=23&_nc_ht=scontent-cdg4-1.xx&_nc_gid=JlSn-UKffmyqufC-sArrQA&oh=00_AfVrRe5yVsD_0LB4WNLj31V0OBGYGg2UerPwhsqKXj4BTA&oe=68BBE900", // Alter artistique #8
  ],
  tokens: [
    "https://cards.scryfall.io/art_crop/front/1/2/12f03971-5353-4d6c-8bc9-8c3f7c9c4d6e.jpg",
    "https://cards.scryfall.io/art_crop/front/2/3/23a4b5c6-7d8e-4f2a-9b3c-5d6e7f8a9b0c.jpg",
    "https://cards.scryfall.io/art_crop/front/3/4/34c5d6e7-8f9a-4b2c-9d3e-6f7a8b9c0d1e.jpg",
    "https://cards.scryfall.io/art_crop/front/4/5/45d6e7f8-9a0b-4c3d-9e4f-7a8b9c0d1e2f.jpg",
  ],
  banners: [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop", // Fantasy art
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop", // Magic theme
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop", // Dark fantasy
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop", // Medieval
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=400&fit=crop", // Dragons
  ],
  logos: [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop",
  ],
  profiles: [
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150",
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150",
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150",
    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150",
    "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150",
    "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150",
  ],
};

// Données des utilisateurs de test
const testUsers = [
  {
    email: "admin@mtgartisan.com",
    password: "admin123!",
    role: "admin",
    display_name: "Admin MTG",
    country: "United States",
    bio: "Administrateur de la plateforme MTG Artisan",
  },
  // Créateurs/Vendeurs
  {
    email: "alice@alteredreality.com",
    password: "alice123!",
    role: "creator",
    display_name: "Alice Altered",
    country: "Canada",
    bio: "Artiste professionnelle spécialisée dans les alters MTG depuis 8 ans. Style réaliste et extensions de paysages.",
    shop: {
      name: "Altered Reality Studio",
      slug: "altered-reality-studio",
      bio: "Studio d'art professionnel spécialisé dans les modifications de cartes Magic. Nous transformons vos cartes préférées en œuvres d'art uniques.",
      policies:
        "Délai de livraison : 2-3 semaines. Garantie satisfaction ou remboursé. Envoi sécurisé avec tracking.",
      paypal_email: "alice@alteredreality.com",
    },
  },
  {
    email: "bob@tokenforge.com",
    password: "bob123!",
    role: "creator",
    display_name: "Bob TokenForge",
    country: "United Kingdom",
    bio: "Créateur de tokens personnalisés et proxies artistiques. 12 ans d'expérience dans l'art numérique.",
    shop: {
      name: "Token Forge",
      slug: "token-forge",
      bio: "Création de tokens personnalisés, proxies artistiques et cartes de collection. Chaque pièce est unique et faite avec passion.",
      policies:
        "Livraison numérique instantanée. Impressions physiques sous 1 semaine. Révisions illimitées incluses.",
      paypal_email: "bob@tokenforge.com",
    },
  },
  {
    email: "sarah@judgeacademy.com",
    password: "sarah123!",
    role: "creator",
    display_name: "Judge Sarah",
    country: "Germany",
    bio: "Juge niveau 2, coach compétitif et consultante en règles. 15 ans d'expérience en tournois.",
    shop: {
      name: "Judge Academy Services",
      slug: "judge-academy-services",
      bio: "Services de coaching, consultation en règles et préparation aux tournois par une juge certifiée niveau 2.",
      policies:
        "Sessions de coaching en ligne. Annulation possible 24h avant. Matériel pédagogique inclus.",
      paypal_email: "sarah@judgeacademy.com",
    },
  },
  {
    email: "mike@deckmaster.com",
    password: "mike123!",
    role: "creator",
    display_name: "DeckMaster Mike",
    country: "Australia",
    bio: "Constructeur de decks professionnel, spécialiste EDH et Modern. Joueur compétitif depuis 20 ans.",
    shop: {
      name: "DeckMaster Pro",
      slug: "deckmaster-pro",
      bio: "Construction de decks personnalisés, optimisation de listes et conseils stratégiques pour tous les formats.",
      policies:
        "Livraison des listes sous 48h. Révisions gratuites pendant 1 mois. Support technique inclus.",
      paypal_email: "mike@deckmaster.com",
    },
  },
  {
    email: "luna@moonbeamalters.com",
    password: "luna123!",
    role: "creator",
    display_name: "Luna Moonbeam",
    country: "Japan",
    bio: "Artiste spécialisée dans les alters kawaii et les extensions panoramiques. Style unique inspiré de l'anime.",
    shop: {
      name: "Moonbeam Alters",
      slug: "moonbeam-alters",
      bio: "Alters artistiques avec un style kawaii unique. Spécialisation dans les personnages anime et les paysages fantastiques.",
      policies:
        "Délai 3-4 semaines. Photos de progression incluses. Emballage ultra-sécurisé.",
      paypal_email: "luna@moonbeamalters.com",
    },
  },
  {
    email: "erik@nordicforge.com",
    password: "erik123!",
    role: "creator",
    display_name: "Erik Nordic",
    country: "Norway",
    bio: "Créateur d'accessoires MTG artisanaux : deck boxes, tapis de jeu et tokens en bois gravé.",
    shop: {
      name: "Nordic Forge Crafts",
      slug: "nordic-forge-crafts",
      bio: "Artisanat nordique pour joueurs MTG. Deck boxes en bois, tapis personnalisés et accessoires gravés à la main.",
      policies:
        "Fabrication artisanale 2-3 semaines. Bois certifié durable. Gravure personnalisée incluse.",
      paypal_email: "erik@nordicforge.com",
    },
  },
  // Acheteurs
  {
    email: "collector@mtgfan.com",
    password: "collector123!",
    role: "buyer",
    display_name: "MTG Collector",
    country: "United States",
    bio: "Collectionneur passionné depuis 25 ans. Toujours à la recherche de pièces uniques et d'artwork personnalisé.",
  },
  {
    email: "player@edhlover.com",
    password: "player123!",
    role: "buyer",
    display_name: "EDH Lover",
    country: "France",
    bio: "Joueur EDH compétitif. J'adore personnaliser mes decks avec des alters et tokens uniques.",
  },
  {
    email: "casual@mtgcasual.com",
    password: "casual123!",
    role: "buyer",
    display_name: "Casual Player",
    country: "Brazil",
    bio: "Joueur casual qui aime les belles cartes et les accessoires originaux.",
  },
  {
    email: "competitive@protour.com",
    password: "competitive123!",
    role: "buyer",
    display_name: "Pro Player",
    country: "South Korea",
    bio: "Joueur professionnel cherchant toujours à optimiser mes decks et ma stratégie.",
  },
];

// Catégories MTG
const categories = [
  // Catégories produits
  {
    name: "Alters",
    type: "product",
    mtg_scope: "Modifications artistiques de cartes existantes",
  },
  {
    name: "Tokens",
    type: "product",
    mtg_scope: "Jetons personnalisés pour le jeu",
  },
  {
    name: "Proxies",
    type: "product",
    mtg_scope: "Reproductions artistiques de cartes",
  },
  { name: "Playmat", type: "product", mtg_scope: "Tapis de jeu personnalisés" },
  {
    name: "Deck Box",
    type: "product",
    mtg_scope: "Boîtes de rangement pour decks",
  },
  {
    name: "Sleeves",
    type: "product",
    mtg_scope: "Protège-cartes personnalisés",
  },
  {
    name: "Life Counter",
    type: "product",
    mtg_scope: "Compteurs de vie artisanaux",
  },
  { name: "Dice", type: "product", mtg_scope: "Dés personnalisés pour MTG" },

  // Catégories services
  {
    name: "Coaching",
    type: "service",
    mtg_scope: "Cours particuliers et coaching de jeu",
  },
  {
    name: "Deckbuilding",
    type: "service",
    mtg_scope: "Construction et optimisation de decks",
  },
  {
    name: "Rules Consultation",
    type: "service",
    mtg_scope: "Consultation sur les règles du jeu",
  },
  {
    name: "Tournament Prep",
    type: "service",
    mtg_scope: "Préparation aux tournois",
  },
  {
    name: "Card Evaluation",
    type: "service",
    mtg_scope: "Évaluation et expertise de cartes",
  },
  {
    name: "Collection Management",
    type: "service",
    mtg_scope: "Gestion et organisation de collections",
  },
];

// Produits exemples
const sampleProducts = [
  {
    title: "Alter Lightning Bolt - Style Réaliste",
    description:
      "Modification artistique d'un Lightning Bolt avec extension du paysage en style réaliste. L'éclair traverse tout l'artwork avec des détails saisissants.",
    price: 45.0,
    type: "physical",
    category: "Alters",
    tags: ["alter", "lightning-bolt", "réaliste", "rouge", "éclair"],
    attributes: {
      card_name: "Lightning Bolt",
      set: "Any",
      language: "Français/Anglais",
      condition_required: "NM/LP",
      style: "Extension paysage",
    },
    lead_time_days: 14,
    stock: 5,
  },
  {
    title: "Token Dragon 5/5 - Artwork Anime",
    description:
      "Token dragon 5/5 avec artwork dans le style anime. Impression haute qualité sur carton premium avec finition mate.",
    price: 8.5,
    type: "physical",
    category: "Tokens",
    tags: ["token", "dragon", "anime", "5/5", "rouge"],
    attributes: {
      power: "5",
      toughness: "5",
      creature_type: "Dragon",
      colors: ["Rouge"],
      art_style: "Anime",
    },
    lead_time_days: 3,
    stock: 50,
  },
  {
    title: "Playmat EDH - Paysage Fantastique",
    description:
      "Tapis de jeu format EDH (60x35cm) avec un magnifique paysage fantastique. Surface de jeu optimale et base antidérapante.",
    price: 35.0,
    type: "physical",
    category: "Playmat",
    tags: ["playmat", "edh", "commander", "paysage", "fantastique"],
    attributes: {
      size: "60x35cm",
      material: "Tissu premium",
      base: "Caoutchouc antidérapant",
      format: "EDH/Commander",
    },
    lead_time_days: 7,
    stock: 15,
  },
  {
    title: "Deck Box Bois Gravé - Symboles Guildes",
    description:
      "Deck box artisanal en bois de chêne avec gravure des 10 symboles de guildes de Ravnica. Capacité 100 cartes sleeved.",
    price: 75.0,
    type: "physical",
    category: "Deck Box",
    tags: ["deck-box", "bois", "gravure", "guildes", "ravnica", "artisanal"],
    attributes: {
      material: "Chêne massif",
      capacity: "100 cartes sleeved",
      finish: "Vernis naturel",
      engraving: "Symboles Guildes Ravnica",
    },
    lead_time_days: 21,
    stock: 8,
  },
  {
    title: "Proxy Black Lotus - Artwork Alternatif",
    description:
      "Proxy artistique du Black Lotus avec artwork alternatif dans un style steampunk. Impression haute qualité, non-tournoi.",
    price: 25.0,
    type: "physical",
    category: "Proxies",
    tags: ["proxy", "black-lotus", "steampunk", "power-nine", "alternatif"],
    attributes: {
      card_name: "Black Lotus",
      art_style: "Steampunk",
      usage: "Casual uniquement",
      quality: "Premium",
    },
    lead_time_days: 5,
    stock: 20,
  },
  {
    title: "Compteur de Vie Digital LCD",
    description:
      "Compteur de vie numérique avec écran LCD, boutons ergonomiques et design MTG. Batterie longue durée incluse.",
    price: 28.0,
    type: "physical",
    category: "Life Counter",
    tags: ["life-counter", "digital", "lcd", "batterie", "ergonomique"],
    attributes: {
      display: "LCD rétroéclairé",
      range: "0-999",
      battery: "CR2032 incluse",
      players: "1-4 joueurs",
    },
    lead_time_days: 2,
    stock: 25,
  },
];

// Services exemples
const sampleServices = [
  {
    title: "Coaching EDH Personnalisé",
    description:
      "Session de coaching individuel pour améliorer votre jeu EDH. Analyse de vos decks, conseils stratégiques et techniques avancées.",
    base_price: 50.0,
    delivery_days: 1,
    category: "Coaching",
    requires_brief: true,
    slots_config: {
      duration_hours: 2,
      available_days: ["lundi", "mercredi", "vendredi", "samedi"],
      timezone: "CET",
    },
  },
  {
    title: "Construction Deck Commander",
    description:
      "Je construis votre deck Commander personnalisé selon votre budget et style de jeu. Liste optimisée et guide stratégique inclus.",
    base_price: 75.0,
    delivery_days: 3,
    category: "Deckbuilding",
    requires_brief: true,
    slots_config: {
      budget_tiers: [
        "Budget (<100€)",
        "Mid-range (100-300€)",
        "High-end (300€+)",
      ],
      includes: ["Liste optimisée", "Guide stratégique", "Alternatives budget"],
    },
  },
  {
    title: "Consultation Règles MTG",
    description:
      "Consultation avec un juge certifié pour clarifier les règles complexes, interactions de cartes et situations de tournoi.",
    base_price: 30.0,
    delivery_days: 1,
    category: "Rules Consultation",
    requires_brief: true,
    slots_config: {
      session_length: "1 heure",
      format: "Visioconférence",
      follow_up: "Email de synthèse inclus",
    },
  },
  {
    title: "Préparation Tournoi Compétitif",
    description:
      "Programme complet de préparation pour tournois compétitifs : analyse du méta, sideboard, stratégies de matchup.",
    base_price: 120.0,
    delivery_days: 7,
    category: "Tournament Prep",
    requires_brief: true,
    slots_config: {
      format_supported: ["Modern", "Pioneer", "Standard", "Legacy"],
      includes: ["Analyse méta", "Guide sideboard", "3 sessions coaching"],
    },
  },
  {
    title: "Évaluation Collection MTG",
    description:
      "Évaluation professionnelle de votre collection avec prix de marché actuels, état des cartes et conseils de vente.",
    base_price: 85.0,
    delivery_days: 5,
    category: "Card Evaluation",
    requires_brief: false,
    slots_config: {
      max_cards: 500,
      report_includes: ["Valeur totale", "Top cards", "Recommandations vente"],
      format: "PDF détaillé",
    },
  },
  {
    title: "Organisation Collection Numérique",
    description:
      "Je numérise et organise votre collection dans une base de données avec photos, prix et historique des variations.",
    base_price: 150.0,
    delivery_days: 10,
    category: "Collection Management",
    requires_brief: true,
    slots_config: {
      tools_used: ["Deckbox", "MTGGoldfish", "Feuille Excel personnalisée"],
      includes: ["Photos HD", "Base de données", "Suivi prix automatique"],
    },
  },
];

async function createMTGData() {
  console.log("🎴 Création des données MTG complètes...\n");

  try {
    // 1. Créer les utilisateurs
    console.log("👥 Création des utilisateurs...");
    const userIds = {};

    for (const userData of testUsers) {
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        });

        if (error && !error.message.includes("already registered")) {
          console.error(
            `❌ Erreur utilisateur ${userData.email}:`,
            error.message
          );
          continue;
        }

        const userId = data?.user?.id || (await getUserByEmail(userData.email));
        if (!userId) continue;

        userIds[userData.email] = userId;

        // Créer le profil
        await supabase.from("profiles").upsert({
          id: userId,
          role: userData.role,
          display_name: userData.display_name,
          avatar_url: getRandomImage(MTG_IMAGES.profiles),
          country: userData.country,
          bio: userData.bio,
        });

        console.log(`✅ Utilisateur créé: ${userData.display_name}`);
      } catch (err) {
        console.error(`❌ Erreur pour ${userData.email}:`, err.message);
      }
    }

    // 2. Créer les catégories
    console.log("\n📂 Création des catégories...");
    const categoryIds = {};

    for (const category of categories) {
      const { data, error } = await supabase
        .from("categories")
        .upsert(category)
        .select();
      if (!error && data?.[0]) {
        categoryIds[category.name] = data[0].id;
        console.log(`✅ Catégorie créée: ${category.name}`);
      }
    }

    // 3. Créer les boutiques
    console.log("\n🏪 Création des boutiques...");
    const shopIds = {};

    for (const userData of testUsers) {
      if (userData.role === "creator" && userData.shop) {
        const userId = userIds[userData.email];
        if (!userId) continue;

        const shopData = {
          owner_id: userId,
          name: userData.shop.name,
          slug: userData.shop.slug,
          banner_url: getRandomImage(MTG_IMAGES.banners),
          logo_url: getRandomImage(MTG_IMAGES.logos),
          bio: userData.shop.bio,
          policies: userData.shop.policies,
          paypal_email: userData.shop.paypal_email,
          is_verified: Math.random() > 0.3,
          rating_avg: (Math.random() * 2 + 3).toFixed(1),
          country: userData.country,
        };

        const { data, error } = await supabase
          .from("shops")
          .upsert(shopData)
          .select();
        if (!error && data?.[0]) {
          shopIds[userData.email] = data[0].id;
          console.log(`✅ Boutique créée: ${userData.shop.name}`);

          // Créer profil de livraison par défaut
          const { data: shippingProfile } = await supabase
            .from("shipping_profiles")
            .insert({
              shop_id: data[0].id,
              name: "Livraison Standard",
              description: "Livraison standard avec tracking",
              base_cost: 5.5,
              free_shipping_threshold: 50.0,
              is_default: true,
            })
            .select();

          if (shippingProfile?.[0]) {
            // Créer zones de livraison
            await supabase.from("shipping_zones").insert([
              {
                profile_id: shippingProfile[0].id,
                name: "Europe",
                countries: ["FR", "DE", "IT", "ES", "BE", "NL", "AT"],
                additional_cost: 0,
                estimated_days_min: 3,
                estimated_days_max: 7,
              },
              {
                profile_id: shippingProfile[0].id,
                name: "Monde",
                countries: ["US", "CA", "JP", "AU", "BR", "KR"],
                additional_cost: 8.5,
                estimated_days_min: 7,
                estimated_days_max: 14,
              },
            ]);
          }
        }
      }
    }

    // 4. Créer les produits
    console.log("\n🎴 Création des produits...");
    const productIds = [];

    for (const [index, productData] of sampleProducts.entries()) {
      const creatorEmails = testUsers
        .filter((u) => u.role === "creator")
        .map((u) => u.email);
      const randomCreatorEmail = creatorEmails[index % creatorEmails.length];
      const shopId = shopIds[randomCreatorEmail];

      if (!shopId) continue;

      const product = {
        shop_id: shopId,
        type: productData.type,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        currency: "EUR",
        stock: productData.stock,
        images: [
          getRandomImage(MTG_IMAGES.cards),
          getRandomImage(MTG_IMAGES.cards),
          getRandomImage(MTG_IMAGES.tokens),
        ],
        category_id: categoryIds[productData.category],
        tags: productData.tags,
        attributes: productData.attributes,
        lead_time_days: productData.lead_time_days,
        status: "active",
      };

      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select();
      if (!error && data?.[0]) {
        productIds.push(data[0].id);
        console.log(`✅ Produit créé: ${productData.title}`);
      }
    }

    // 5. Créer les services
    console.log("\n⚙️ Création des services...");
    const serviceIds = [];

    for (const [index, serviceData] of sampleServices.entries()) {
      const creatorEmails = testUsers
        .filter((u) => u.role === "creator")
        .map((u) => u.email);
      const randomCreatorEmail = creatorEmails[index % creatorEmails.length];
      const shopId = shopIds[randomCreatorEmail];

      if (!shopId) continue;

      const service = {
        shop_id: shopId,
        title: serviceData.title,
        description: serviceData.description,
        base_price: serviceData.base_price,
        currency: "EUR",
        requires_brief: serviceData.requires_brief,
        delivery_days: serviceData.delivery_days,
        slots_config: serviceData.slots_config,
        category_id: categoryIds[serviceData.category],
        status: "active",
      };

      const { data, error } = await supabase
        .from("services")
        .insert(service)
        .select();
      if (!error && data?.[0]) {
        serviceIds.push(data[0].id);
        console.log(`✅ Service créé: ${serviceData.title}`);
      }
    }

    // 6. Créer des commandes et avis
    console.log("\n🛒 Création des commandes et avis...");
    await createOrdersAndReviews(userIds, productIds, serviceIds, shopIds);

    // 7. Créer des données d'analytics
    console.log("\n📊 Création des données d'analytics...");
    await createAnalyticsData(userIds, productIds);

    console.log("\n🎉 Données MTG créées avec succès!");
    console.log("\n📋 Comptes de test disponibles:");
    testUsers.forEach((user) => {
      console.log(`   ${user.email} / ${user.password} (${user.role})`);
    });
  } catch (error) {
    console.error("❌ Erreur lors de la création des données:", error);
  }
}

async function createOrdersAndReviews(
  userIds,
  productIds,
  serviceIds,
  shopIds
) {
  const buyerEmails = testUsers
    .filter((u) => u.role === "buyer")
    .map((u) => u.email);
  const creatorEmails = testUsers
    .filter((u) => u.role === "creator")
    .map((u) => u.email);

  // Créer 15 commandes
  for (let i = 0; i < 15; i++) {
    const buyerEmail = getRandomItem(buyerEmails);
    const buyerId = userIds[buyerEmail];

    if (!buyerId) continue;

    // Sélectionner 1-3 produits aléatoires
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = getRandomItems(productIds, numItems);

    let total = 0;
    const orderItems = [];
    const breakdownByShop = {};

    for (const productId of selectedProducts) {
      const qty = Math.floor(Math.random() * 2) + 1;
      const unitPrice = Math.floor(Math.random() * 50) + 10;
      const creatorEmail = getRandomItem(creatorEmails);
      const shopId = shopIds[creatorEmail];

      if (!shopId) continue;

      total += qty * unitPrice;

      orderItems.push({
        item_type: "product",
        item_id: productId,
        shop_id: shopId,
        qty,
        unit_price: unitPrice,
        status: getRandomOrderStatus(),
      });

      if (!breakdownByShop[shopId]) {
        breakdownByShop[shopId] = { subtotal: 0, items: 0 };
      }
      breakdownByShop[shopId].subtotal += qty * unitPrice;
      breakdownByShop[shopId].items += qty;
    }

    // Créer la commande
    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: buyerId,
        total,
        currency: "EUR",
        status: getRandomOrderStatus(),
        breakdown_by_shop: breakdownByShop,
        shipping_cost: Math.random() > 0.5 ? 5.5 : 0,
        created_at: getRandomDate(),
      })
      .select();

    if (order?.[0]) {
      // Créer les items de commande
      for (const item of orderItems) {
        const { data: orderItem } = await supabase
          .from("order_items")
          .insert({
            order_id: order[0].id,
            ...item,
          })
          .select();

        // Créer des avis pour les items livrés
        if (
          orderItem?.[0] &&
          (item.status === "delivered" || item.status === "completed")
        ) {
          if (Math.random() > 0.3) {
            // 70% chance d'avoir un avis
            await supabase.from("reviews").insert({
              order_item_id: orderItem[0].id,
              rating: Math.floor(Math.random() * 2) + 4, // 4-5 étoiles principalement
              text: getRandomReviewText(),
              images:
                Math.random() > 0.7 ? [getRandomImage(MTG_IMAGES.cards)] : [],
              status: "published",
              created_at: getRandomDate(),
            });
          }
        }
      }

      console.log(`✅ Commande créée: ${total}€`);
    }
  }
}

async function createAnalyticsData(userIds, productIds) {
  const buyerEmails = testUsers
    .filter((u) => u.role === "buyer")
    .map((u) => u.email);

  // Créer des vues de produits
  for (let i = 0; i < 200; i++) {
    const productId = getRandomItem(productIds);
    const buyerEmail = getRandomItem(buyerEmails);
    const userId = userIds[buyerEmail];

    await supabase.from("product_views").insert({
      product_id: productId,
      user_id: Math.random() > 0.3 ? userId : null, // 30% de vues anonymes
      session_id: generateSessionId(),
      ip_address: generateRandomIP(),
      user_agent: "Mozilla/5.0 (Test Browser)",
      created_at: getRandomDate(),
    });
  }

  // Créer des données de panier
  for (let i = 0; i < 50; i++) {
    const productId = getRandomItem(productIds);
    const buyerEmail = getRandomItem(buyerEmails);
    const userId = userIds[buyerEmail];

    await supabase.from("cart_analytics").insert({
      product_id: productId,
      user_id: Math.random() > 0.2 ? userId : null,
      session_id: generateSessionId(),
      quantity: Math.floor(Math.random() * 3) + 1,
      added_at: getRandomDate(),
      removed_at: Math.random() > 0.6 ? getRandomDate() : null,
      converted_to_order: Math.random() > 0.7,
    });
  }

  console.log("✅ Données d'analytics créées");
}

// Fonctions utilitaires
function getRandomImage(imageArray) {
  return imageArray[Math.floor(Math.random() * imageArray.length)];
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomOrderStatus() {
  const statuses = ["paid", "processing", "completed", "delivered"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomDate() {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function generateSessionId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function generateRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function getRandomReviewText() {
  const reviews = [
    "Excellent travail ! L'alter est magnifique et correspond exactement à ce que j'attendais. Livraison rapide et emballage soigné.",
    "Superbe qualité artistique. Les détails sont impressionnants et la carte est parfaitement protégée. Je recommande vivement !",
    "Très satisfait de mon achat. Le token est exactement comme sur les photos et l'impression est de haute qualité.",
    "Service professionnel et résultat au-delà de mes attentes. Je commanderai certainement d'autres alters !",
    "Beau travail artistique, délai respecté et communication excellente. Parfait pour mon deck EDH !",
    "La qualité est au rendez-vous ! L'artwork est original et l'exécution parfaite. Merci !",
    "Très content de cet achat. Le deck box est solide et la gravure est précise. Exactement ce que je cherchais.",
    "Excellent service client et produit de qualité. L'alter donne une nouvelle vie à ma carte préférée !",
  ];
  return reviews[Math.floor(Math.random() * reviews.length)];
}

async function getUserByEmail(email) {
  const { data } = await supabase.auth.admin.listUsers();
  const user = data.users?.find((u) => u.email === email);
  return user?.id;
}

// Exécuter le script
createMTGData().catch(console.error);
