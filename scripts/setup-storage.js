// Script pour configurer Supabase Storage
// À exécuter dans la console Supabase ou via l'API

const { createClient } = require("@supabase/supabase-js");

// Remplacez par vos vraies clés
const supabaseUrl = "YOUR_SUPABASE_URL";
const serviceRoleKey = "YOUR_SERVICE_ROLE_KEY";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  try {
    console.log("🚀 Configuration du stockage Supabase...");

    // 1. Créer le bucket pour les assets de boutique
    const { data: bucketData, error: bucketError } =
      await supabase.storage.createBucket("shop-assets", {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        fileSizeLimit: 5242880, // 5MB
      });

    if (bucketError) {
      if (bucketError.message.includes("already exists")) {
        console.log("✅ Bucket shop-assets existe déjà");
      } else {
        throw bucketError;
      }
    } else {
      console.log("✅ Bucket shop-assets créé avec succès");
    }

    // 2. Configurer les politiques RLS pour le bucket
    const policies = [
      // Politique pour permettre aux utilisateurs de voir les assets publics
      {
        name: "Allow public read access to shop assets",
        definition:
          "CREATE POLICY \"Allow public read access to shop assets\" ON storage.objects FOR SELECT USING (bucket_id = 'shop-assets')",
      },
      // Politique pour permettre aux propriétaires de boutique d'uploader
      {
        name: "Allow shop owners to upload assets",
        definition:
          "CREATE POLICY \"Allow shop owners to upload assets\" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shop-assets' AND auth.uid()::text = (storage.foldername(name))[1])",
      },
      // Politique pour permettre aux propriétaires de modifier leurs assets
      {
        name: "Allow shop owners to update their assets",
        definition:
          "CREATE POLICY \"Allow shop owners to update their assets\" ON storage.objects FOR UPDATE USING (bucket_id = 'shop-assets' AND auth.uid()::text = (storage.foldername(name))[1])",
      },
      // Politique pour permettre aux propriétaires de supprimer leurs assets
      {
        name: "Allow shop owners to delete their assets",
        definition:
          "CREATE POLICY \"Allow shop owners to delete their assets\" ON storage.objects FOR DELETE USING (bucket_id = 'shop-assets' AND auth.uid()::text = (storage.foldername(name))[1])",
      },
    ];

    console.log("📋 Configuration des politiques RLS...");

    for (const policy of policies) {
      try {
        await supabase.rpc("exec_sql", { sql: policy.definition });
        console.log(`✅ Politique "${policy.name}" créée`);
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log(`ℹ️ Politique "${policy.name}" existe déjà`);
        } else {
          console.log(
            `⚠️ Erreur lors de la création de la politique "${policy.name}":`,
            error.message
          );
        }
      }
    }

    console.log("🎉 Configuration du stockage terminée avec succès !");
    console.log("");
    console.log("📁 Bucket créé: shop-assets");
    console.log("🔓 Accès public activé");
    console.log("📏 Limite de taille: 5MB");
    console.log("🖼️ Types de fichiers autorisés: JPG, PNG, GIF, WebP");
    console.log("🔒 Politiques RLS configurées pour la sécurité");
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error);
  }
}

// Instructions d'utilisation
console.log("📖 INSTRUCTIONS:");
console.log(
  "1. Remplacez YOUR_SUPABASE_URL et YOUR_SERVICE_ROLE_KEY par vos vraies clés"
);
console.log("2. Exécutez: node scripts/setup-storage.js");
console.log("3. Ou copiez-collez le code dans la console SQL de Supabase");
console.log("");

// Exécuter si appelé directement
if (require.main === module) {
  setupStorage();
}

module.exports = { setupStorage };
