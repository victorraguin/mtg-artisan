import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../UI/Card';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Users, Copy, TestTube, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import supabase from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function AmbassadorDemo() {
  const { user } = useAuth();
  const [testData, setTestData] = useState({
    referralCode: '',
    testEmail: '',
    walletAmount: 25
  });
  const [loading, setLoading] = useState(false);

  const generateTestData = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    setTestData({
      referralCode: `DEMO${timestamp}`,
      testEmail: `test-${timestamp}@demo.com`,
      walletAmount: Math.floor(Math.random() * 100) + 10
    });
    toast.success('Données de test générées !');
  };

  const simulateReferral = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Simuler la création d'un parrainage
      const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!ambassador) {
        toast.error('Vous devez être ambassadeur pour simuler un parrainage');
        return;
      }

      // Créer un utilisateur fictif parrainé
      const fakeUserId = `demo-${Date.now()}`;
      
      const { error } = await supabase.from('referrals').insert({
        ambassador_id: ambassador.id,
        referred_user_id: fakeUserId,
        referral_date: new Date().toISOString(),
        is_active: true,
        total_earned: Math.floor(Math.random() * 50) + 5
      });

      if (error) throw error;

      toast.success('Parrainage simulé avec succès !');
    } catch (error) {
      console.error('Erreur simulation parrainage:', error);
      toast.error('Erreur lors de la simulation');
    } finally {
      setLoading(false);
    }
  };

  const simulateWalletTransaction = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setLoading(true);
    try {
      // Récupérer le wallet de l'utilisateur
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!wallet) {
        toast.error('Wallet non trouvé');
        return;
      }

      // Ajouter une transaction de test
      const amount = testData.walletAmount;
      
      // Mettre à jour le solde
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Créer la transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'credit',
          amount: amount,
          description: `Commission de test - ${amount}€`,
          reference_type: 'referral',
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast.success(`${amount}€ ajoutés au wallet !`);
    } catch (error) {
      console.error('Erreur simulation wallet:', error);
      toast.error('Erreur lors de la simulation wallet');
    } finally {
      setLoading(false);
    }
  };

  const copyTestLink = () => {
    const testLink = `${window.location.origin}/auth/signup?ref=${testData.referralCode}`;
    navigator.clipboard.writeText(testLink);
    toast.success('Lien de test copié !');
  };

  const runFullDemo = async () => {
    setLoading(true);
    try {
      await simulateReferral();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await simulateWalletTransaction();
      toast.success('Démo complète terminée !');
    } catch (error) {
      toast.error('Erreur pendant la démo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <TestTube className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-foreground tracking-tight">
              Démo Système Ambassadeurs
            </h2>
            <p className="text-muted-foreground/70 text-sm">
              Outils de test et simulation pour le développement
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Génération des données de test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Données de test</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Code de parrainage"
                value={testData.referralCode}
                onChange={(e) => setTestData({...testData, referralCode: e.target.value})}
                placeholder="DEMOCODE123"
              />
              <Input
                label="Email de test"
                value={testData.testEmail}
                onChange={(e) => setTestData({...testData, testEmail: e.target.value})}
                placeholder="test@demo.com"
              />
            </div>

            <Input
              label="Montant wallet (€)"
              type="number"
              value={testData.walletAmount}
              onChange={(e) => setTestData({...testData, walletAmount: Number(e.target.value)})}
              min="1"
              max="1000"
            />

            <div className="flex space-x-3">
              <Button onClick={generateTestData} variant="outline">
                Générer données
              </Button>
              <Button onClick={copyTestLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copier lien test
              </Button>
            </div>
          </div>

          {/* Actions de simulation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Simulations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={simulateReferral} 
                loading={loading}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Simuler parrainage
              </Button>
              
              <Button 
                onClick={simulateWalletTransaction} 
                loading={loading}
                variant="outline"
                className="flex items-center justify-center"
              >
                💰 Simuler commission
              </Button>
              
              <Button 
                onClick={runFullDemo} 
                loading={loading}
                className="flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Démo complète
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Instructions de test</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Générez des données de test</li>
              <li>Devenez ambassadeur si ce n'est pas déjà fait</li>
              <li>Utilisez les simulations pour tester les fonctionnalités</li>
              <li>Vérifiez les mises à jour dans le wallet et dashboard</li>
              <li>Testez l'inscription avec le lien de parrainage généré</li>
            </ol>
          </div>

          {/* Raccourcis de navigation */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => window.open('/ambassador', '_blank')} 
              variant="outline" 
              size="sm"
            >
              Dashboard Ambassadeur
            </Button>
            <Button 
              onClick={() => window.open('/admin/ambassadors', '_blank')} 
              variant="outline" 
              size="sm"
            >
              Admin Ambassadeurs
            </Button>
            <Button 
              onClick={() => window.open('/admin/commissions', '_blank')} 
              variant="outline" 
              size="sm"
            >
              Admin Commissions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
