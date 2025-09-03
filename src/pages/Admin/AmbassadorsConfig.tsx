import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface FormState {
  user_id: string;
  created_user_id: string;
  commission_rate: number;
  end_date?: string;
}

export default function AmbassadorsConfig() {
  const [links, setLinks] = useState<any[]>([]);
  const [form, setForm] = useState<FormState>({
    user_id: '',
    created_user_id: '',
    commission_rate: 0.05,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase.from('ambassadors').select('*');
    setLinks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('ambassadors').insert({
      user_id: form.user_id,
      created_user_id: form.created_user_id,
      commission_rate: form.commission_rate,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    });
    setForm({ user_id: '', created_user_id: '', commission_rate: 0.05 });
    fetchLinks();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light">Ambassadeurs</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Ambassadeur</th>
            <th className="text-left p-2">Créateur</th>
            <th className="text-left p-2">Taux</th>
            <th className="text-left p-2">Début</th>
            <th className="text-left p-2">Fin</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.user_id}</td>
              <td className="p-2">{l.created_user_id}</td>
              <td className="p-2">{l.commission_rate}</td>
              <td className="p-2">{new Date(l.start_date).toLocaleDateString()}</td>
              <td className="p-2">{l.end_date ? new Date(l.end_date).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">ID utilisateur de l'ambassadeur</label>
          <input
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">ID utilisateur du créateur</label>
          <input
            value={form.created_user_id}
            onChange={(e) => setForm({ ...form, created_user_id: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Taux de commission</label>
          <input
            type="number"
            step="0.01"
            value={form.commission_rate}
            onChange={(e) => setForm({ ...form, commission_rate: parseFloat(e.target.value) })}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Date de fin (optionnelle)</label>
          <input
            type="date"
            value={form.end_date || ''}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            className="border rounded p-2 w-full"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          Attribuer
        </button>
      </form>
    </div>
  );
}
