import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Session check
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Strict Role verification (DB source of truth)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    // 3. Fetch configs, RLS policies will ensure this only succeeds if the user is truly an admin
    const { data: configs, error: dbError } = await supabase
      .from('site_config')
      .select('key_name, value');

    if (dbError) {
      return NextResponse.json({ error: 'Failed to retrieve configuration' }, { status: 500 });
    }

    return NextResponse.json({ configs });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
