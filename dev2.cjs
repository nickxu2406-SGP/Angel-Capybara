const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Starting development server...');
  const result = execSync('npm.cmd run dev', {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    shell: false
  });
  console.log('Dev server completed');
} catch (error) {
  console.error('Dev server error:', error.message);
  process.exit(1);
}
