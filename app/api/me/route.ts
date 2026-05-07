import { createClient } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import rateLimit, { getIP } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, 
  uniqueTokenPerInterval: 500
});

export async function GET(request: NextRequest) {
  try {
    const ip = getIP(request);
    try {
      await limiter.check(10, ip); // Limit: 10 requests per minute per IP
    } catch {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // 1. Session verification
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Valid session required.' }, { status: 401 });
    }

    // 2. Fetch specific fields (prevent data dump)
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .select('id, email, balance, isPremium, role')
      .eq('id', user.id)
      .single();

    if (dbError) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
