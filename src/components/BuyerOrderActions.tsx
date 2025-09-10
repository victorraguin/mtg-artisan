import React, { useState } from 'react';
import supabase from '../lib/supabase';

interface Props {
  orderId: string;
  buyerId: string;
}

export default function BuyerOrderActions({ orderId, buyerId }: Props) {
  const [reason, setReason] = useState('');

  const confirmer = async () => {
    await supabase.functions.invoke('releaseEscrow', {
      body: { orderId },
    });
  };

  const litige = async () => {
    await supabase.functions.invoke('openDispute', {
      body: { orderId, buyerId, reason },
    });
    setReason('');
  };

  return (
    <div className="space-y-2">
      <button
        onClick={confirmer}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Confirmer la réception
      </button>
      <div className="flex space-x-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motif du litige"
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={litige}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Ouvrir un litige
        </button>
      </div>
    </div>
  );
}
