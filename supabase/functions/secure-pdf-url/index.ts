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

    const { materialId } = await req.json();

    // Query material details
    const { data: material, error: matErr } = await supabaseClient
      .from('study_materials')
      .select('*')
      .eq('id', materialId)
      .single();

    if (matErr || !material) {
      return new Response(JSON.stringify({ error: 'Material not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if free or admin
    const isAdmin = user.email === 'officialsampannatimalsina@gmail.com';

    if (material.is_premium && !isAdmin) {
      // Check for approved purchase
      const { data: purchase } = await supabaseClient
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('class_grade', parseInt(material.class_id, 10))
        .eq('status', 'approved')
        .maybeSingle();

      if (!purchase) {
        return new Response(JSON.stringify({ error: 'Premium purchase required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate short-lived signed URL (3600 seconds = 1 hour)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const bucketName = material.is_premium ? 'premium-materials' : 'free-materials';
    const { data: signedData, error: signErr } = await serviceClient.storage
      .from(bucketName)
      .createSignedUrl(material.file_url, 3600);

    if (signErr) throw signErr;

    return new Response(JSON.stringify({ signedUrl: signedData.signedUrl }), {
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
