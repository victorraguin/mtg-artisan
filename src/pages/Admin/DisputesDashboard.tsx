import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface Dispute {
  id: string;
  reason: string;
  status: string;
  escrows: { order_id: string; net_amount: number; currency: string };
}

export default function DisputesDashboard() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from('disputes')
      .select('id, reason, status, escrows(order_id, net_amount, currency)')
      .eq('status', 'open');
    setDisputes(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const decision = async (id: string, action: string) => {
    await supabase.functions.invoke('resolveDispute', {
      body: { disputeId: id, decision: action },
    });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-light">Litiges ouverts</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Commande</th>
            <th className="text-left p-2">Raison</th>
            <th className="text-left p-2">Montant</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-2">{d.escrows.order_id}</td>
              <td className="p-2">{d.reason}</td>
              <td className="p-2">
                {d.escrows.net_amount} {d.escrows.currency}
              </td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => decision(d.id, 'refund_buyer')}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Rembourser
                </button>
                <button
                  onClick={() => decision(d.id, 'pay_seller')}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Payer
                </button>
                <button
                  onClick={() => decision(d.id, 'split')}
                  className="px-2 py-1 bg-yellow-600 text-white rounded"
                >
                  Partager
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
