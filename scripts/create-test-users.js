// Script pour créer des utilisateurs de test via l'API Supabase Admin
import { createClient } from "@supabase/supabase-js";

// Configuration Supabase - utilisez vos vraies clés
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: "admin@manashop.com",
    password: "admin123!",
    role: "admin",
    display_name: "Admin User",
  },
  {
    email: "alice@artmaster.com",
    password: "alice123!",
    role: "creator",
    display_name: "ArtMaster Alice",
  },
  {
    email: "bob@tokencraft.com",
    password: "bob123!",
    role: "creator",
    display_name: "TokenCraft Bob",
  },
  {
    email: "sarah@judgeacademy.com",
    password: "sarah123!",
    role: "creator",
    display_name: "Judge Sarah",
  },
  {
    email: "pro@decksolutions.com",
    password: "pro123!",
    role: "creator",
    display_name: "DeckBuilder Pro",
  },
  {
    email: "collector@manashop.com",
    password: "collector123!",
    role: "buyer",
    display_name: "ManaShop Collector",
  },
];

async function createTestUsers() {
  console.log("🚀 Création des utilisateurs de test...\n");

  for (const userData of testUsers) {
    try {
      // Créer l'utilisateur avec l'API Admin
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirme automatiquement l'email
      });

      if (error) {
        if (error.message.includes("already registered")) {
          console.log(`⚠️  Utilisateur déjà existant: ${userData.email}`);
          continue;
        }
        console.error(
          `❌ Erreur lors de la création de ${userData.email}:`,
          error.message
        );
        continue;
      }

      console.log(
        `✅ Utilisateur créé: ${userData.email} (ID: ${data.user.id})`
      );

      // Créer le profil correspondant
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        role: userData.role,
        display_name: userData.display_name,
        avatar_url: getAvatarUrl(userData.display_name),
        country: getCountry(userData.email),
        bio: getBio(userData.role, userData.display_name),
      });

      if (profileError) {
        if (profileError.code === "23505") {
          // Duplicate key
          console.log(`⚠️  Profil déjà existant pour: ${userData.email}`);
        } else {
          console.error(
            `❌ Erreur lors de la création du profil pour ${userData.email}:`,
            profileError.message
          );
        }
      } else {
        console.log(`✅ Profil créé pour: ${userData.email}`);
      }
    } catch (err) {
      console.error(`❌ Erreur inattendue pour ${userData.email}:`, err);
    }
  }

  console.log("\n🎉 Création des utilisateurs terminée!");
  console.log("\n📋 Comptes de test disponibles:");
  testUsers.forEach((user) => {
    console.log(`   ${user.email} / ${user.password} (${user.role})`);
  });
  console.log("\n💡 Vous pouvez maintenant vous connecter avec ces comptes!");
}

function getAvatarUrl(displayName) {
  const avatars = {
    "Admin User":
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150",
    "ArtMaster Alice":
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=150",
    "TokenCraft Bob":
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150",
    "Judge Sarah":
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=150",
    "DeckBuilder Pro":
      "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150",
    "ManaShop Collector":
      "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=150",
  };
  return avatars[displayName] || null;
}

function getCountry(email) {
  if (email.includes("alice")) return "Canada";
  if (email.includes("bob")) return "United Kingdom";
  if (email.includes("sarah")) return "Germany";
  if (email.includes("pro")) return "Australia";
  return "United States";
}

function getBio(role, displayName) {
  const bios = {
    "Admin User": "Platform administrator",
    "ArtMaster Alice":
      "Professional ManaShop card alterer with 10+ years experience. Specializing in detailed character portraits and landscape extensions.",
    "TokenCraft Bob":
      "Custom token creator and digital artist. I bring your creatures to life with unique designs.",
    "Judge Sarah":
      "Level 2 Judge offering coaching and rules consultation. Competitive player for 15+ years.",
    "DeckBuilder Pro":
      "Professional deckbuilder and tournament grinder. Specializing in competitive EDH and Modern.",
    "ManaShop Collector":
      "Passionate ManaShop collector always looking for unique artwork and custom pieces.",
  };
  return bios[displayName] || "";
}

// Exécuter le script
createTestUsers().catch(console.error);
