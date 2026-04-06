const { execSync } = require('child_process');
const path = require('path');

try {
  const result = execSync('npm.cmd install', {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    shell: false
  });
  console.log('Install completed');
} catch (error) {
  console.error('Install failed:', error.message);
  process.exit(1);
}
