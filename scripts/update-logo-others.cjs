const fs = require('fs');

const authViewPath = 'src/components/AuthView.tsx';
let authContent = fs.readFileSync(authViewPath, 'utf8');
const oldAuthLogo = 'https://i.postimg.cc/3wDpxHPp/D7D8FA4A-524D-480E-9BF3-8451C296F760.png';
const newLogoUrl = 'https://i.postimg.cc/J0rFVmMJ/file-00000000479471fab8f294ee09f67d3f.png';

if (authContent.includes(oldAuthLogo)) {
  authContent = authContent.replace(new RegExp(oldAuthLogo, 'g'), newLogoUrl);
  fs.writeFileSync(authViewPath, authContent);
  console.log('Updated AuthView.tsx');
}

const sunnyPath = 'src/components/SunnyComponents.tsx';
let sunnyContent = fs.readFileSync(sunnyPath, 'utf8');
const oldSunnyLogo = 'https://img2.pic.in.th/IMG_7319.png';

if (sunnyContent.includes(oldSunnyLogo)) {
  sunnyContent = sunnyContent.replace(new RegExp(oldSunnyLogo, 'g'), newLogoUrl);
  fs.writeFileSync(sunnyPath, sunnyContent);
  console.log('Updated SunnyComponents.tsx');
}
