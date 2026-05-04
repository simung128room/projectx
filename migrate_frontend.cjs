const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
appCode = appCode.replace(/import \{ auth \} from '\.\/lib\/firebase';/g, "import { supabase as auth } from './lib/supabase'; // auth here refers to supabase");
appCode = appCode.replace(/import \{ onAuthStateChanged, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut, sendEmailVerification \} from 'firebase\/auth';/g, "");
appCode = appCode.replace(/import \{ User as FirebaseUser \} from 'firebase\/auth';/g, "type FirebaseUser = any;");

// Auth interceptor
appCode = appCode.replace(/if \(auth && auth\.currentUser\) \{[\s\S]*?const token = await auth\.currentUser\.getIdToken\(\);[\s\S]*?config\.headers\['Authorization'\] = `Bearer \$\{token\}`;[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\('Error fetching Firebase token:', err\);[\s\S]*?\}[\s\S]*?\}/g, 
`const { data: { session } } = await auth.auth.getSession();
  if (session?.access_token) {
    try {
      const token = session.access_token;
      config.headers['Authorization'] = \`Bearer \${token}\`;
    } catch (err) {
      console.error('Error fetching token:', err);
    }
  }`);

// Auth state listener
appCode = appCode.replace(/const unsubscribe = onAuthStateChanged\(auth, async \(currentUser\) => \{/g,
  "const { data: { subscription } } = auth.auth.onAuthStateChange(async (event, session) => {\nconst currentUser: any = session?.user || null;\nif (currentUser) currentUser.uid = currentUser.id;");
appCode = appCode.replace(/return \(\) => unsubscribe\(\);/g, "return () => subscription?.unsubscribe();");

// Sign In Anonymously
appCode = appCode.replace(/await firebaseSignInAnonymously\(auth\);/g, "await auth.auth.signInAnonymously();");

// Sign Out
appCode = appCode.replace(/await firebaseSignOut\(auth\);/g, "await auth.auth.signOut();");

fs.writeFileSync('src/App.tsx', appCode);

// AuthView.tsx
let authView = fs.readFileSync('src/components/AuthView.tsx', 'utf8');
authView = authView.replace(/import \{ auth \} from '\.\.\/lib\/firebase';/g, "import { supabase as auth } from '../lib/supabase';");
authView = authView.replace(/import \{ createUserWithEmailAndPassword, signInWithEmailAndPassword \} from 'firebase\/auth';/g, "");
authView = authView.replace(/await createUserWithEmailAndPassword\(auth, signupEmail, authPassword\);/g, "await auth.auth.signUp({ email: signupEmail, password: authPassword });");
authView = authView.replace(/await signInWithEmailAndPassword\(auth, loginEmail, authPassword\);/g, "await auth.auth.signInWithPassword({ email: loginEmail, password: authPassword });");
fs.writeFileSync('src/components/AuthView.tsx', authView);

// AuthModal.tsx
let authModal = fs.readFileSync('src/components/modals/AuthModal.tsx', 'utf8');
authModal = authModal.replace(/import \{ auth \} from '\.\.\/\.\.\/lib\/firebase';/g, "import { supabase as auth } from '../../lib/supabase';");
authModal = authModal.replace(/import \{ createUserWithEmailAndPassword, signInWithEmailAndPassword \} from 'firebase\/auth';/g, "");
authModal = authModal.replace(/await createUserWithEmailAndPassword\(auth, signupEmail, authPassword\);/g, "await auth.auth.signUp({ email: signupEmail, password: authPassword });");
authModal = authModal.replace(/await signInWithEmailAndPassword\(auth, loginEmail, authPassword\);/g, "await auth.auth.signInWithPassword({ email: loginEmail, password: authPassword });");
fs.writeFileSync('src/components/modals/AuthModal.tsx', authModal);
