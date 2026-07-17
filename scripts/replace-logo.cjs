const fs = require('fs');

const oldLogo = 'https://i.postimg.cc/J0rFVmMJ/file-00000000479471fab8f294ee09f67d3f.png';
const newLogo = 'https://i.postimg.cc/23R21z5h/file-0000000058c07207a33e20ff92690f16.png';

const files = [
  'src/components/AuthView.tsx',
  'src/components/SunnyComponents.tsx',
  'src/App.tsx',
  'index.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldLogo)) {
    content = content.replace(new RegExp(oldLogo, 'g'), newLogo);
    fs.writeFileSync(file, content);
    console.log('Replaced logo in ' + file);
  }
});
