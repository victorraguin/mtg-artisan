#!/usr/bin/env node

/**
 * Script de test automatisé pour le système d'ambassadeurs
 * Usage: node scripts/test-ambassador-system.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAmbassadorSystem() {
  console.log('🚀 Début des tests du système d\'ambassadeurs...\n');

  // Test 1: Vérification des tables
  console.log('📋 Test 1: Vérification de la structure de la base de données');
  
  const tables = ['ambassadors', 'referrals', 'wallets', 'wallet_transactions'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: ${err.message}`);
    }
  }

  // Test 2: Création d'un ambassadeur de test
  console.log('\n👤 Test 2: Création d\'un ambassadeur de test');
  
  try {
    // Créer un utilisateur de test
    const testEmail = `test-ambassador-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123'
    });

    if (authError) {
      console.log(`❌ Création utilisateur: ${authError.message}`);
      return;
    }

    console.log(`✅ Utilisateur créé: ${testEmail}`);

    // Créer le profil
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      display_name: 'Test Ambassador',
      role: 'buyer'
    });

    if (profileError) {
      console.log(`❌ Création profil: ${profileError.message}`);
    } else {
      console.log('✅ Profil créé');
    }

    // Créer l'ambassadeur
    const referralCode = `TEST${Date.now().toString(36).toUpperCase()}`;
    const { error: ambassadorError } = await supabase.from('ambassadors').insert({
      user_id: authData.user.id,
      referral_code: referralCode,
      commission_rate: 0.05,
      is_active: true
    });

    if (ambassadorError) {
      console.log(`❌ Création ambassadeur: ${ambassadorError.message}`);
    } else {
      console.log(`✅ Ambassadeur créé avec le code: ${referralCode}`);
    }

    // Créer le wallet
    const { error: walletError } = await supabase.from('wallets').insert({
      user_id: authData.user.id,
      balance: 0,
      currency: 'EUR'
    });

    if (walletError) {
      console.log(`❌ Création wallet: ${walletError.message}`);
    } else {
      console.log('✅ Wallet créé');
    }

  } catch (err) {
    console.log(`❌ Erreur générale: ${err.message}`);
  }

  // Test 3: Vérification des fonctions RPC
  console.log('\n⚙️ Test 3: Vérification des fonctions RPC');
  
  try {
    const { data, error } = await supabase.rpc('generate_referral_code', {
      user_display_name: 'Test User'
    });

    if (error) {
      console.log(`❌ Fonction generate_referral_code: ${error.message}`);
    } else {
      console.log(`✅ Fonction generate_referral_code: ${data}`);
    }
  } catch (err) {
    console.log(`❌ Fonction generate_referral_code: ${err.message}`);
  }

  // Test 4: Statistiques
  console.log('\n📊 Test 4: Statistiques du système');
  
  try {
    const { data: ambassadors } = await supabase.from('ambassadors').select('*');
    const { data: referrals } = await supabase.from('referrals').select('*');
    const { data: wallets } = await supabase.from('wallets').select('*');
    
    console.log(`📈 Ambassadeurs totaux: ${ambassadors?.length || 0}`);
    console.log(`🔗 Parrainages totaux: ${referrals?.length || 0}`);
    console.log(`💰 Wallets créés: ${wallets?.length || 0}`);
    
  } catch (err) {
    console.log(`❌ Erreur statistiques: ${err.message}`);
  }

  console.log('\n✅ Tests terminés !');
  console.log('\n📝 Pour tester manuellement:');
  console.log('1. Démarrez le serveur: npm run dev');
  console.log('2. Allez sur /ambassador pour devenir ambassadeur');
  console.log('3. Partagez votre lien de parrainage');
  console.log('4. Testez l\'inscription avec le code de parrainage');
  console.log('5. Vérifiez le wallet dans le header');
}

// Fonction de nettoyage (optionnelle)
async function cleanup() {
  console.log('\n🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer les données de test (ambassadeurs avec code commençant par TEST)
    const { error } = await supabase
      .from('ambassadors')
      .delete()
      .like('referral_code', 'TEST%');

    if (error) {
      console.log(`❌ Erreur nettoyage: ${error.message}`);
    } else {
      console.log('✅ Données de test supprimées');
    }
  } catch (err) {
    console.log(`❌ Erreur nettoyage: ${err.message}`);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanup();
} else {
  testAmbassadorSystem();
}

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du script...');
  process.exit(0);
});
