import { useState, useEffect } from "react";
import { Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "../UI/Card";
import { LoadingSpinner } from "../UI/LoadingSpinner";
import supabase from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

interface EscrowData {
  id: string;
  order_id: string;
  gross_amount: number;
  commission_platform: number;
  commission_ambassador: number;
  net_amount: number;
  currency: string;
  status: string;
  created_at: string;
  auto_release_at: string;
  released_at?: string;
  order: {
    id: string;
    created_at: string;
  };
}

interface EscrowStatusProps {
  compact?: boolean;
  userRole?: 'buyer' | 'seller';
}

export function EscrowStatus({ compact = false, userRole = 'buyer' }: EscrowStatusProps) {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEscrows();
    }
  }, [user, userRole]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      
      const column = userRole === 'buyer' ? 'buyer_id' : 'seller_id';
      const { data, error } = await supabase
        .from('escrows')
        .select(`
          *,
          order:orders(id, created_at)
        `)
        .eq(column, user?.id)
        .order('created_at', { ascending: false })
        .limit(compact ? 3 : 10);

      if (error) throw error;
      setEscrows(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'held':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dispute':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'held':
        return 'Fonds sécurisés';
      case 'delivered':
        return 'En attente de libération';
      case 'released':
        return 'Fonds libérés';
      case 'dispute':
        return 'En litige';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'held':
        return 'text-blue-600';
      case 'delivered':
        return 'text-orange-600';
      case 'released':
        return 'text-green-600';
      case 'dispute':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      </Card>
    );
  }

  if (escrows.length === 0) {
    return (
      <Card className="p-4 text-center">
        <Shield className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground/70">
          Aucune transaction en escrow
        </p>
      </Card>
    );
  }

  if (compact) {
    const totalHeld = escrows
      .filter(e => e.status === 'held' || e.status === 'delivered')
      .reduce((sum, e) => sum + (userRole === 'buyer' ? e.gross_amount : e.net_amount), 0);

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-foreground">
                {totalHeld.toFixed(2)} €
              </div>
              <div className="text-xs text-muted-foreground/70">
                {userRole === 'buyer' ? 'En sécurité' : 'En attente'}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/60">
            {escrows.filter(e => e.status === 'held' || e.status === 'delivered').length} transaction(s)
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Fonds en sécurité
            </h3>
            <p className="text-sm text-muted-foreground/70">
              {userRole === 'buyer' 
                ? 'Vos paiements sont protégés jusqu\'à la livraison'
                : 'Vos revenus seront libérés après livraison'
              }
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {escrows.map((escrow) => (
            <div
              key={escrow.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(escrow.status)}
                <div>
                  <div className="font-medium text-foreground text-sm">
                    Commande #{escrow.order_id.slice(-8)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(escrow.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-foreground">
                  {(userRole === 'buyer' ? escrow.gross_amount : escrow.net_amount).toFixed(2)} €
                </div>
                <div className={`text-xs font-medium ${getStatusColor(escrow.status)}`}>
                  {getStatusText(escrow.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {userRole === 'seller' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Protection acheteur
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                  Les fonds sont automatiquement libérés 7 jours après livraison
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
