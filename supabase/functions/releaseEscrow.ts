import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function paypalAccessToken(): Promise<string> {
  const creds = btoa(
    `${Deno.env.get('PAYPAL_CLIENT')}:${Deno.env.get('PAYPAL_SECRET')}`,
  );
  const res = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token as string;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { orderId } = await req.json();
  const { data: escrow } = await supabase
    .from('escrows')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (!escrow) return new Response('escrow introuvable', { status: 404 });
  if (escrow.status !== 'delivered' || new Date(escrow.auto_release_at) > new Date()) {
    return new Response('conditions non remplies', { status: 400 });
  }

  const token = await paypalAccessToken();
  const { data: seller } = await supabase
    .from('profiles')
    .select('paypal_email')
    .eq('id', escrow.seller_id)
    .single();

  await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: orderId,
        email_subject: 'Paiement ManaShop',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: { value: escrow.net_amount, currency: escrow.currency },
          receiver: seller?.paypal_email,
        },
      ],
    }),
  });

  await supabase
    .from('escrows')
    .update({ status: 'released', released_at: new Date().toISOString() })
    .eq('order_id', orderId);

  return new Response('libéré', { status: 200 });
});
