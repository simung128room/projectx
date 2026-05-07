import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '../logout/actions';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Welcome, {user.email}</p>
      <form action={signOut} className="mt-6">
        <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
          Logout
        </button>
      </form>
    </div>
  );
}
