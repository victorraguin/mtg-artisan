import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import supabase from '../../lib/supabase';

export default function NotificationsBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const user = supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;
      supabase
        .channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => {
          setCount(c => c + 1);
        })
        .subscribe();
    });
  }, []);

  return (
    <button className="relative text-gray-300 hover:text-white">
      <Bell className="h-6 w-6" />
      {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">{count}</span>}
    </button>
  );
}
