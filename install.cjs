const {spawnSync} = require('child_process');
const path = require('path');
const result = spawnSync('npm.cmd', ['install'], {
  cwd: path.resolve(__dirname),
  stdio: 'inherit',
  shell: false
});
process.exit(result.status || 0);
