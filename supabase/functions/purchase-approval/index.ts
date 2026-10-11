// Follow this setup guide to integrate the Supabase Edge Function:
// https://supabase.com/docs/guides/functions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verify caller authentication
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify administrator role in profiles
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || user.email === 'officialsampannatimalsina@gmail.com';
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse input
    const { purchaseId, status, adminNote } = await req.json();
    if (!purchaseId || !['approved', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Service Role client for privileged update
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    const { data: purchase, error: updateErr } = await serviceClient
      .from('purchases')
      .update({
        status,
        admin_note: adminNote,
        reviewed_by: user.email,
        reviewed_at: now,
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log to admin audit log
    await serviceClient.from('admin_audit_logs').insert({
      admin_id: user.id,
      admin_email: user.email,
      action: status === 'approved' ? 'APPROVE_PURCHASE' : 'REJECT_PURCHASE',
      target_entity: 'purchases',
      entity_id: purchaseId,
      details: `${status.toUpperCase()} payment for ${purchase.package_name} by ${purchase.student_name} (Ref: ${purchase.transaction_reference}).`,
      timestamp: now,
    });

    return new Response(JSON.stringify({ success: true, purchase }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
