import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Strictly check role from the database
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p className="text-gray-700">Welcome, Admin <span className="font-semibold">{user.email}</span></p>
        <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">
          Authentication and Authorization verified. You have full administrative access.
        </div>
      </div>
    </div>
  );
}
