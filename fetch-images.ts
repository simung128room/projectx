import https from 'https';

const urls = [
  'https://pic.in.th/image/IMG-6321.UZMz2v',
  'https://pic.in.th/image/IMG-6322.UZMTeH',
  'https://pic.in.th/image/IMG-6323.UZMaiC',
  'https://pic.in.th/image/IMG-6324.UZMMBt',
  'https://pic.in.th/image/IMG-6325.UZMZxy'
];

async function getDirectUrl(pageUrl) {
  return new Promise((resolve) => {
    https.get(pageUrl, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="(.*?)"/);
        resolve(match ? match[1] : null);
      });
    });
  });
}

async function main() {
  for (const url of urls) {
    const directUrl = await getDirectUrl(url);
    console.log(directUrl);
  }
}

main();
