import React from "react";
import { Card, CardContent, CardHeader } from "../UI";
import { Info, Package, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StockInfoCardProps {
  className?: string;
}

export function StockInfoCard({ className = "" }: StockInfoCardProps) {
  const { t } = useTranslation();
  return (
    <Card className={`border-blue-500/30 bg-blue-500/5 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-medium text-foreground">
            {t("stockInfoCard.title")}
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                {t("stockInfoCard.totalTitle")}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t("stockInfoCard.totalDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShoppingCart className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                {t("stockInfoCard.inCartsTitle")}
              </h4>
              <p className="text-xs text-muted-foreground">
                {t("stockInfoCard.inCartsDesc")}
              </p>
            </div>
          </div>

          <div className="bg-muted/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">
              {t("stockInfoCard.calcTitle")}
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>{t("stockInfoCard.total")}</span>
                <span className="font-mono">
                  10 {t("stockInfoCard.items", { count: 10 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("stockInfoCard.inCarts")}</span>
                <span className="font-mono text-orange-500">
                  -3 {t("stockInfoCard.items", { count: 3 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/30 pt-1 mt-1">
                <span className="font-medium">
                  {t("stockInfoCard.available")}
                </span>
                <span className="font-mono font-medium text-green-500">
                  7 {t("stockInfoCard.items", { count: 7 })}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>{t("stockInfoCard.tip")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
