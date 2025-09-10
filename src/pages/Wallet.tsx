import React from "react";
import { Wallet as WalletComponent } from "../components/Wallet";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/UI/Button";

export function Wallet() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
      {/* Header avec retour */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>
        <h1 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
          Mon Wallet
        </h1>
        <p className="text-muted-foreground/70 text-lg mt-2">
          Gérez vos revenus, commissions et paiements
        </p>
      </div>

      {/* Composant Wallet complet */}
      <WalletComponent compact={false} showActions={true} />
    </div>
  );
}
