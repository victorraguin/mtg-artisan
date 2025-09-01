// Script pour vérifier les images dans la base de données
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jihtpkegbsjavmmdcbhm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppaHRwa2VnYnNqYXZtbWRjYmhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMzMjkwOSwiZXhwIjoyMDcxOTA4OTA5fQ.QaIzq7YG4VvzKeEnI1riMwNOLtCwM0x9y235kz1eFUc"
);

async function checkImages() {
  console.log("🔍 Vérification des images dans la base de données...\n");

  // Vérifier les produits
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("title, images")
    .limit(10);

  if (productError) {
    console.error("❌ Erreur produits:", productError);
    return;
  }

  console.log("🎴 PRODUITS:");
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title}`);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, i) => {
        const isNewImage = img.includes("scontent-cdg4");
        const status = isNewImage ? "✅ NOUVELLE" : "❌ ANCIENNE";
        const preview = img.substring(0, 100) + "...";
        console.log(`   ${status}: ${preview}`);
      });
    } else {
      console.log("   ⚠️  Aucune image");
    }
    console.log("");
  });
}

checkImages().catch(console.error);
