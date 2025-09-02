import React, { useEffect, useState } from 'react';
import supabase from '../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface Props {
  disputeId: string;
  userId: string;
}

export default function DisputeChat({ disputeId, userId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    supabase
      .from<Message>('dispute_messages')
      .select('*')
      .eq('dispute_id', disputeId)
      .order('created_at')
      .then(({ data }) => setMessages(data || []));

    const channel = supabase
      .channel('dispute-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dispute_messages', filter: `dispute_id=eq.${disputeId}` },
        (payload) => {
          setMessages((msgs) => [...msgs, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId]);

  const envoyer = async () => {
    await supabase.functions.invoke('postDisputeMessage', {
      body: { disputeId, senderId: userId, message: text },
    });
    setText('');
  };

  return (
    <div className="space-y-2">
      <div className="border p-2 h-64 overflow-y-auto">{
        messages.map((m) => (
          <div key={m.id} className="mb-2">
            <div className="text-xs text-gray-500">{m.sender_id}</div>
            <div>{m.message}</div>
          </div>
        ))
      }</div>
      <div className="flex space-x-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border rounded p-2 flex-1"
          placeholder="Votre message"
        />
        <button onClick={envoyer} className="px-4 py-2 bg-primary text-white rounded">
          Envoyer
        </button>
      </div>
    </div>
  );
}
