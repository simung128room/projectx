const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Replace standard collection actions
code = code.replace(/await addDoc\(collection\(db, '([^']+)'\), (.*?)\);/g, "await admin.firestore().collection('$1').add($2);");
code = code.replace(/const docRef = doc\(db, '([^']+)', ([^)]+)\);/g, "const docRef = admin.firestore().collection('$1').doc($2);");
code = code.replace(/await getDoc\(docRef\);/g, "await docRef.get();");
code = code.replace(/const userRef = doc\(db, '([^']+)', ([^)]+)\);/g, "const userRef = admin.firestore().collection('$1').doc($2);");
code = code.replace(/await getDoc\(userRef\);/g, "await userRef.get();");

code = code.replace(/await updateDoc\(userRef/g, "await userRef.update");
code = code.replace(/await updateDoc\(docRef/g, "await docRef.update");
code = code.replace(/await deleteDoc\(doc\(db, '([^']+)', ([^)]+)\)\);/g, "await admin.firestore().collection('$1').doc($2).delete();");
code = code.replace(/await setDoc\(docRef, (.*?), { merge: true }\);/g, "await docRef.set($1, { merge: true });");
code = code.replace(/await setDoc\(docRef, (.*?)\);/g, "await docRef.set($1);");
code = code.replace(/await getDocs\(query\(collection\(db, '([^']+)'\)\)\);/g, "await admin.firestore().collection('$1').get();");
// Fix the docRef.id issue because the response of .add() is a DocumentReference
code = code.replace(/const docRef = await admin\.firestore\(\)\.collection\('([^']+)'\)\.add\((.*?)\);\n.*?res\.json\({ (?:id|dbId): docRef\.id, \.\.\.(.*?) }\);/g, 
`const docRef = await admin.firestore().collection('$1').add($2);
      res.json({ id: docRef.id, dbId: docRef.id, ...$3 });`);

// Cleanup specific usages
code = code.replace(/if \(!db\) return/g, "if (!admin.firestore()) return");

fs.writeFileSync('server.ts', code);
