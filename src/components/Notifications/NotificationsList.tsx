import { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  action_url: string | null;
  read_at: string | null;
}

export default function NotificationsList() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Notification[]) || []));
  }, []);

  const markRead = async (id: string) => {
    await fetch('/functions/v1/notifications-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] })
    });
    setItems((prev) => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  return (
    <ul className="divide-y divide-gray-700">
      {items.map(n => (
        <li key={n.id} className={`p-4 ${n.read_at ? 'opacity-50' : ''}`}>
          <div className="font-medium">{n.title}</div>
          {n.body && <div className="text-sm text-gray-300">{n.body}</div>}
          {n.action_url && <a href={n.action_url} className="text-blue-400 text-sm">Open</a>}
          {!n.read_at && <button onClick={() => markRead(n.id)} className="text-xs text-gray-400 ml-2">Mark read</button>}
        </li>
      ))}
    </ul>
  );
}
