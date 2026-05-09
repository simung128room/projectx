const https = require('https');
const fs = require('fs');

const files = [
  'index.js',
  'database.js',
  'bot_config.js',
  'package.json'
];

files.forEach(file => {
  https.get(`https://raw.githubusercontent.com/simung128room/Dek123/main/${file}`, (res) => {
    res.pipe(fs.createWriteStream(`twer_temp/${file}`));
  });
});
