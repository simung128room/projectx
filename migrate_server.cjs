const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(/import \{ initializeApp \} from 'firebase\/app';/g, "");
serverCode = serverCode.replace(/import \{ getFirestore.*\} from 'firebase\/firestore';/g, "import { adminDb as admin } from './src/lib/admindb';");
serverCode = serverCode.replace(/import \{ getAuth, signInAnonymously \} from 'firebase\/auth';/g, "");
serverCode = serverCode.replace(/import admin from 'firebase-admin';/g, "");

const startIndex = serverCode.indexOf('const firebaseConfig = {');
const endIndex = serverCode.indexOf('const app = express();');

if (startIndex !== -1 && endIndex !== -1) {
  serverCode = serverCode.substring(0, startIndex) + `
console.log('[Server] --- Supabase VERSION REBOOT ---');
` + serverCode.substring(endIndex);
}

serverCode = serverCode.replace(/const adminDoc = await getDoc\(doc\(db, 'admins', req\.user\.uid\)\);/g, "const adminDoc = await admin.firestore().collection('admins').doc(req.user.uid).get();");
serverCode = serverCode.replace(/req\.isAdmin = adminDoc\.exists\(\);/g, "req.isAdmin = adminDoc.exists;");
serverCode = serverCode.replace(/req\.isAdmin = adminDoc\.exists;/g, "req.isAdmin = !!adminDoc.exists;"); // safe cast

fs.writeFileSync('server.ts', serverCode);
