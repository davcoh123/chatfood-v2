import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { userId, rating, comment } = body;

    // Validation
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'rating must be between 1 and 5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with server privileges
    const supabase = createSupabaseServerClient(cookies);

    // Insert the review
    const { data, error } = await supabase
      .from('order_reviews')
      .insert({
        user_id: userId,
        order_id: `public-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        rating: rating,
        comment: comment?.trim() || null,
        customer_phone: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting review:', error);
      return new Response(JSON.stringify({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in reviews API:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
