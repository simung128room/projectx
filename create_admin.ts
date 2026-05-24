import { adminDb, supabaseAdmin } from './src/lib/admindb.js';
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

async function createAdmin() {
  const email = 'admin@apex-studio.com';
  const password = 'admintest1222333838!::?)::฿:';
  
  console.log('Creating user in Supabase...', email);
  let userId = '';
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('already registered')) {
      console.log('User already exists, updating password...');
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData.users.find((u: any) => u.email === email);
      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
        userId = existingUser.id;
      } else {
        console.error('Could not find existing user despite already exists error');
        process.exit(1);
      }
    } else {
       console.error('Error creating user:', error);
       process.exit(1);
    }
  } else {
    userId = data.user.id;
  }

  if (userId) {
    console.log('User created/updated in Supabase Auth:', userId);
    
    console.log('Saving to DB as admin...');
    await adminDb.firestore().collection('users').doc(userId).set({
      email,
      username: 'admin',
      role: 'admin',
      balance: 1000000,
      isPremium: true,
      status: 'active',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('Done!');
  }
}

createAdmin().catch(console.error);

