const fs = require('fs');

const oldName = 'QUIXYSHOP';
const newName = 'ZEROSHOP';
const oldLogo = 'https://i.postimg.cc/23R21z5h/file-0000000058c07207a33e20ff92690f16.png';
const newLogo = 'https://img1.pic.in.th/images/1000045512.png';

const files = [
  'src/components/AuthView.tsx',
  'src/components/SunnyComponents.tsx',
  'src/components/PolicyViews.tsx',
  'src/components/ContactView.tsx',
  'src/components/HomeView.tsx',
  'src/App.tsx',
  'src/routes/auth.route.ts',
  'index.html'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;
    
    if (content.includes(oldLogo)) {
      content = content.replace(new RegExp(oldLogo, 'g'), newLogo);
      updated = true;
    }
    
    if (content.includes(oldName)) {
      content = content.replace(new RegExp(oldName, 'g'), newName);
      updated = true;
    }
    
    // Check for lowercase variations in some places
    if (content.includes('quixyshop')) {
      content = content.replace(new RegExp('quixyshop', 'g'), 'zeroshop');
      updated = true;
    }

    // Also check for QUIXYSHOP.COM vs ZEROSHOP.COM
    
    if (updated) {
      fs.writeFileSync(file, content);
      console.log('Replaced in ' + file);
    }
  }
});
