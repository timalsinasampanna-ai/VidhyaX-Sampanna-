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
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const targetEmail = 'officialsampannatimalsina@gmail.com';

    // Verify or promote Sampanna Timalsina to administrator role in auth.users and profiles
    const { data: users, error: listErr } = await serviceClient.auth.admin.listUsers();
    if (listErr) throw listErr;

    const adminUser = users.users.find((u) => u.email === targetEmail);

    if (adminUser) {
      await serviceClient.auth.admin.updateUserById(adminUser.id, {
        app_metadata: { role: 'admin' },
      });

      await serviceClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', adminUser.id);

      await serviceClient
        .from('user_roles')
        .upsert({ user_id: adminUser.id, role: 'admin' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Admin provisioning complete for ${targetEmail}.`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
