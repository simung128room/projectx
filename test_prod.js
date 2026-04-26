import { execSync, spawn } from 'child_process';
try {
  execSync('npm run build', { stdio: 'inherit' });
  const server = spawn('npx', ['tsx', 'server.ts'], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit'
  });
  
  setTimeout(() => {
    server.kill();
    console.log('Test finished');
  }, 5000);
} catch (e) {
  console.error(e);
}
