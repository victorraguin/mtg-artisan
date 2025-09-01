import React from "react";
import { Card, CardContent, CardHeader } from "../UI";
import { Info, Package, ShoppingCart } from "lucide-react";

interface StockInfoCardProps {
  className?: string;
}

export function StockInfoCard({ className = "" }: StockInfoCardProps) {
  return (
    <Card className={`border-blue-500/30 bg-blue-500/5 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-foreground">
            Comment fonctionne la gestion du stock ?
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Stock Total en Inventaire
              </h4>
              <p className="text-xs text-muted-foreground">
                C'est le nombre total d'articles que vous avez en stock. Vous
                pouvez le modifier dans l'édition du produit.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShoppingCart className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Articles en Paniers
              </h4>
              <p className="text-xs text-muted-foreground">
                Nombre d'articles actuellement dans les paniers des clients
                (mais pas encore achetés).
              </p>
            </div>
          </div>

          <div className="bg-muted/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">
              📊 Calcul du Stock Disponible
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Stock total :</span>
                <span className="font-mono">10 articles</span>
              </div>
              <div className="flex justify-between">
                <span>En paniers :</span>
                <span className="font-mono text-orange-500">-3 articles</span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-1 mt-1">
                <span className="font-medium">Disponible :</span>
                <span className="font-mono font-medium text-green-500">
                  7 articles
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              💡 <strong>Conseil :</strong> Le stock disponible est affiché en
              temps réel aux clients. Si un client ajoute un article à son
              panier, le stock disponible diminue immédiatement pour les autres
              clients.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
