import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface FormState {
  scope: 'global' | 'product' | 'service';
  rate: number;
  fixed_fee: number;
  currency: string;
  is_active: boolean;
}

export default function CommissionsConfig() {
  const [rules, setRules] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>({
    scope: 'global',
    rate: 0,
    fixed_fee: 0,
    currency: 'EUR',
    is_active: true,
  });

  const scopeLabels = {
    global: 'Global',
    product: 'Produit',
    service: 'Service',
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase.from('commissions').select('*');
    setRules(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('commissions').upsert(form);
    setForm({ scope: 'global', rate: 0, fixed_fee: 0, currency: 'EUR', is_active: true });
    fetchRules();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light">Règles de commission</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Portée</th>
            <th className="text-left p-2">Taux</th>
            <th className="text-left p-2">Frais fixe</th>
            <th className="text-left p-2">Devise</th>
            <th className="text-left p-2">Actif</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{scopeLabels[r.scope as keyof typeof scopeLabels]}</td>
              <td className="p-2">{r.rate}</td>
              <td className="p-2">{r.fixed_fee}</td>
              <td className="p-2">{r.currency}</td>
              <td className="p-2">{r.is_active ? 'oui' : 'non'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Portée</label>
          <select
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value as FormState['scope'] })}
            className="border rounded p-2 w-full"
          >
            <option value="global">Global</option>
            <option value="product">Produit</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Taux</label>
          <input
            type="number"
            step="0.01"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Frais fixe</label>
          <input
            type="number"
            step="0.01"
            value={form.fixed_fee}
            onChange={(e) => setForm({ ...form, fixed_fee: parseFloat(e.target.value) })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Devise</label>
          <input
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          <label>Actif</label>
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
