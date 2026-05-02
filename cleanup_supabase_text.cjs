const fs = require('fs');

let adminFile = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
adminFile = adminFile.replace(/Connected \(Supabase\)/g, 'Connected (Firebase)');
fs.writeFileSync('src/components/AdminDashboard.tsx', adminFile);

let appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace(/Supabase User/g, 'Firebase User');
appFile = appFile.replace(/Supabase/g, 'Firebase');
fs.writeFileSync('src/App.tsx', appFile);

let profileFile = fs.readFileSync('src/components/ProfileView.tsx', 'utf8');
profileFile = profileFile.replace(/Supabase User/gi, 'Firebase User');
profileFile = profileFile.replace(/SupabaseUser/g, 'FirebaseUser');
fs.writeFileSync('src/components/ProfileView.tsx', profileFile);

// Also replace SupabaseUser in App.tsx
appFile = fs.readFileSync('src/App.tsx', 'utf8');
appFile = appFile.replace(/SupabaseUser/g, 'FirebaseUser');
fs.writeFileSync('src/App.tsx', appFile);

let authModalFile = fs.readFileSync('src/components/modals/AuthModal.tsx', 'utf8');
authModalFile = authModalFile.replace(/Supabase Dashboard/g, 'Firebase Console');
authModalFile = authModalFile.replace(/ระบบ Supabase/g, 'ระบบ Firebase');
fs.writeFileSync('src/components/modals/AuthModal.tsx', authModalFile);
