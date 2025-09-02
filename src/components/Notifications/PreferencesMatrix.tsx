import { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

const categories = ['orders','messages','reviews','shop','system'];
const channels = ['email','push','webhook'];

type PrefKey = `${string}-${string}`;

export default function PreferencesMatrix() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({});

  useEffect(() => {
    supabase.from('notification_preferences').select('*').then(({ data }) => {
      const map: Record<PrefKey, boolean> = {};
      (data || []).forEach((p: any) => {
        map[`${p.category}-${p.channel}`] = p.enabled;
      });
      setPrefs(map);
    });
  }, []);

  const toggle = async (category: string, channel: string) => {
    const key: PrefKey = `${category}-${channel}`;
    const enabled = !prefs[key];
    setPrefs({ ...prefs, [key]: enabled });
      body: JSON.stringify({ category, channel, enabled })
    });
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left">Category</th>
          {channels.map(ch => (<th key={ch}>{ch}</th>))}
        </tr>
      </thead>
      <tbody>
        {categories.map(cat => (
          <tr key={cat}>
            <td className="capitalize">{cat}</td>
            {channels.map(ch => {
              const key: PrefKey = `${cat}-${ch}`;
              return (
                <td key={ch} className="text-center">
                  <input type="checkbox" checked={prefs[key]} onChange={() => toggle(cat, ch)} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
