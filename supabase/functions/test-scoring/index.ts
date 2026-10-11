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

    const { testId, answers, timeSpentSeconds, studentName } = await req.json();

    // Query test & questions with correct_option_index via service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: test, error: testErr } = await serviceClient
      .from('tests')
      .select('*, test_questions(*)')
      .eq('id', testId)
      .single();

    if (testErr || !test) {
      return new Response(JSON.stringify({ error: 'Test not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let score = 0;
    const questions = test.test_questions || [];
    questions.forEach((q: any) => {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correct_option_index) {
        score += q.points;
      }
    });

    const percentage = Math.round((score / test.total_marks) * 100);
    const isPassed = percentage >= test.pass_percentage;

    // Record attempt in database
    const { data: attempt, error: attemptErr } = await serviceClient
      .from('test_attempts')
      .insert({
        test_id: test.id,
        test_title: test.title,
        user_id: user.id,
        student_name: studentName || user.email,
        score,
        total_marks: test.total_marks,
        percentage,
        is_passed: isPassed,
        time_spent_seconds: timeSpentSeconds,
        answers,
      })
      .select()
      .single();

    if (attemptErr) throw attemptErr;

    return new Response(
      JSON.stringify({
        id: attempt.id,
        testId: attempt.test_id,
        testTitle: attempt.test_title,
        userId: attempt.user_id,
        studentName: attempt.student_name,
        score: attempt.score,
        totalMarks: attempt.total_marks,
        percentage: attempt.percentage,
        isPassed: attempt.is_passed,
        timeSpentSeconds: attempt.time_spent_seconds,
        answers: attempt.answers,
        completedAt: attempt.completed_at,
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
