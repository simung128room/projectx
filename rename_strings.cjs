const fs = require('fs');

let adminFile = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminFile = adminFile.replace(/Connected \(Firebase\)/g, 'Connected (Supabase)');
fs.writeFileSync('src/components/AdminDashboard.tsx', adminFile);

let appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace(/Firebase User/g, 'Supabase User');
appFile = appFile.replace(/FirebaseUser/g, 'SupabaseUser');
fs.writeFileSync('src/App.tsx', appFile);

let profileFile = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');
profileFile = profileFile.replace(/Firebase User/gi, 'Supabase User');
profileFile = profileFile.replace(/FirebaseUser/g, 'SupabaseUser');
fs.writeFileSync('src/components/ProfileView.tsx', profileFile);

let authModalFile = fs.readFileSync('src/components/modals/AuthModal.tsx', 'utf8');
authModalFile = authModalFile.replace(/Firebase Console/g, 'Supabase Dashboard');
authModalFile = authModalFile.replace(/ระบบ Firebase/g, 'ระบบ Supabase');
authModalFile = authModalFile.replace(/Firebase/gi, 'Supabase');
fs.writeFileSync('src/components/modals/AuthModal.tsx', authModalFile);

let authViewFile = fs.readFileSync('src/components/AuthView.tsx', 'utf8');
authViewFile = authViewFile.replace(/Firebase/gi, 'Supabase');
fs.writeFileSync('src/components/AuthView.tsx', authViewFile);
